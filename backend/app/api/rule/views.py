import http
from itertools import chain

from flask import Blueprint, request, current_app
from marshmallow import ValidationError

from app.api.helpers.exceptions import SqlAlchemyException
from app.api.helpers.messages import MESSAGES_DICT
from app.api.helpers.schemas import BinaryResponseSchema
from app.api.helpers.utils import serialize_paginate_object
from app.api.rule.helpers import (
    add_new_rule,
    get_filter_questions_for_gen_map,
    get_rule,
    filter_list_rule,
    update_rule,
    filter_list_question,
    get_question,
    add_question,
    add_question_answer,
    update_question,
    get_locations_work_types_location_types,
    delete_rule,
)
from app.api.rule.schema import (
    AddRuleSchema,
    GetRuleSchema,
    RuleSchema,
    FilterRulesSchema,
    RuleListSchema,
    UpdateRuleSchema,
    AddQuestionSchema,
    QuestionListSchema,
    QuestionSchema,
    GetQuestionSchema,
    FilterQuestionsSchema,
    UpdateQuestionSchema,
)

bp = Blueprint("rules_api", __name__, url_prefix="/api/rule/")


@bp.route("/rule/", methods=["POST"])
def add_rule_view() -> tuple[dict, int]:
    """

    :return:
    ---
    post:
        summary: Добавить правило формирования карт маскирования
        description: Добавление правила
        requestBody:
            content:
                app/json:
                    schema: AddRuleSchema
        responses:
            '200':
                description:
                content:
                    application/json:
                        schema: BinaryResponseSchema
            '400':
                description:
                content:
                    application/json:
                        schema: BinaryResponseSchema
        tags:
            - rule
    """

    def get_list_value(key, type_cr):
        criteria = [
            cr.get(key)
            for cr in rule.get("criteria")
            if cr.get("selected_type_criteria")
            and cr.get("selected_type_criteria").get("value") == type_cr
        ]
        result = []

        for tw in criteria:
            if tw:
                result.extend(tw)
        return result

    if not request.json:
        return (
            BinaryResponseSchema().dump(MESSAGES_DICT["NO_JSON"]),
            http.HTTPStatus.BAD_REQUEST,
        )

    data = request.json

    try:
        rule = AddRuleSchema().load(data)
    except ValidationError as err:
        current_app.logger.debug(
            f"Ошибка при валидации данных для схемы. {err}"
        )
        return (
            BinaryResponseSchema().dump(
                {"message": f"Ошибка валидации. {err}", "result": False}
            ),
            http.HTTPStatus.BAD_REQUEST,
        )
    except SqlAlchemyException as err:
        return (
            BinaryResponseSchema().dump({"message": err, "result": False}),
            http.HTTPStatus.BAD_REQUEST,
        )

    current_app.logger.debug(f"rule_data prot - {rule.get('protections')}")

    type_works = get_list_value("type_works", "type_work")
    questions = get_list_value("questions", "question")
    type_locations = get_list_value("type_locations", "type_location")
    locations = get_list_value("locations", "location")
    current_app.logger.debug(
        f"type_works - {type_works}, "
        f"question - {questions}\n"
        f"loca - {locations}\n"
        f"tl - {type_locations}\n"
    )

    (
        location,
        type_work,
        type_location,
    ) = get_locations_work_types_location_types(
        location_ids=[loc["id"] for loc in locations],
        type_work_ids=[tw["id"] for tw in type_works],
        type_location_ids=[tl["id"] for tl in type_locations],
    )

    add_new_rule(
        name_rule=rule.get("name"),
        type_works=type_work,
        locations=location,
        type_locations=type_location,
        questions=questions,
        protections=rule.get("protections"),
        compensatory_measures=rule.get("compensatory_measures"),
    )

    return BinaryResponseSchema().dump(
        {"message": "Правило успешно добавлен!", "result": True}
    )


