import json
import logging
from enum import Enum
from typing import NamedTuple

from marshmallow import Schema, fields
from redis.client import Redis
from sqlalchemy import or_, and_

from app import db
from app.api.helpers.exceptions import NoRuleException
from app.api.map_file.schemas import ObjectSchema
from app.api.rule.schema import (
    RuleSchema,
    QuestionSchema,
    MaskingCriteriaSchema,
)
from common.postgres.models import (
    Criteria,
    CriteriaTypeWork,
    Rule,
    TypeWork,
    Question,
    CriteriaQuestion,
)
from config import AppConfig


def get_redis_client() -> Redis:
    redis_client = Redis(
        host=AppConfig.REDIS.HOST,
        port=AppConfig.REDIS.PORT,
        password=AppConfig.REDIS.PASSWORD,
        decode_responses=True,
    )
    return redis_client


def get_message_from_redis(mes_key):
    rc = get_redis_client()
    message = rc.get(mes_key)
    if not message:
        return dict()
    return json.loads(message)


def set_message_to_redis(mes_key, data):
    rc = get_redis_client()
    rc.set(mes_key, json.dumps(data))


class QuestionParam(NamedTuple):
    id: int
    answer_id: int
    question_number: int


class StageEnum(Enum):
    type_work = "type_work"
    location = "location"
    type_location = "type_location"
    question = "question"
    result = "result"


STAGE_PARAMS = {
    "type_work_ids": StageEnum.type_work.value,
    "location_ids": StageEnum.location.value,
    "type_location_ids": StageEnum.type_location.value,
    "questions": StageEnum.question.value,
}

TYPE_CRITERIA = {
    "type_work": "type_works",
    "location": "locations",
    "type_location": "locations_type",
    "question": "questions",
}

PREV_STAGES = {
    "type_work": StageEnum.type_work.value,
    "location": StageEnum.type_work.value,
    "type_location": StageEnum.location.value,
    "question": StageEnum.type_location.value,
    "result": StageEnum.question.value,
}

PARAMS_FIELDS = {
    "type_work": "type_work_ids",
    "location": "location_ids",
    "type_location": "type_location_ids",
    "question": "questions",
}


class UserParams(NamedTuple):
    type_work_ids: list[int]
    location_ids: list[int] = None
    type_location_ids: list[int] = None
    questions: list[QuestionParam] = None


class UserParamsSchema(Schema):
    type_work_ids = fields.List(fields.Integer())
    location_ids = fields.List(fields.Integer())
    type_location_ids = fields.List(fields.Integer())
    questions = fields.List(fields.Dict())


class RuleData(NamedTuple):
    id: int
    criteria: list[dict]
    is_deleted: bool


class NotValidRules(NamedTuple):
    rule_ids: list[int]
    rule_ids_by_stage: list[dict]


class StateData(NamedTuple):
    rules: list[dict]
    user_params: UserParams
    stage: str
    not_valid_rule: NotValidRules
    stages: list[str]
    logic_machine_path: dict[str, str]


