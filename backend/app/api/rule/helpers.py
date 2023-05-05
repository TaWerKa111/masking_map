from flask_sqlalchemy import Pagination

from app import db
from common.postgres.models import (
    Rule,
    RuleProtection,
    Criteria,
    Question,
    QuestionAnswer,
    TypeWork,
    Location,
    TypeLocation, CriteriaLocation, CriteriaTypeWork, CriteriaTypeLocation,
    CriteriaQuestion,
)


def add_rule(name: str) -> Rule:
    """
    Добавление правила
    :param name: str,
        название правила
    :return: Rule
    """
    rule = Rule(name=name)

    db.session.add(rule)
    db.session.commit()
    return rule


def add_criteria(name: str, type_criteria: Criteria.TypeCriteria) -> Criteria:
    """
    Добавление критерия
    :param name: str,
        название критерия
    :param type_criteria:  Criteria.TypeCriteria,
        тип критерия
    :return: Criteria
    """

    criteria = Criteria(name=name, type_criteria=type_criteria)

    db.session.add(criteria)
    db.session.commit()
    return criteria


def add_question(text: str) -> Question:
    """
    Добавление вопроса

    :param text: str,
        текст вопроса
    :return:  Question
    """
    question = Question(text=text)
    db.session.add(question)
    db.session.commit()
    return question


def add_question_answer(text: str, id_question: int) -> QuestionAnswer:
    """
    Добавление ответа к вопросу

    :param text: str,
        текст ответа
    :param id_question: int,
        идентификатор вопроса, к которому принадлежит ответ
    :return:
    """
    answer = QuestionAnswer(text=text, id_question=id_question)
    db.session.add(answer)
    db.session.commit()
    return answer


def add_new_rule(
    name_rule,
    type_work: TypeWork,
    location: Location,
    type_location: TypeLocation,
    questions: list[dict],
    protections: list[dict],
) -> Rule:
    """
    Добавление нового правила со всеми критериями и защитами к нему

    :param name_rule: str,
        название правила
    :param type_work: TypeWork
        объект "Тип Работы"
    :param location: Location
        локация для которой строится правило
    :param type_location: TypeLocation
        тип локации
    :param questions: list[dict]
        список вопросов для правила
    :param protections: list[dict]
        список защит, на которые воздействует правило
    :return: Rule
    """
    def get_criteria(type_criteria, field, model_id):
        NAMES = {
            Criteria.TypeCriteria.type_work: {
                "name": "Критерий работы",
                "model": CriteriaTypeWork
            },
            Criteria.TypeCriteria.location: {
                "name": "Критерий локации",
                "model": CriteriaLocation
            },
            Criteria.TypeCriteria.type_location: {
                "name": "Критерий типа локации",
                "model": CriteriaTypeLocation
            },
        }

        criteria = (
            db.session.query(NAMES[type_criteria]["model"])
            .filter(
                NAMES[type_criteria]["model"].__dict__.get(field) == model_id)
            .first()
        )

        if not criteria:
            criteria = add_criteria(
                NAMES[type_criteria]["name"],
                type_criteria
            )

        return criteria

    rule = add_rule(name_rule)

    criteria_work = add_criteria(
        "Критерий работы", Criteria.TypeCriteria.type_work
    )
    criteria_location = add_criteria(
        "Критерий локации", Criteria.TypeCriteria.location
    )
    criteria_type_location = add_criteria(
        "Критерий типа локации", Criteria.TypeCriteria.type_location
    )

    criteria_work.works.append(type_work)
    criteria_location.locations.append(location)
    criteria_type_location.locations_type.append(type_location)

    questions_list = []
    right_answers = dict()
    for question_data in questions:
        question = add_question(question_data.get("text"))
        for answer_data in question_data.get("answers"):
            answer = add_question_answer(
                answer_data.get("text"), id_question=question.id
            )
            if answer_data.get("is_right_answer"):
                right_answers[question.id] = answer.id
        questions_list.append(question)

    rule.criteria.extend(
        [criteria_work, criteria_location, criteria_type_location]
    )
    criteria_question = add_criteria(
        "Критерий вопросов", Criteria.TypeCriteria.question
    )
    rule.criteria.append(criteria_question)

    for question in questions_list:
        qu_ans = CriteriaQuestion(
            id_question=question.id,
            id_criteria=criteria_question.id,
            id_right_answer=right_answers[question.id]
        )
        db.session.add(qu_ans)
        db.session.commit()

    for protection in protections:
        rule_protection = RuleProtection(
            id_rule=rule.id,
            id_protection=protection.get("id"),
            is_need_masking=protection.get("is_need_masking"),
            is_need_demasking=protection.get("is_need_demasking"),
        )
        db.session.add(rule_protection)
        db.session.commit()

    db.session.commit()
    return rule