@bp.route("/rule/", methods=["GET"])
def get_rule_view() -> tuple[dict, int]:
    """

    :return:
    ---
    get:
        summary: Получить правило формирования карт маскирования
        description: Получение правил
        parameters:
            -   in: query
                schema: GetRuleSchema
        responses:
            '200':
                description: Список отделов
                content:
                    application/json:
                        schema: RuleSchema
            '400':
                description: Ошибка при выполнении запроса
                content:
                    application/json:
                        schema: BinaryResponseSchema
        tags:
            - rule
    """
    data = request.args.to_dict()

    try:
        valid_data = GetRuleSchema().load(data)
    except ValidationError as err:
        current_app.logger.debug(
            f"Ошибка при валидации данных для схемы. {err}"
        )
        return (
            BinaryResponseSchema().dump(
                {"message": f"Ошибка валидации. {err}", "result": False}
            ),
            http.HTTPStatus.BAD_REQUEST,
        )

    rule = get_rule(valid_data.get("rule_id"))

    return RuleSchema().dump(rule), http.HTTPStatus.OK


@bp.route("/rules/", methods=["GET"])
def get_rules_view() -> tuple[dict, int]:
    """

    :return:
    ---
    get:
        summary: Получить список правил
        description: Получить список правил
        parameters:
            -   in: query
                schema: FilterRulesSchema
        responses:
            '200':
                description:
                content:
                    application/json:
                        schema:
                            type: array
                            items: RuleSchema
            '400':
                description: Ошибка при выполнении запроса
                content:
                    application/json:
                        schema: BinaryResponseSchema
        tags:
            - rule
    """
    data = dict()
    data["rule_ids[]"] = request.args.getlist("rule_ids[]")
    data["name"] = request.args.get("name")
    data["type_location_ids[]"] = request.args.getlist("type_location_ids[]")
    data["type_work_ids[]"] = request.args.getlist("type_work_ids[]")
    data["protection_ids[]"] = request.args.getlist("protection_ids[]")

    try:
        valid_data = FilterRulesSchema().load(data)
    except ValidationError as err:
        current_app.logger.debug(
            f"Ошибка при валидации данных для схемы. {err}"
        )
        return (
            BinaryResponseSchema().dump(
                {"message": f"Ошибка валидации. {err}", "result": False}
            ),
            http.HTTPStatus.BAD_REQUEST,
        )

    current_app.logger.debug(f"data rules - {valid_data}")
    rules = filter_list_rule(
        rules_ids=valid_data.get("rule_ids"),
        name=valid_data.get("name"),
        page=valid_data.get("page"),
        limit=valid_data.get("limit"),
        type_work_ids=valid_data.get("type_work_ids"),
        protection_ids=valid_data.get("protection_ids"),
        type_location_ids=valid_data.get("type_location_ids"),
    )

    rules_ser, pagination = serialize_paginate_object(rules)
    result = {"rules": rules_ser, "pagination": pagination}
    # current_app.logger.debug(
    #     f"cr - {rules_ser[0].criteria[3].questions[0].answers[0].__dict__}"
    # )
    return RuleListSchema().dump(result), http.HTTPStatus.OK


@bp.route("/rule/", methods=["PUT"])
def update_rule_view():
    """

    :return:
    ---
    put:
        summary: Изменить правило формирования карт маскирования
        description: Изменение правила
        requestBody:
            content:
                app/json:
                    schema: UpdateRuleSchema
        responses:
            '200':
                description:
                content:
                    application/json:
                        schema: BinaryResponseSchema
            '400':
                description:
                content:
                    application/json:
                        schema: BinaryResponseSchema
        tags:
            - rule
    """

    if not request.json:
        return (
            BinaryResponseSchema().dump(MESSAGES_DICT["NO_JSON"]),
            http.HTTPStatus.BAD_REQUEST,
        )

    data = request.json

    try:
        rule = UpdateRuleSchema().load(data)
    except ValidationError as err:
        current_app.logger.debug(
            f"Ошибка при валидации данных для схемы. {err}"
        )
        return (
            BinaryResponseSchema().dump(
                {"message": f"Ошибка валидации. {err}", "result": False}
            ),
            http.HTTPStatus.BAD_REQUEST,
        )
    except SqlAlchemyException as err:
        return (
            BinaryResponseSchema().dump({"message": err, "result": False}),
            http.HTTPStatus.BAD_REQUEST,
        )

    # location, type_work, type_location = get_locations_work_types_location_types(
    #     location_id=rule.get("location_id"),
    #     type_work_id=rule.get("type_work_id"),
    #     type_location_id=rule.get("type_location_id"),
    # )
    #
    # update_rule(
    #     name_rule=rule.get("name"),
    #     type_work=type_work,
    #     location=location,
    #     type_location=type_location,
    #     questions=rule.get("questions"),
    #     protections=rule.get("protections"),
    # )

    return BinaryResponseSchema().dump(
        {"message": "Правило успешно изменено!", "result": True}
    )


