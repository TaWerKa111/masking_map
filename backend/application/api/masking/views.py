import http

from flask import Blueprint, jsonify, request, current_app, send_file, Response
from marshmallow import ValidationError

from application.api.helpers.exceptions import SqlAlchemyException
from application.api.helpers.messages import MESSAGES_DICT
from application.api.masking.schemas import (
    AddTypeProtectionSchema,
    AddProtectionSchema,
    AddTypeWorkSchema,
    AddMNObjectSchema,
    TypeWorkSchema,
    TypeProtectionSchema,
    ProtectionSchema,
    MNObjectSchema, GenerateMaskingPlanSchema, GetTypeWorkListSchema,
    GetMNObjectListSchema, MaskingResponseFileSchema, TypeMnObjectSchema,
)
from application.api.helpers.schemas import BinaryResponseSchema
from application.api.masking.helpers import (
    get_protection_list,
    get_mn_object_list,
    get_type_work_list,
    get_type_protection_list,
    check_generate_masking_plan, generate_file, render_masking_map,
    get_type_mn_object_list,
)


bp = Blueprint("masking_api", __name__, url_prefix="/api/masking/")


@bp.route("/type-work/", methods=["GET"])
def get_type_work_view():
    """

    :return:
    ---
    get:
        summary: Получить список типов работ
        description: Получить список типов работ
        parameters:
            -   in: query
                schema: GetTypeWorkListSchema
        responses:
            '200':
                description: Список типов работ
                content:
                    application/json:
                        schema:
                            type: array
                            items: TypeWorkSchema
            '400':
                description: Не удалось получить данные!
                content:
                    application/json:
                        schema: BinaryResponseSchema
        tags:
            - masking
    """
    data = dict()
    data["ids_type_protection[]"] = request.args.getlist(
        "ids_type_protection[]")
    data["ids_type_mn_object[]"] = request.args.getlist(
        "ids_type_mn_object[]")
    data["name_type_work"] = request.args.get("name_type_work")

    try:
        type_work_list = GetTypeWorkListSchema().load(data)
    except ValidationError as err:
        current_app.logger.debug(f"ValidationError - {err}")
        return (
            BinaryResponseSchema().dump(
                {
                    "message": "Неверные входные данные!",
                    "result": False
                }
            ),
            http.HTTPStatus.BAD_REQUEST
        )
    # type_work_list = get_type_work_list()
    return (
        jsonify(TypeWorkSchema().dump(type_work_list, many=True)),
        http.HTTPStatus.OK,
    )


@bp.route("/type-work/", methods=["POST"])
def add_type_work_view():
    """

    :return:
    ---
    post:
        summary: Добавить список типов работ
        description: Добавить список типов работ
        requestBody:
            content:
                application/json:
                    schema: AddTypeWorkSchema
        responses:
            '200':
                description: Данные успешно добавлены
                content:
                    application/json:
                        schema: BinaryResponseSchema
            '400':
                description: Не удалось получить данные!
                content:
                    application/json:
                        schema: BinaryResponseSchema
        tags:
            - masking
    """

    if not request.json:
        return (
            BinaryResponseSchema().dump(MESSAGES_DICT["NO_JSON"]),
            http.HTTPStatus.BAD_REQUEST,
        )

    data = request.json

    try:
        type_work = AddTypeWorkSchema().load(data)
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
            BinaryResponseSchema().dump(
                {
                    "message": err,
                    "result": False
                }
            ),
            http.HTTPStatus.BAD_REQUEST
        )

    return BinaryResponseSchema().dump(
        {"message": "Тип работы успешно добавлен!", "result": True}
    )


@bp.route("/type-work/", methods=["POST"])
def update_type_work_view():
    """

    :return:
    """


@bp.route("/protection/", methods=["GET"])
def get_protection_view():
    """

    :return:
    ---
    get:
        summary: Получить список защит
        description: Получить список защит
        responses:
            '200':
                description: Список защит
                content:
                    application/json:
                        schema:
                            type: array
                            items: ProtectionSchema
            '400':
                description: Не удалось получить данные!
                content:
                    application/json:
                        schema: BinaryResponseSchema
        tags:
            - masking
    """

    protection_list = get_protection_list()
    return (
        jsonify(ProtectionSchema().dump(protection_list, many=True)),
        http.HTTPStatus.BAD_REQUEST,
    )