def get_location_work_type_location_type(
    location_id, type_work_id, type_location_id
):
    """
    Получить локацию, тип работы и тип локации
    :param location_id: int,
        идентификатор локации
    :param type_work_id: int,
        идентификатор типа работы
    :param type_location_id: int,
        идентификатор типа локации
    :return:
    """
    location = (
        db.session.query(Location).filter(Location.id == location_id).first()
    )

    type_work = (
        db.session.query(TypeWork).filter(TypeWork.id == type_work_id).first()
    )

    type_location = (
        db.session.query(TypeLocation)
        .filter(TypeLocation.id == type_location_id)
        .first()
    )

    return location, type_work, type_location


def get_rule(rule_id: int) -> Rule:
    """
    Получить правило по идентификатору

    :param rule_id: int,
        идентификатор правила
    :return: Rule
    """
    rule = db.session.query(Rule).filter(Rule.id == rule_id).first()

    return rule


def filter_list_rule(
        rules_ids: list[int], name: str,
        page: int = 1, limit: int = 10
) -> Pagination:
    """
    Получить список правил с пагинацией
    :param rules_ids: list[int]
        список идентификаторов правил
    :param name: str
        название правила
    :param page: int = 1
        номер страницы
    :param limit: int = 10
        количество строк на странице
    :return: Pagination
    """
    query = db.session.query(Rule)

    if rules_ids:
        query = query.filter(Rule.id.in_(rules_ids))
    if name:
        filter_name = f"%{name}%"
        query = query.filter(Rule.name.ilike(filter_name))

    result = query.paginate(page=page, per_page=limit, error_out=False)
    return result


def update_rule(
    rule_id: int,
    name_rule: str,
    type_work: TypeWork,
    location: Location,
    type_location: TypeLocation,
    questions: list[dict],
    protections: list[dict],
) -> Rule or None:
    """
    Изменение правила, его критериев и списка защит

    :param rule_id: int,
        идентификатор правила
    :param name_rule: str,
        название правила
    :param type_work: TypeWork,
        объект "Тип Работы"
    :param location: Location,
        локация, для которой строится правило
    :param type_location: TypeLocation,
        тип локации.
    :param questions: list[dict],
        список вопросов для правила
    :param protections: list[dict],
        список защит, на которые воздействует правило
    :return: Rule
    """

    rule = get_rule(rule_id)

    if not rule:
        return None
    if name_rule:
        rule.name = name_rule

    criteria_work = add_criteria(
        "Критерий работы", Criteria.TypeCriteria.type_work
    )
    criteria_location = add_criteria(
        "Критерий локации", Criteria.TypeCriteria.location
    )
    criteria_type_location = add_criteria(
        "Критерий типа локации", Criteria.TypeCriteria.type_location
    )

    criteria_work.works.append(type_work)
    criteria_location.locations.append(location)
    criteria_type_location.locations_type.append(type_location)

    questions_list = []
    if questions:
        for question_data in questions:
            question = add_question(question_data.get("text"))
            for answer_data in question_data.get("answers"):
                add_question_answer(
                    answer_data.get("text"), id_question=question.id
                )
            questions_list.append(question)

    rule.criteria.extend(
        [criteria_work, criteria_location, criteria_type_location]
    )
    criteria_question = add_criteria(
        "Критерий вопросов", Criteria.TypeCriteria.question
    )

    rule.criteria.append(criteria_question)

    if protections:
        for protection in protections:
            rule_protection = RuleProtection(
                id_rule=rule.id,
                id_protection=protection.get("id"),
                is_need_masking=protection.get("is_need_masking"),
                is_need_demasking=protection.get("is_need_demasking"),
            )
            db.session.add(rule_protection)
            db.session.commit()

    db.session.commit()
    return rule