@bp.route("/rule/", methods=["DELETE"])
def delete_rule_view():
    """

    :return:
    ---
    delete:
        summary: Удалить правило
        description: Удаление правила
        parameters:
            -   in: query
                name: rule_id
                type: integer
        responses:
            '200':
                description:
                content:
                    application/json:
                        schema: BinaryResponseSchema
            '400':
                description:
                content:
                    application/json:
                        schema: BinaryResponseSchema
        tags:
            - rule
    """

    rule_id = request.args.get("rule_id")
    result = delete_rule(rule_id)
    if result:
        return BinaryResponseSchema().dump(
            {"message": "Правило успешно удалено!", "result": True}
        )

    return (
        BinaryResponseSchema().dump(
            {"message": "Не удалось удалить правило!", "result": False}
        ),
        http.HTTPStatus.BAD_REQUEST,
    )


@bp.route("/questions/", methods=["GET"])
def get_questions_view() -> tuple[dict, int]:
    """

    :return:
    ---
    get:
        summary: Получить список вопросов для уточнения маскирования защит
        description: Получить список вопросов для уточнения маскирования защит
        parameters:
            -   in: query
                schema: FilterQuestionsSchema
        responses:
            '200':
                description:
                content:
                    application/json:
                        schema: QuestionListSchema
            '400':
                description: Ошибка при выполнении запроса
                content:
                    application/json:
                        schema: BinaryResponseSchema
        tags:
            - rule
    """
    data = dict()
    data["question_ids[]"] = request.args.getlist("question_ids[]")
    data["text"] = request.args.get("text")
    data["type_work_ids[]"] = request.args.getlist("type_work_ids[]")
    data["location_ids[]"] = request.args.getlist("location_ids[]")

    try:
        valid_data = FilterQuestionsSchema().load(data)
    except ValidationError as err:
        current_app.logger.debug(
            f"Ошибка при валидации данных для схемы. {err}"
        )
        return (
            BinaryResponseSchema().dump(
                {"message": f"Ошибка валидации. {err}", "result": False}
            ),
            http.HTTPStatus.BAD_REQUEST,
        )
    current_app.logger.debug(f"que params - {valid_data}")

    questions = filter_list_question(
        questions_ids=valid_data.get("questions_ids"),
        text=valid_data.get("text"),
        page=valid_data.get("page"),
        limit=valid_data.get("limit"),
        type_work_ids=valid_data.get("type_work_ids"),
        location_ids=valid_data.get("location_ids"),
    )

    questions_ser, pagination = serialize_paginate_object(questions)
    result = {"questions": questions_ser, "pagination": pagination}
    current_app.logger.debug(f"qus - {result}")
    return QuestionListSchema().dump(result), http.HTTPStatus.OK


@bp.route("/filter-question-rule/", methods=["GET"])
def get_filter_question_rule_view() -> tuple[dict, int]:
    """
    
    :return:
    ---
    get:
        summary: Получить список вопросов для уточнения маскирования защит
        description: Получить список вопросов для уточнения маскирования защит
        parameters:
            -   in: query
                schema: FilterQuestionsSchema
        responses:
            '200':
                description:
                content:
                    application/json:
                        schema: QuestionListSchema
            '400':
                description: Ошибка при выполнении запроса
                content:
                    application/json:
                        schema: BinaryResponseSchema
        tags:
            - rule
    """
    data = dict()
    data["type_work_ids[]"] = request.args.getlist("type_work_ids[]")
    data["location_ids[]"] = request.args.getlist("location_ids[]")

    try:
        valid_data = FilterQuestionsSchema().load(data)
    except ValidationError as err:
        current_app.logger.debug(
            f"Ошибка при валидации данных для схемы. {err}"
        )
        return (
            BinaryResponseSchema().dump(
                {"message": f"Ошибка валидации. {err}", "result": False}
            ),
            http.HTTPStatus.BAD_REQUEST,
        )
    current_app.logger.debug(f"que params - {valid_data}")

    questions = get_filter_questions_for_gen_map(
        type_work_ids=valid_data.get("type_work_ids"),
        location_ids=valid_data.get("location_ids"),
    )
    current_app.logger.debug(f"qus - {questions}")
    return QuestionListSchema().dump(questions), http.HTTPStatus.OK


