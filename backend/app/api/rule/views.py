import http

from flask import Blueprint, request, current_app
from marshmallow import ValidationError

from app.api.helpers.exceptions import SqlAlchemyException
from app.api.helpers.messages import MESSAGES_DICT
from app.api.helpers.schemas import BinaryResponseSchema
from app.api.helpers.utils import serialize_paginate_object
from app.api.rule.helpers import (
    get_location_work_type_location_type,
    add_new_rule,
    get_rule,
    filter_list_rule,
    update_rule,
)
from app.api.rule.schema import (
    AddRuleSchema,
    GetRuleSchema,
    RuleSchema,
    FilterRulesSchema,
    RuleListSchema,
    UpdateRuleSchema,
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

    location, type_work, type_location = get_location_work_type_location_type(
        location_id=rule.get("location_id"),
        type_work_id=rule.get("type_work_id"),
        type_location_id=rule.get("type_location_id"),
    )

    add_new_rule(
        name_rule=rule.get("name"),
        type_work=type_work,
        location=location,
        type_location=type_location,
        questions=rule.get("questions"),
        protections=rule.get("protections"),
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
# @bp.route("/question/", methods=["POST"])
# def add_question_view() -> tuple[dict, int]:
#     """
#
#     :return:
#     post:
#         summary: Добавить вопрос для уточнения правила
#         description: Добавить вопрос для уточнения правила
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
# @bp.route("/question/", methods=["GET"])
# def get_question_view() -> tuple[dict, int]:
#     """
#
#     :return:
#     ---
#     get:
#         summary: Получить вопрос для уточнения маскирования защит
#         description: Получить вопрос для уточнения маскирования защит
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
# @bp.route("/questions/", methods=["GET"])
# def get_questions_view() -> tuple[dict, int]:
#     """
#
#     :return:
#     ---
#     get:
#         summary: Получить список вопросов для уточнения маскирования защит
#         description: Получить список вопросов для уточнения маскирования защит
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
# @bp.route("/answer/", methods=["POST"])
# def add_answer_view() -> tuple[dict, int]:
#     """
#
#     :return:
#     post:
#         summary: Добавить ответ на вопрос
#         description: Добавление ответа
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


# @bp.route("/answer/", methods=["GET"])
# def get_answer_view() -> tuple[dict, int]:
#     """
#
#     :return:
#     ---
#     get:
#         summary: Получить ответ на уточняющий вопрос
#         description: Получить ответ на уточняющий вопрос
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
# @bp.route("/answers/", methods=["GET"])
# def get_answers_view() -> tuple[dict, int]:
#     """
#
#     :return:
#     ---
#     get:
#         summary: Получить список ответов на уточняющий вопрос
#         description: Получить список ответов на уточняющий вопрос
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