@bp.route("/protection/", methods=["POST"])
def add_protection_view():
    """

    :return:
    ---
    post:
        summary: Добавить защиту
        description: Добавить защиту
        requestBody:
            content:
                application/json:
                    schema: AddProtectionSchema
        responses:
            '200':
                description: Данные успешно добавлены
                content:
                    application/json:
                        schema: BinaryResponseSchema
                        examples:
                            Good:
                                value:
                                    message: good
                                    result: true
            '400':
                description: Не удалось добавить данные!
                content:
                    application/json:
                        schema: BinaryResponseSchema
        tags:
            - masking
    """

    if not request.json:
        return (
            BinaryResponseSchema().dump(MESSAGES_DICT["NO_JSON"]),
            http.HTTPStatus.BAD_REQUEST,
        )

    data = request.json

    try:
        protection = AddProtectionSchema().load(data)
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

    return BinaryResponseSchema().dump(
        {"message": "Защита объекта успешно добавлен!", "result": True}
    )


@bp.route("/protection/", methods=["POST"])
def update_protection_view():
    """

    :return:
    """


@bp.route("/type-protection/", methods=["GET"])
def get_type_protection_view():
    """

    :return:
    ---
    get:
        summary: Получить список типов защит
        description: Получить список типов защит
        responses:
            '200':
                description: Список типов защит
                content:
                    application/json:
                        schema:
                            type: array
                            items: TypeProtectionSchema
            '400':
                description: Не удалось получить данные!
                content:
                    application/json:
                        schema: BinaryResponseSchema
        tags:
            - masking
    """

    type_protection_list = get_type_protection_list()

    return (
        jsonify(TypeProtectionSchema().dump(type_protection_list, many=True)),
        http.HTTPStatus.OK,
    )


@bp.route("/type-protection/", methods=["POST"])
def add_type_protection_view():
    """

    :return:
    ---
    post:
        summary: Добавить тип защит
        description: Добавить тип защит
        requestBody:
            content:
                application/json:
                    schema: AddTypeProtectionSchema
        responses:
            '200':
                description: Данные успешно добавлены
                content:
                    application/json:
                        schema: BinaryResponseSchema
                        examples:
                            Good:
                                value:
                                    message: good
                                    result: true
            '400':
                description: Не удалось добавить данные!
                content:
                    application/json:
                        schema: BinaryResponseSchema
        tags:
            - masking
    """

    if not request.json:
        return (
            BinaryResponseSchema().dump(MESSAGES_DICT["NO_JSON"]),
            http.HTTPStatus.BAD_REQUEST,
        )

    data = request.json

    try:
        type_protection = AddTypeProtectionSchema().load(data)
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

    return BinaryResponseSchema().dump(
        {"message": "Тип защиты объекта успешно добавлен!", "result": True}
    )


@bp.route("/type-protection/", methods=["POST"])
def update_type_protection_view():
    """

    :return:
    """


@bp.route("/mn-object/", methods=["GET"])
def get_mn_object_view():
    """

    :return:
    ---
    get:
        summary: Получить список объектов
        description: Получить список объектов
        parameters:
            -   in: query
                schema: GetMNObjectListSchema
        responses:
            '200':
                description: Список объектов
                content:
                    application/json:
                        schema:
                            type: array
                            items: MNObjectSchema
            '400':
                description: Не удалось получить данные!
                content:
                    application/json:
                        schema: BinaryResponseSchema
        tags:
            - masking
    """

    data = dict()
    data["ids_type_protection[]"] = request.args.getlist(
        "ids_type_protection[]")
    data["ids_type_mn_object[]"] = request.args.getlist(
        "ids_type_mn_object[]")
    data["name_mn_object"] = request.args.get("name_mn_object")
    current_app.logger.debug(f"mn objects data - {data}")
    try:
        mn_object_list = GetMNObjectListSchema().load(data)
    except ValidationError as err:
        current_app.logger.debug(f"ValidationError - {err}")
        return (
            BinaryResponseSchema().dump(
                {
                    "message": "Неверные входные данные!",
                    "result": False
                }
            ),
            http.HTTPStatus.BAD_REQUEST
        )

    # mn_object_list = get_mn_object_list()

    return (
        jsonify(MNObjectSchema().dump(mn_object_list, many=True)),
        http.HTTPStatus.OK,
    )