@bp.route("/question/", methods=["GET"])
def get_question_view() -> tuple[dict, int]:
    """

    :return:
    ---
    get:
        summary: Получить вопрос для уточнения маскирования защит
        description: Получить вопрос для уточнения маскирования защит
        parameters:
            -   in: query
                schema: GetQuestionSchema
        responses:
            '200':
                description:
                content:
                    application/json:
                        schema: QuestionSchema
            '400':
                description: Ошибка при выполнении запроса
                content:
                    application/json:
                        schema: BinaryResponseSchema
        tags:
            - rule
    """
    data = request.args.to_dict()

    try:
        valid_data = GetQuestionSchema().load(data)
    except ValidationError as err:
        current_app.logger.debug(
            f"Ошибка при валидации данных для схемы. {err}"
        )
        return (
            BinaryResponseSchema().dump(
                {"message": f"{err}", "result": False}
            ),
            http.HTTPStatus.BAD_REQUEST,
        )
    question = get_question(question_id=valid_data["id"])
    return QuestionSchema().dump(question), http.HTTPStatus.OK


@bp.route("/question/", methods=["POST"])
def add_question_view() -> tuple[dict, int]:
    """

    :return:
    post:
        summary: Добавить вопрос для уточнения правила
        description: Добавить вопрос для уточнения правила
        requestBody:
            content:
                app/json:
                    schema: AddQuestionSchema
        responses:
            '200':
                description:
                content:
                    application/json:
                        schema: BinaryResponseSchema
            '400':
                description:
                content:
                    application/json:
                        schema: BinaryResponseSchema
        tags:
            - rule
    """

    if not request.json:
        return (
            BinaryResponseSchema().dump(MESSAGES_DICT["NO_JSON"]),
            http.HTTPStatus.BAD_REQUEST,
        )

    data = request.json
    try:
        question_data = AddQuestionSchema().load(data)
    except ValidationError as err:
        current_app.logger.info(f"Validation error {err}")
        return (
            BinaryResponseSchema().dump(
                {
                    "message": "Не удалось добавить вопрос!",
                    "result": False,
                }
            ),
            http.HTTPStatus.BAD_REQUEST,
        )
    current_app.logger.info(question_data)
    question = add_question(
        text=question_data.get("text"),
    )
    for answer in question_data.get("answers"):
        answer = add_question_answer(
            text=answer.get("text"),
            id_question=question.id,
        )

    return (
        BinaryResponseSchema().dump(
            {
                "message": "Вопрос успешно добавлен!",
                "result": True,
            }
        ),
        http.HTTPStatus.OK,
    )


@bp.route("/question/", methods=["PUT"])
def update_question_view() -> tuple[dict, int]:
    """

    :return:
    put:
        summary: Добавить вопрос для уточнения правила
        description: Добавить вопрос для уточнения правила
        requestBody:
            content:
                app/json:
                    schema: UpdateQuestionSchema
        responses:
            '200':
                description:
                content:
                    application/json:
                        schema: BinaryResponseSchema
            '400':
                description:
                content:
                    application/json:
                        schema: BinaryResponseSchema
        tags:
            - rule
    """

    if not request.json:
        return (
            BinaryResponseSchema().dump(MESSAGES_DICT["NO_JSON"]),
            http.HTTPStatus.BAD_REQUEST,
        )

    data = request.json
    try:
        question = UpdateQuestionSchema().load(data)
    except ValidationError as err:
        current_app.logger.info(f"Validation error {err}")
        return (
            BinaryResponseSchema().dump(
                {
                    "message": "Не удалось изменить вопрос!",
                    "result": False,
                }
            ),
            http.HTTPStatus.BAD_REQUEST,
        )
    current_app.logger.info(question)
    question = update_question(
        question_id=question.get("id"),
        text=question.get("text"),
        answers=question.get("answers"),
    )

    return (
        BinaryResponseSchema().dump(
            {
                "message": "Вопрос успешно изменен!",
                "result": True,
            }
        ),
        http.HTTPStatus.OK,
    )
