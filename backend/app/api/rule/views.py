import http

from flask import Blueprint, request, current_app
from marshmallow import ValidationError

from app.api.helpers.exceptions import SqlAlchemyException
from app.api.helpers.messages import MESSAGES_DICT
from app.api.helpers.schemas import BinaryResponseSchema
from app.api.helpers.utils import serialize_paginate_object
from app.api.rule.helpers import (
    add_new_rule,
    get_rule,
    filter_list_rule,
    update_rule, filter_list_question, get_question, add_question,
    add_question_answer, update_question, get_locations_work_types_location_types,
)
from app.api.rule.schema import (
    AddRuleSchema,
    GetRuleSchema,
    RuleSchema,
    FilterRulesSchema,
    RuleListSchema,
    UpdateRuleSchema, AddQuestionSchema, QuestionListSchema, QuestionSchema,
    GetQuestionSchema, FilterQuestionsSchema, UpdateQuestionSchema,
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

    location, type_work, type_location = get_locations_work_types_location_types(
        location_ids=[loc["id"] for loc in rule.get("locations")],
        type_work_ids=[tw["id"] for tw in rule.get("type_works")],
        type_location_ids=[tl["id"] for tl in rule.get("type_locations")],
    )

    add_new_rule(
        name_rule=rule.get("name"),
        type_work=type_work,
        location=location,
        type_location=type_location,
        questions=rule.get("questions"),
        protections=rule.get("protections"),
        compensatory_measures=rule.get("compensatory_measures")
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
    data["name"] = request.args.getlist("name")

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

    rules = filter_list_rule(
        rules_ids=valid_data.get("rule_ids"),
        name=valid_data.get("name"),
        page=valid_data.get("page"),
        limit=valid_data.get("limit"),
    )

    rules_ser, pagination = serialize_paginate_object(rules)
    result = {"rules": rules_ser, "pagination": pagination}

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

    location, type_work, type_location = get_location_work_type_location_type(
        location_id=rule.get("location_id"),
        type_work_id=rule.get("type_work_id"),
        type_location_id=rule.get("type_location_id"),
    )

    update_rule(
        name_rule=rule.get("name"),
        type_work=type_work,
        location=location,
        type_location=type_location,
        questions=rule.get("questions"),
        protections=rule.get("protections"),
    )

    return BinaryResponseSchema().dump(
        {"message": "Правило успешно изменено!", "result": True}
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
    data = request.args.to_dict()

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

    questions = filter_list_question(
        questions_ids=valid_data.get("questions_ids"),
        text=valid_data.get("text"),
        page=valid_data.get("page"),
        limit=valid_data.get("limit"),
    )

    questions_ser, pagination = serialize_paginate_object(questions)
    result = {"questions": questions_ser, "pagination": pagination}
    return QuestionListSchema().dump(result), http.HTTPStatus.OK


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
        return BinaryResponseSchema().dump(
            {
                "message": f"{err}",
                "result": False
            }
        ), http.HTTPStatus.BAD_REQUEST
    question = get_question(
        question_id=valid_data["id"]
    )
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
        return BinaryResponseSchema().dump(
            {
                "message": "Не удалось добавить вопрос!",
                "result": False,
            }
        ), http.HTTPStatus.BAD_REQUEST
    current_app.logger.info(question_data)
    question = add_question(
        text=question_data.get("text"),
    )
    for answer in question_data.get("answers"):
        answer = add_question_answer(
            text=answer.get("text"),
            id_question=question.id,
        )

    return BinaryResponseSchema().dump(
        {
            "message": "Вопрос успешно добавлен!",
            "result": True,
        }
    ), http.HTTPStatus.OK


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
        return BinaryResponseSchema().dump(
            {
                "message": "Не удалось изменить вопрос!",
                "result": False,
            }
        ), http.HTTPStatus.BAD_REQUEST
    current_app.logger.info(question)
    question = update_question(
        question_id=question.get("id"),
        text=question.get("text"),
        answers=question.get("answers"),
    )

    return BinaryResponseSchema().dump(
        {
            "message": "Вопрос успешно изменен!",
            "result": True,
        }
    ), http.HTTPStatus.OK


# @bp.route("/criteria/", methods=["POST"])
# def add_criteria_views() -> tuple[dict, int]:
#     """
#
#     :return:
#     post:
#         summary: Добавить критерий для уточнения правила
#         description: Добавить критерий для уточнения правила
#         requestBody:
#             content:
#                 app/json:
#                     schema:
#         responses:
#             '200':
#                 description:
#                 content:
#                     application/json:
#                         schema:
#             '400':
#                 description:
#                 content:
#                     application/json:
#                         schema:
#         tags:
#             - rule
#     """
#
#
# @bp.route("/criteria/", methods=["GET"])
# def get_criteria_views() -> tuple[dict, int]:
#     """
#
#     :return:
#     ---
#     get:
#         summary: Получить критерий формирования карт
#         description: Получить критерий формирования карт
#         parameters:
#             -   in: query
#                 schema:
#         responses:
#             '200':
#                 description:
#                 content:
#                     application/json:
#                         schema:
#             '400':
#                 description: Ошибка при выполнении запроса
#                 content:
#                     application/json:
#                         schema:
#         tags:
#             - rule
#     """
#
#
# @bp.route("/criteria-list/", methods=["GET"])
# def get_criteria_list_views() -> tuple[dict, int]:
#     """
#
#     :return:
#     ---
#     get:
#         summary: Получить список критериев формирования карт
#         description: Получить список критериев формирования карт
#         parameters:
#             -   in: query
#                 schema:
#         responses:
#             '200':
#                 description:
#                 content:
#                     application/json:
#                         schema:
#             '400':
#                 description: Ошибка при выполнении запроса
#                 content:
#                     application/json:
#                         schema:
#         tags:
#             - rule
#     """
#
#
#
#