class StateCache:
    """
    Получение информации о состоянии системы для генерации карты маскирования.
    Кэш хранится в redis.
    Для состояния генерации используются типы критериев.
    Также каждое уточняющее условие(вопрос) является отдельным критерием.
    """

    logic_key = "logic_machine_path"
    nvr = "not_valid_rule"
    rules = "rules"
    up = "user_params"
    stage = "stage"
    stages = "stages"

    def __init__(self, state_uuid, logger=None):
        self.state_data = get_message_from_redis(state_uuid)
        self.state_uuid = state_uuid
        self.protections = None
        self.result = False
        self.logger = logger or logging.getLogger(__name__)

    def add_rules_by_type_work(self, twi_list):
        """
        Добавление правил в state_data. Используется при инициализации
        если кэша еще не было или нужно добавить правил, если были изменены
        виды работ.
        Отравляется sql запрос на получение правил и их сериализация в  dict

        :param twi_list:
        :return:
        """
        tw_criteria = (
            db.session.query(Criteria)
            .outerjoin(
                CriteriaTypeWork, Criteria.id == CriteriaTypeWork.id_criteria
            )
            .filter(
                or_(
                    CriteriaTypeWork.id_type_work.in_(twi_list),
                    and_(
                        Criteria.type_criteria
                        == Criteria.TypeCriteria.type_work,
                        Criteria.is_any.is_(True),
                    ),
                )
            )
        )
        rules = (
            db.session.query(Rule)
            .join(Criteria, Criteria.rule_id == Rule.id)
            .filter(
                Criteria.id.in_([cr.id for cr in tw_criteria]),
            )
            .all()
        )
        rules = RuleSchema(many=True).dump(rules)

        for rule in rules:
            self.logger.debug(f"rule - {rule}")
            for cr in rule.get("criteria"):
                if (
                    cr.get("type_criteria")
                    == Criteria.TypeCriteria.question.value
                    and cr.get("is_any") is False
                ):
                    self.logger.debug(f"criteria question - {cr}")
                    rules_questions = dict()
                    query = db.session.query(Question, CriteriaQuestion)
                    temp_query = query.join(
                        CriteriaQuestion,
                        CriteriaQuestion.id_question == Question.id,
                    ).join(
                        Criteria, Criteria.id == CriteriaQuestion.id_criteria
                    )
                    data_question = temp_query.filter(
                        Criteria.rule_id == rule.get("id")
                    ).all()
                    rules_questions.setdefault(rule.get("id"), data_question)

                    questions = list()
                    exists_questions = set()

                    for rule_id in rules_questions:
                        for question, cr_que in rules_questions.get(rule_id):
                            if question.id not in exists_questions:
                                exists_questions.add(question.id)
                                questions.append(
                                    {
                                        "id": question.id,
                                        "text": question.text,
                                        "answers": question.answers,
                                        "id_right_answer": cr_que.id_right_answer,
                                        "rule_id": rule_id,
                                        "number_question": cr_que.number_question,
                                    }
                                )
                    cr["questions"] = QuestionSchema(many=True).dump(questions)

        self.state_data["rules"] = rules
        self.state_data[self.logic_key] = dict(
            type_work=f"Было выбрано {len(rules)} правил."
        )

    def get_count_suitable_rules(self):
        """
        Подсчет количества подходящих правил
        :return:
        """
        count = 0
        for rule in self.state_data["rules"]:
            if rule.get("id") not in self.state_data.get(self.nvr):
                count += 1
        return count

    def handler_stage_location(self, criteria):
        """
        Обработка этапа места проведения работ. Выбираем все локации из
        полученных критериев в один список, и создаем один критерий на их
        основе.

        :param criteria:
        :return:
        """
        count_rules = self.get_count_suitable_rules()
        result_criteria = {
            "type_criteria": "location",
            "locations": list(),
        }
        for cr in criteria:
            self.logger.debug(f"cr loc - {cr}")
            self.logger.debug(f"cr loc - {cr.get('locations')}")
            result_criteria["locations"].extend(cr.get("locations"))
        if result_criteria:
            self.logger.debug(f"cr loc - {result_criteria}")
            result_criteria["locations"].append(
                {"name": "Другое", "id": AppConfig.ANOTHER_ID}
            )
            self.state_data[self.logic_key][self.state_data[self.stage]] = (
                f"Осталось правил: {count_rules}. По ним подобрано "
                f"{len(result_criteria['locations'])} мест проведения работ"
            )
            return result_criteria
        return None

    def handler_stage_type_location(self, criteria):
        """
        Обработка этапа тип локации. Типы локаций объединяются в один список
        за всех критериев и создается только один критерий.
        :param criteria:
        :return:
        """
        count_rules = self.get_count_suitable_rules()
        type_locations = list()
        for cr in criteria:
            type_locations.extend(cr.get("locations_type"))
        if type_locations:
            type_locations.append({"name": "Другой", "id": AppConfig.ANOTHER_ID})
            self.state_data[self.logic_key][self.state_data[self.stage]] = (
                f"Осталось правил: {count_rules}. По ним подобрано "
                f"{len(type_locations)} типов мест проведения работ"
            )
            return dict(
                type_criteria="location",
                locations_type=list(),
            )
        return None

    def handler_stage_question(self, criteria):
        """
        Обработка этапа вопрос. Выбирается первый вопрос и на основе него
        создается критерий.
        :param criteria:
        :return:
        """
        count_rules = self.get_count_suitable_rules()
        self.logger.debug(f"handler question - criteria {criteria}")
        questions = []
        for cr in criteria:
            questions.extend(cr.get("questions"))
        used_questions = dict()
        self.logger.debug(f"handle question cr question - {questions}")

        questions.sort(key=lambda dictionary: dictionary["number_question"])

        for ind, question in enumerate(questions):
            if question.get("id") in used_questions:
                used_questions[question.get("id")]["count"] += 1
            else:
                used_questions.setdefault(
                    question.get("id"),
                    {
                        "number_question": question.get("number_question"),
                        "count": 0,
                        "ind": ind,
                    },
                )
        sorted_questions = dict(
            sorted(used_questions.items(), key=lambda item: item[1]["count"], reverse=True)
        )
        self.logger.debug(f"sorted_question - {sorted_questions}")
        # criteria_data = criteria[0]
        # question = criteria_data.get("questions")[0]
        data_question = list(sorted_questions.values())[0]
        question = questions[data_question["ind"]]
        criteria_data = {"type_criteria": "questions", "questions": [question]}
        self.state_data["stage"] = f"question.{question.get('id')}"
        self.logger.debug(f"handler question - {criteria_data}")
        self.state_data[self.logic_key][self.state_data[self.stage]] = (
            f"Осталось правил: {count_rules}. По ним подобрано "
            f"{len(sorted_questions)} вопросов."
        )
        return criteria_data

    def handler_stage_type_work(self):
        """
        Обработка этапа вид работ. Отправляется запрос на получение списка
        видов работ, и на его основе создается критерий с типом "вид работы".
        :return:
        """
        twi = db.session.query(CriteriaTypeWork.id_type_work).distinct()
        type_works = (
            db.session.query(TypeWork).filter(TypeWork.id.in_(twi)).all()
        )
        criteria = {"type_criteria": "type_work", "type_works": type_works}
        return criteria

    def delete_rules(self, stage, rule_ids):
        """
        Удаление правила, если оно не подходит. Правила добавляется в список
        удаленных, а также добавляется в список "удаленные по этапам",
        где stage название текущего этапа, а rule_ids список удаленных правил

        :param stage:
        :param rule_ids:
        :return:
        """
        rule_ids = list(set(rule_ids))
        not_valid_rule: dict = self.state_data.get("not_valid_rule")
        if not not_valid_rule:
            not_valid_rule = {"rule_ids": [], "rule_ids_by_stage": []}
        not_valid_rule["rule_ids"].extend(rule_ids)
        # not_valid_rule["rule_ids"] = list(set(not_valid_rule["rule_ids"]))
        not_valid_rule["rule_ids_by_stage"].append(
            {"stage": stage, "rule_ids": rule_ids}
        )
        self.logger.debug(f"delete rules - {not_valid_rule}")
        self.state_data["not_valid_rule"] = not_valid_rule

    def validate_rules(self, stage, params):
        """
        Проверка оставшихся правил. Правила проверяются для данного этапа.
        Не подходящие правила удаляются.
        :param stage:
        :param params:
        :return:
        """

        def validate_list():
            for rule in self.state_data.get("rules"):
                for criteria in rule.get("criteria"):
                    if criteria.get("is_any") is True:
                        continue
                    cr_type = criteria.get("type_criteria")
                    # Валидация для типа работы и локации
                    if cr_type == stage:
                        if params.get(PARAMS_FIELDS.get(cr_type)):
                            items_id = [
                                item.get("id")
                                for item in criteria.get(
                                    TYPE_CRITERIA.get(cr_type)
                                )
                            ]
                            for item_id in params.get(
                                PARAMS_FIELDS.get(cr_type), []
                            ):
                                if item_id in items_id:
                                    break
                            else:
                                not_valid_rules.append(rule.get("id"))

        def validate_question():
            for rule in self.state_data.get("rules"):
                for criteria in rule.get("criteria"):
                    if criteria.get("is_any") is True:
                        continue
                    cr_type = criteria.get("type_criteria")
                    self.logger.debug(f"cr_type question - {cr_type}")
                    if cr_type == abs_stage:
                        for que in criteria.get(TYPE_CRITERIA.get(cr_type)):
                            for que_param in params.get(
                                TYPE_CRITERIA.get(cr_type)
                            ):
                                self.logger.debug(
                                    f"que_param - {que_param} - que - {que}"
                                )
                                if que.get("id") == que_param.get(
                                    "id"
                                ) and que.get(
                                    "id_right_answer"
                                ) != que_param.get(
                                    "answer_id"
                                ):
                                    not_valid_rules.append(rule.get("id"))

        not_valid_rules = list()
        self.logger.debug(f"validate stage - {stage}")
        abs_stage = stage.split(".")[0]
        if abs_stage == StageEnum.question.value:
            self.logger.debug(f"validate question")
            validate_question()
        else:
            validate_list()
        self.logger.debug(f"not valid rule - {not_valid_rules}")
        if not_valid_rules:
            self.delete_rules(stage, not_valid_rules)

        not_valid_rules = list()
        self.logger.debug(
            f"nvr state - {self.state_data.get('not_valid_rule', {})}"
        )
        for rule_id in self.state_data.get("not_valid_rule", {}).get(
            "rule_ids", []
        ):
            for rule in self.state_data.get("rules"):
                if rule_id == rule.get("id"):
                    not_valid_rules.append(rule_id)
        if not self.state_data.get("not_valid_rule"):
            self.state_data["not_valid_rule"] = {
                "rule_ids": [],
                "rule_ids_by_stage": [],
            }
        self.state_data["not_valid_rule"]["rule_ids"] = list(
            set(not_valid_rules)
        )
        self.logger.debug(
            f"stage not valid rule " f"- {self.state_data['not_valid_rule']}"
        )
        if len(self.state_data.get("rules")) > 0:
            if len(self.state_data.get("rules")) == len(
                self.state_data["not_valid_rule"].get("rule_ids")
            ):
                raise Exception("Not rules!")

    def get_next_stage(self, stage):
        if stage == "type_work":
            return StageEnum.location.value
        if stage == "location":
            return StageEnum.type_location.value
        if stage == "type_location":
            return StageEnum.question.value
        return StageEnum.result.value

    def get_criteria(self, stage, params):
        """
        Получение критериев для определенного этапа.
        Для типов локация и локаций выбираются критерии.
        Для вопросов выбираются только вопросы и на основе каждого создается
        критерий

        :param stage:
        :param params:
        :return:
        """

        def get_list_criteria():
            self.logger.debug(f"get cr - {stage}")
            criteria_list = list()

            for rule in self.state_data.get("rules"):
                self.logger.debug(f"rule - {rule}")
                if rule.get("id") in self.state_data.get(
                    "not_valid_rule", {}
                ).get("rule_ids", []):
                    continue
                self.logger.debug(f"get cr - {stage}")
                for criteria in rule.get("criteria"):
                    self.logger.debug(f"criteria - {criteria}")
                    if (
                        criteria.get("type_criteria") == stage
                        and criteria.get("is_any") is False
                    ):
                        criteria_list.append(criteria)
            return criteria_list

        def get_question_criteria():
            self.logger.debug(f"get cr - {stage}")
            criteria_list = list()
            asked_question = params.get("questions", [])
            if asked_question is None:
                asked_question = list()
            for rule in self.state_data.get("rules"):
                self.logger.debug(f"rule - {rule}")
                if rule.get("id") in self.state_data.get(
                    "not_valid_rule", {}
                ).get("rule_ids", []):
                    continue
                for criteria in rule.get("criteria"):
                    if (
                        criteria.get("type_criteria") == stage
                        and criteria.get("is_any") is False
                    ):
                        self.logger.debug(f"criteria check rule - {criteria}")
                        for que in criteria.get("questions"):
                            self.logger.debug(
                                f"question check rule - {que}, asked_question - {asked_question}"
                            )
                            if que.get("id") not in [
                                q["id"] for q in asked_question
                            ]:
                                self.state_data[
                                    "stage"
                                ] = f"question.{que.get('id')}"
                                criteria_list.append(
                                    {
                                        "type_criteria": "question",
                                        "questions": [que],
                                    }
                                )
            return criteria_list

        if stage == "question":
            return get_question_criteria()
        else:
            return get_list_criteria()

    def get_protections_by_rules_result(self):
        """
        Получение защит для оставшихся правил.
        :return:
        """
        protections = dict()
        for rule in self.state_data.get("rules"):
            if rule.get("id") not in self.state_data.get(
                "not_valid_rule", {}
            ).get("rule_ids", []):
                protections[rule["id"]] = rule.get("protections")
        return protections

    def get_prev_stage(self):
        if self.state_data.get("stages"):
            if len(self.state_data["stages"]) >= 1:
                return self.state_data["stages"][-1]
        return "type_work"

    def update_stages(self, stage):
        """
        Обновление истории этапов.
        :param stage:
        :return:
        """
        if not self.state_data.get("stages"):
            self.state_data["stages"] = [stage]
            return
        new_stages = list()
        self.logger.debug(
            f"update stages: stage - {stage}, "
            f"stages - {self.state_data.get('stages')}"
        )
        for name_stage in self.state_data["stages"]:
            if name_stage == stage:
                break
            new_stages.append(name_stage)
        new_stages.append(stage)
        self.state_data["stages"] = new_stages

    def recovery_rules(self, stage):
        """
        Восстановление правил, если параметры пользователя изменились
        :param stage:
        :return:
        """
        self.logger.debug(f"recovery rule - {stage}")
        nvr = self.state_data["not_valid_rule"]
        if not nvr.get("rule_ids"):
            return
        rule_ids = []
        del_rule_by_stages = list()
        stages = self.state_data.get("stages")
        for stage_data in nvr.get("rule_ids_by_stage"):
            if stage_data.get("stage") == stage:
                break
            if stage_data.get("stage") in stages:
                del_rule_by_stages.append(stage_data)
                rule_ids.extend(stage_data.get("rule_ids", []))
                self.logger.debug(f"recovery rule stage_data - {stage_data}")
        self.logger.debug(f"recovery rule nvr - {nvr}")
        self.state_data["not_valid_rule"]["rule_ids"] = rule_ids
        self.state_data["not_valid_rule"][
            "rule_ids_by_stage"
        ] = del_rule_by_stages

    def check_next_stage(self, user_params):
        """
        Проверка следующих этапов по параметрам пользователя.
        :param user_params:
        :return:
        """
        state_params = self.state_data.get("user_params")
        stage = None
        user_params = UserParamsSchema().dump(user_params)

        if self.state_data["stage"] != StageEnum.type_work.value:
            for param in user_params:
                if not user_params[param] and isinstance(user_params[param], list):
                    self.recovery_rules(self.state_data[self.stage])
                    stage = PREV_STAGES[STAGE_PARAMS[param]]
                    self.logger.debug(f"not user params [] - {user_params[param]}")
                    break
                self.logger.debug(f"param - {param}")
                if state_params.get(param):
                    self.logger.debug(
                        f"param value - {state_params[param]}, "
                        f"value - {user_params[param]}"
                    )
                    if param == "questions":
                        for que in user_params[param]:
                            for cache_que in state_params[param]:
                                self.logger.debug(
                                    f"que - {que}, " f"cache_que - {cache_que}"
                                )
                                if cache_que.get("id") == que.get(
                                    "id"
                                ) and cache_que.get("answer_id") != que.get(
                                    "answer_id"
                                ):
                                    stage = f"question.{que.get('id')}"
                                    self.logger.debug(
                                        f"update stage que - {stage}"
                                    )
                                    self.recovery_rules(stage)
                                    break
                    else:
                        l1 = user_params[param]
                        l2 = state_params[param]
                        if (
                            [x for x in l1 + l2 if x not in l1 or x not in l2]
                        ):
                            self.logger.debug(f"param is - {param}")
                            stage = STAGE_PARAMS[param]
                            self.recovery_rules(stage)
                            break
                else:
                    if isinstance(user_params[param], list) and (
                        user_params in ["location_ids", "type_location_ids"]
                    ):
                        self.logger.debug(f"param is - {param}")
                        stage = STAGE_PARAMS[param]
                        self.recovery_rules(stage)
                        break

        self.logger.debug(
            f"self_stage - {self.state_data['stage']}, stage - {stage}"
        )
        if stage:
            self.state_data["stage"] = stage

        self.logger.debug(
            f"self_stage - {self.state_data['stage']}, stage - {stage}"
        )
        # отсечь правила по текущему этапу, то есть критерию
        # проверить количество не подходящих правил
        # с их общим количеством, полученным в начале
        # если правила закончились то выдаем сообщение,
        # что нужно обратиться в отдел АСУТП
        self.logger.debug("Start validate rules!")
        self.update_stages(self.state_data.get("stage"))
        try:
            self.validate_rules(self.state_data.get("stage"), user_params)
        except Exception:
            raise NoRuleException("No rule!")

        # if exists next stage, чтобы его сделать текущим
        self.logger.debug("Start input criteria!")
        criteria = None
        next_stage = self.state_data.get("stage").split(".")[0]
        self.logger.debug(f"Criteria - {criteria}, next_stage - {next_stage}")

        # Для вопросов необходимо сначала проверить наличие
        # критериев так как каждый вопрос это отдельный критерий
        if next_stage == StageEnum.question.value:
            criteria = self.get_criteria(next_stage, user_params)

        while not criteria and next_stage != StageEnum.result.value:
            next_stage = self.get_next_stage(next_stage)
            self.logger.debug(
                f"Criteria - {criteria}, next_stage - {next_stage}"
            )
            criteria = self.get_criteria(next_stage, user_params)

        self.logger.debug(f"criteria after check - {criteria}")
        self.state_data["stage"] = next_stage

        if criteria:
            return criteria

    def dump_state(self):
        """
        Сохраняем состояние в redis
        :return:
        """
        set_message_to_redis(self.state_uuid, self.state_data)

    def check_rule(self, user_params: UserParams):
        """
        Проверка правил.
        :param user_params:
        :return:
        """

        description = ""
        stage = None
        result = None
        protections_list = list()
        if not self.state_data or not user_params.type_work_ids:
            self.add_rules_by_type_work(user_params.type_work_ids)
            self.state_data["stage"] = StageEnum.type_work.value
            stage_data = self.handler_stage_type_work()
        else:
            state_params = self.state_data.get("user_params", {})
            self.logger.debug(f"state_params - {state_params}")
            not_exist_twi = list()

            for twi in user_params.type_work_ids:
                self.logger.debug(f"twi - {twi}")
                if twi not in state_params.get("type_work_ids", []):
                    self.logger.debug(f"twi - {twi}")
                    not_exist_twi.append(twi)
                    self.logger.debug(
                        f"self_stage - {self.state_data.get('stage')}"
                    )

            if not_exist_twi:
                self.logger.debug(
                    f"update works - {user_params.type_work_ids}"
                )
                self.state_data["stage"] = StageEnum.type_work.value
                self.add_rules_by_type_work(user_params.type_work_ids)
            self.logger.debug(f"state_data - {self.state_data}")
            self.logger.debug("Start check next stage!")
            try:
                criteria = self.check_next_stage(user_params)

                self.state_data["user_params"] = UserParamsSchema().dump(
                    user_params
                )
                if criteria:
                    self.logger.debug(
                        f"Start handlers! Stage - {self.state_data['stage']}"
                    )
                    if self.state_data["stage"] == StageEnum.location.value:
                        stage_data = self.handler_stage_location(criteria)
                    elif (
                        self.state_data["stage"]
                        == StageEnum.type_location.value
                    ):
                        stage_data = self.handler_stage_type_location(criteria)
                    elif self.state_data["stage"] == StageEnum.question.value:
                        stage_data = self.handler_stage_question(criteria)
                    else:
                        stage_data = dict()
                    self.logger.debug(f"stage_data - {stage_data}")
                else:
                    self.logger.debug(
                        "not criteria, check rules if it exists!"
                    )
                    # если остались не удаленные правила,
                    # то они и подходят под запрос пользователя
                    self.protections = self.get_protections_by_rules_result()
                    protections_list = list()
                    for pr in list(self.protections.values()):
                        protections_list.extend(pr)

                    self.logger.debug(
                        f"protections - {list(self.protections.values())}")

                    if list(protections_list):
                        description = (
                            f"Маскирование нужно для защит "
                            f"{[p.get('name') for p in protections_list]}"
                        )
                    else:
                        description = "Маскирование не нужно"
                    stage_data = {
                        "result": True,
                        "protections": self.protections,
                    }
                    result = True
                    count_rules = self.get_count_suitable_rules()
                    result_rule = []
                    for rule_id in self.protections:
                        result_rule.append(
                            f"Правило {rule_id}: защиты "
                            f"{[r['name'] for r in self.protections[rule_id]]}."
                        )
                    self.state_data[self.logic_key][
                        self.state_data[self.stage]
                    ] = (
                        f"Критерии для правил закончились. В результате осталось"
                        f" {count_rules} правил. {''.join(result_rule)}"
                    )
                self.logger.debug("Complete check rules!")
            except NoRuleException as err:
                self.state_data["user_params"] = UserParamsSchema().dump(
                    user_params
                )
                self.logger.debug(f"err {err}", exc_info=True)
                description = "Обратитесь в отдел АСУТП!"
                stage_data = {"description": "Обратитесь в отдел АСУТП!"}
                stage = "result"
                stage_data = stage_data
                result = False
                self.state_data[self.logic_key][stage] = (
                    f"Нет подходящих правил под заданные критерии. Обратитесь "
                    f"в отдел АСУТП."
                )

        self.logger.debug(
            f"user_params - {self.state_data.get('user_params')}"
        )
        self.logger.debug(f"Result state_data - {self.state_data}")
        self.dump_state()

        self.logger.debug(f"stage_data - {stage_data}")

        result = {
            "criteria": stage_data,
            "stage": stage or self.state_data.get("stage"),
            "result": result,
            "description": description,
            "protections": protections_list,
            "prev_stage": self.get_prev_stage(),
            "logic_machine_answer": list(
                self.state_data[self.logic_key].values()
            ),
        }

        return MaskingCriteriaSchema().dump(result)