@bp.route("/mn-object/", methods=["POST"])
def add_mn_object_view():
    """

    :return:
    ---
    post:
        summary: Добавить объект
        description: Добавить объект
        requestBody:
            content:
                application/json:
                    schema: AddMNObjectSchema
        responses:
            '200':
                description: Данные успешно добавлены
                content:
                    application/json:
                        schema: BinaryResponseSchema
                        examples:
                            Good:
                                value:
                                    message: good
                                    result: true
            '400':
                description: Не удалось добавить данные!
                content:
                    application/json:
                        schema: BinaryResponseSchema
        tags:
            - masking
    """

    if not request.json:
        return (
            BinaryResponseSchema().dump(MESSAGES_DICT["NO_JSON"]),
            http.HTTPStatus.BAD_REQUEST,
        )

    data = request.json

    try:
        mn_object = AddMNObjectSchema().load(data)
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
            BinaryResponseSchema().dump(
                {
                    "message": err,
                    "result": False
                }
            ),
            http.HTTPStatus.BAD_REQUEST
        )

    return BinaryResponseSchema().dump(
        {"message": "Объект успешно добавлен!", "result": True}
    )


@bp.route("/mn-object/", methods=["POST"])
def update_mn_object_view():
    """

    :return:
    """


@bp.route("/generate-masking/")
def generate_masking_view():
    """

    :return:
    ---
    get:
        summary: Сгенерировать карту маскирования
        description: Генерация карты маскирования
        parameters:
            -   in: query
                description: Параметры
                schema: GenerateMaskingPlanSchema
        responses:
            '200':
                description: Результат проверки
                content:
                    application/json:
                        schema: BinaryResponseSchema
            '400':
                description: Карта не нужна
                content:
                    application/json:
                        schema: BinaryResponseSchema
        tags:
            - masking
    """

    data = dict()
    data["id_object"] = request.args.get("id_object")
    data["id_type_work"] = request.args.get("id_type_work")

    try:
        data_for_masking = GenerateMaskingPlanSchema().load(data)
    except ValidationError as err:
        current_app.logger.debug(f"Validation error - {err}")
        return BinaryResponseSchema().dump(
            {
                "message": "",
                "result": False
            }
        ), http.HTTPStatus.BAD_REQUEST

    masking_uuid = check_generate_masking_plan(
        **data_for_masking
    )

    if masking_uuid:
        return MaskingResponseFileSchema().dump({
            "message": "Возможно сделать карту маскирования!",
            "masking_uuid": masking_uuid,
            "result": True
        }), http.HTTPStatus.OK

    return BinaryResponseSchema().dump({
            "message": "Нет. Невозможно сделать карту маскирования!",
            "result": False
        }), http.HTTPStatus.BAD_REQUEST


@bp.route("/get-pdf/")
def get_file_view():
    """
    ---
    get:
        summary: Получить файл
        parameters:
            -   in: query
                description: Параметры
                name: masking_uuid
                type: str
        responses:
            '200':
                description: Файл
                content:
                    application/pdf:
                        schema:
                            type: file
            '400':
                description: Файл не существует
                content:
                    application/json:
                        schema: BinaryResponseSchema
        tags:
            - masking
    """

    masking_uuid = request.args.get("masking_uuid")

    if not masking_uuid:
        return BinaryResponseSchema().dump({
            "message": "Файл не существует!",
            "result": False
        }), http.HTTPStatus.BAD_REQUEST

    map_file_path = generate_file(masking_uuid)
    current_app.logger.debug(f"filename view - {map_file_path}")

    with open(map_file_path, "rb") as map_file:
        map_file_data = map_file.read()

    return Response(
        map_file_data,
        mimetype="application/pdf",
        headers={
            "Content-Disposition": f"attachment;filename={'map.pdf'}"}
    )


@bp.route("/get-html/")
def get_html_view():
    """
    ---
    get:
        summary: Получить информацию по максированию
        parameters:
            -   in: query
                description: Параметры
                name: masking_uuid
                type: str
        responses:
            '200':
                description: Файл
                content:
                    text/html:
                        schema:
                            type: string
            '400':
                description: Файл не существует
                content:
                    application/json:
                        schema: BinaryResponseSchema
        tags:
            - masking
    """

    masking_uuid = request.args.get("masking_uuid")

    if not masking_uuid:
        return BinaryResponseSchema().dump({
            "message": "Файл не существует!",
            "result": False
        }), http.HTTPStatus.BAD_REQUEST

    map_html_data = render_masking_map(masking_uuid)

    return Response(
        map_html_data,
        mimetype="text/html",
    )


@bp.route("/type-object/")
def get_type_object_list_view():
    """
    ---
    get:
        summary: Получить список типов объектов
        responses:
            '200':
                description: Список типов объектов
                content:
                    application/pdf:
                        schema:
                            type: array
                            items:
            '400':
                description: Плохой запрос
                content:
                    application/json:
                        schema: BinaryResponseSchema
        tags:
            - masking
    """

    type_objects = get_type_mn_object_list()

    return jsonify(
        TypeMnObjectSchema().dump(type_objects, many=True)), http.HTTPStatus.OK
