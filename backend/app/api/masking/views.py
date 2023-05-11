import http

from flask import Blueprint, jsonify, request, current_app
from marshmallow import ValidationError

from app.api.helpers.exceptions import SqlAlchemyException
from app.api.helpers.messages import MESSAGES_DICT
from app.api.helpers.utils import serialize_paginate_object
from app.api.masking.schemas import (
    AddTypeProtectionSchema,
    AddProtectionSchema,
    AddTypeWorkSchema,
    AddLocationSchema,
    DepartamentListSchema,
    DepartamentSchema,
    TypeWorkSchema,
    TypeProtectionSchema,
    ProtectionSchema,
    LocationSchema,
    FilterParamTypeWorkSchema,
    FilterParamLocationSchema,
    TypeLocationSchema,
    UpdateTypeWorkSchema,
    UpdateDepartamentSchema,
    UpdateProtectionSchema,
    UpdateTypeProtectionSchema,
    UpdateLocationSchema,
    UpdateTypeLocationSchema,
    TypeWorkListSchema,
    FilterParamDepartamentSchema,
    AddDepartamentSchema,
    FileterParamProtectionSchema,
    AddTypeLocationSchema,
    LocationListSchema,
    GetLocationSchema, ProtectionListSchema,
    RelationshipLocationLocationSchema, RelationshipLocationProtectionSchema,
)
from app.api.helpers.schemas import BinaryResponseSchema
from app.api.masking.helpers import (
    get_protection_list,
    get_location_list,
    get_type_work_list,
    get_type_protection_list,
    get_type_location_list,
    get_departament_work_list, update_type_work, add_departament,
    update_departament, add_protection, update_protection, add_type_protection,
    update_type_protection, add_location, update_location,
    update_type_location, update_rel_location_location,
    update_rel_location_protection,
)


bp = Blueprint("masking_api", __name__, url_prefix="/api/masking/")


# TOdo Исправить работоспособность всех вьюшек
@bp.route("/type-work/", methods=["GET"])
def get_type_work_view() -> tuple[dict, int]:
    """

    :return:
    ---
    get:
        summary: Получить список типов работ
        description: Получить список типов работ
        parameters:
            -   in: query
                schema: FilterParamTypeWorkSchema
        responses:
            '200':
                description: Список типов работ
                content:
                    app/json:
                        schema:
                            type: array
                            items: TypeWorkSchema
            '400':
                description: Не удалось получить данные!
                content:
                    app/json:
                        schema: BinaryResponseSchema
        tags:
            - masking
    """

    data = dict()
    data["ids_type_protection[]"] = request.args.getlist(
        "ids_type_protection[]"
    )
    data["ids_type_mn_object[]"] = request.args.getlist("ids_type_mn_object[]")
    data["name_type_work"] = request.args.get("name_type_work")

    try:
        type_work_list = FilterParamTypeWorkSchema().load(data)
    except ValidationError as err:
        current_app.logger.debug(f"ValidationError - {err}")
        return (
            BinaryResponseSchema().dump(
                {"message": "Неверные входные данные!", "result": False}
            ),
            http.HTTPStatus.BAD_REQUEST,
        )

    type_works, pagination = serialize_paginate_object(type_work_list)
    result = {"type_works": type_works, "pagination": pagination}

    return (
        TypeWorkListSchema().dump(result),
        http.HTTPStatus.OK,
    )


@bp.route("/type-work/", methods=["POST"])
def add_type_work_view() -> tuple[dict, int]:
    """

    :return:
    ---
    post:
        summary: Добавить список типов работ
        description: Добавить список типов работ
        requestBody:
            content:
                app/json:
                    schema: AddTypeWorkSchema
        responses:
            '200':
                description: Данные успешно добавлены
                content:
                    app/json:
                        schema: BinaryResponseSchema
            '400':
                description: Не удалось получить данные!
                content:
                    app/json:
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
            BinaryResponseSchema().dump({"message": err, "result": False}),
            http.HTTPStatus.BAD_REQUEST,
        )

    return BinaryResponseSchema().dump(
        {"message": "Тип работы успешно добавлен!", "result": True}
    )


@bp.route("/type-work/", methods=["PUT"])
def update_type_work_view() -> tuple[dict, int]:
    """

    :return:
    ---
    put:
        summary: Изменить тип работы
        description: Изменить тип работы
        requestBody:
            content:
                app/json:
                    schema: UpdateTypeWorkSchema
        responses:
            '200':
                description: Данные успешно изменены
                content:
                    app/json:
                        schema: BinaryResponseSchema
            '400':
                description: Не удалось получить данные!
                content:
                    app/json:
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
        type_work_data = UpdateTypeWorkSchema().load(data)
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

    result_update = update_type_work(
        type_work_data.get("id"),
        type_work_data.get("name"),
        type_work_data.get("departament_id")
    )

    if not result_update:
        return (
            BinaryResponseSchema().dump(
                {
                    "message": "Не удалось изменить данные!",
                    "result": False
                }
            ),
            http.HTTPStatus.BAD_REQUEST,
        )

    return BinaryResponseSchema().dump(
        {"message": "Тип работы успешно изменен!", "result": True}
    )


@bp.route("/departament-type-work/", methods=["GET"])
def get_departament_type_work_view() -> tuple[dict, int]:
    """

    :return:
    ---
    get:
        summary: Получить отделы
        description: Получение списка отделов, выполняющие различные работы
        parameters:
            -   in: query
                schema: FilterParamDepartamentSchema
        responses:
            '200':
                description: Список отделов
                content:
                    application/json:
                        schema: DepartamentListSchema
            '400':
                description: Ошибка при выполнении запроса
                content:
                    application/json:
                        schema: BinaryResponseSchema
        tags:
            - masking
    """
    data = request.args.to_dict()

    try:
        FilterParamDepartamentSchema().load(data)
    except ValidationError as err:
        current_app.logger.debug(f"ValidationError - {err}")
        return (
            BinaryResponseSchema().dump(
                {"message": "Неверные входные данные!", "result": False}
            ),
            http.HTTPStatus.BAD_REQUEST,
        )

    dep_list = get_departament_work_list(data.get("name", None))
    result = {"departaments": dep_list}

    return (
        DepartamentListSchema().dump(result),
        http.HTTPStatus.OK,
    )


@bp.route("/departament-type-work/", methods=["POST"])
def add_departament_type_work_view() -> tuple[dict, int]:
    """

    :return:
    ---
    post:
        summary: Добавить отдел
        description: Добавить отдел, выполняющий различные работы
        requestBody:
            description:
            content:
                application/json:
                    schema: AddDepartamentSchema
        responses:
            '200':
                description: Список отделов
                content:
                    application/json:
                        schema: BinaryResponseSchema
            '400':
                description: Ошибка при выполнении запроса
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
        departament_data = AddDepartamentSchema().load(data)
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

    departament = add_departament(departament_data.get("name"))
    current_app.logger.debug(f"departament add with id - {departament.id}")

    return BinaryResponseSchema().dump(
        {"message": "Отдел успешно добавлен!", "result": True}
    )


@bp.route("/departament-type-work/", methods=["PUT"])
def update_departament_type_work_view() -> tuple[dict, int]:
    """

    :return:
    ---
    put:
        summary: Изменить название отдела
        description: Изменить название отдела, выполняющего различные работы
        requestBody:
            description:
            content:
                application/json:
                    schema: UpdateDepartamentSchema
        responses:
            '200':
                description: Список отделов
                content:
                    application/json:
                        schema: BinaryResponseSchema
            '400':
                description: Ошибка при выполнении запроса
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
        departament_data = UpdateDepartamentSchema().load(data)
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

    result_update = update_departament(
        departament_data.get("id"),
        departament_data.get("name"),
    )

    if not result_update:
        return (
            BinaryResponseSchema().dump(
                {
                    "message": "Не удалось изменить данные!",
                    "result": False
                }
            ),
            http.HTTPStatus.BAD_REQUEST,
        )

    return BinaryResponseSchema().dump(
        {"message": "Данные отдела успешно изменены!", "result": True}
    )


@bp.route("/protection/", methods=["GET"])
def get_protection_view() -> tuple[dict, int]:
    """

    :return:
    ---
    get:
        summary: Получить список защит
        description: Получить список защит
        parameters:
            -   in: query
                schema: FileterParamProtectionSchema
        responses:
            '200':
                description: Список защит
                content:
                    application/json:
                        schema: ProtectionListSchema
            '400':
                description: Не удалось получить данные!
                content:
                    app/json:
                        schema: BinaryResponseSchema
        tags:
            - masking
    """
    data = request.args.to_dict(flat=False)
    try:
        data = FileterParamProtectionSchema().load(data)
    except ValidationError as err:
        current_app.logger.debug(f"err validation - {err}")
        return (
            BinaryResponseSchema().dump(
                {
                    "message": "Не удалось получить список защит!",
                    "result": False,
                }
            ),
            http.HTTPStatus.BAD_REQUEST,
        )

    protection_list = get_protection_list(
        name=data.get("name"),
        type_protection_ids=data.get("type_protections_ids"),
        page=data.get("page"),
        limit=data.get("limit"),
    )

    protections, pagination = serialize_paginate_object(protection_list)
    result = {"protections": protections, "pagination": pagination}

    return (
        ProtectionListSchema().dump(result),
        http.HTTPStatus.BAD_REQUEST,
    )


@bp.route("/protection/", methods=["POST"])
def add_protection_view() -> tuple[dict, int]:
    """

    :return:
    ---
    post:
        summary: Добавить защиту
        description: Добавить защиту
        requestBody:
            content:
                app/json:
                    schema: AddProtectionSchema
        responses:
            '200':
                description: Данные успешно добавлены
                content:
                    app/json:
                        schema: BinaryResponseSchema
                        examples:
                            Good:
                                value:
                                    message: good
                                    result: true
            '400':
                description: Не удалось добавить данные!
                content:
                    app/json:
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
        protection_data = AddProtectionSchema().load(data)
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

    protection = add_protection(
        protection_data.get("name"),
        protection_data.get("id_type_protection"),
        protection_data.get("id_location"),
    )
    current_app.logger.debug(f"protection add id - {protection.id}")

    return BinaryResponseSchema().dump(
        {"message": "Защита объекта успешно добавлен!", "result": True}
    )


@bp.route("/protection/", methods=["PUT"])
def update_protection_view() -> tuple[dict, int]:
    """

    :return:
    ---
    put:
        summary: Изменить защиту
        description: Изменить защиту
        requestBody:
            content:
                app/json:
                    schema: UpdateProtectionSchema
        responses:
            '200':
                description: Данные успешно добавлены
                content:
                    app/json:
                        schema: ProtectionSchema
            '400':
                description: Не удалось добавить данные!
                content:
                    app/json:
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
        protection_data = UpdateProtectionSchema().load(data)
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

    result_update = update_protection(
        protection_data.get("id"),
        protection_data.get("name"),
        protection_data.get("id_type_protection"),
        protection_data.get("id_location"),
    )

    if not result_update:
        return (
            BinaryResponseSchema().dump(
                {
                    "message": "Не удалось изменить данные!",
                    "result": False
                }
            ),
            http.HTTPStatus.BAD_REQUEST,
        )

    return BinaryResponseSchema().dump(
        {"message": "Данные защиты успешно изменены!", "result": True}
    )


@bp.route("/type-protection/", methods=["GET"])
def get_type_protection_view() -> tuple[dict, int]:
    """

    :return:
    ---
    get:
        summary: Получить список типов защит
        description: Получить список типов защит
        parameters:
            -   in: query
                schema: FilterParamTypeProtectionSchema
        responses:
            '200':
                description: Список типов защит
                content:
                    app/json:
                        schema:
                            type: array
                            items: TypeProtectionSchema
            '400':
                description: Не удалось получить данные!
                content:
                    app/json:
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
def add_type_protection_view() -> tuple[dict, int]:
    """

    :return:
    ---
    post:
        summary: Добавить тип защит
        description: Добавить тип защит
        requestBody:
            content:
                app/json:
                    schema: AddTypeProtectionSchema
        responses:
            '200':
                description: Данные успешно добавлены
                content:
                    app/json:
                        schema: BinaryResponseSchema
                        examples:
                            Good:
                                value:
                                    message: good
                                    result: true
            '400':
                description: Не удалось добавить данные!
                content:
                    app/json:
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
        type_protection_data = AddTypeProtectionSchema().load(data)
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

    type_protection = add_type_protection(
        type_protection_data.get("name")
    )
    current_app.logger.debug(f"type_protection add id - {type_protection.id}")
    return BinaryResponseSchema().dump(
        {"message": "Тип защиты объекта успешно добавлен!", "result": True}
    )


@bp.route("/type-protection/", methods=["PUT"])
def update_type_protection_view() -> tuple[dict, int]:
    """

    :return:
    ---
    put:
        summary: Изменить тип защит
        description: Изменить тип защит
        requestBody:
            content:
                app/json:
                    schema: UpdateTypeProtectionSchema
        responses:
            '200':
                description: Данные успешно добавлены
                content:
                    app/json:
                        schema: BinaryResponseSchema
                        examples:
                            Good:
                                value:
                                    message: good
                                    result: true
            '400':
                description: Не удалось добавить данные!
                content:
                    app/json:
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
        type_protection_data = UpdateTypeProtectionSchema().load(data)
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

    result_update = update_type_protection(
        type_protection_data.get("id"),
        type_protection_data.get("name"),
    )

    if not result_update:
        return (
            BinaryResponseSchema().dump(
                {
                    "message": "Не удалось изменить данные!",
                    "result": False
                }
            ),
            http.HTTPStatus.BAD_REQUEST,
        )

    return BinaryResponseSchema().dump(
        {"message": "Данные типа защиты успешно изменены!", "result": True}
    )


@bp.route("/location/", methods=["GET"])
def get_mn_location_view() -> tuple[dict, int]:
    """

    :return:
    ---
    get:
        summary: Получить информацию по конкретной локации
        description: Получить информацию по конкретной локации
        parameters:
            -   in: query
                schema: GetLocationSchema
        responses:
            '200':
                description: Список объектов
                content:
                    app/json:
                        schema: LocationSchema
            '400':
                description: Не удалось получить данные!
                content:
                    app/json:
                        schema: BinaryResponseSchema
        tags:
            - masking
    """

    data = request.args.to_dict()

    current_app.logger.debug(f"location data - {data}")
    try:
        location = GetLocationSchema().load(data)
    except ValidationError as err:
        current_app.logger.debug(f"ValidationError - {err}")
        return (
            BinaryResponseSchema().dump(
                {"message": "Неверные входные данные!", "result": False}
            ),
            http.HTTPStatus.BAD_REQUEST,
        )

    return (
        LocationSchema().dump(location),
        http.HTTPStatus.OK,
    )


@bp.route("/location-list/", methods=["GET"])
def get_mn_location_list_view() -> tuple[dict, int]:
    """

    :return:
    ---
    get:
        summary: Получить список локаций
        description: Получить список локаций
        parameters:
            -   in: query
                schema: FilterParamLocationSchema
        responses:
            '200':
                description: Список объектов
                content:
                    app/json:
                        schema: LocationListSchema
            '400':
                description: Не удалось получить данные!
                content:
                    app/json:
                        schema: BinaryResponseSchema
        tags:
            - masking
    """

    data = dict()
    data["ids_type_protection[]"] = request.args.getlist(
        "ids_type_protection[]"
    )
    data["ids_type_location[]"] = request.args.getlist("ids_type_location[]")
    data["name"] = request.args.get("name")
    current_app.logger.debug(f"mn objects data - {data}")

    try:
        locations = FilterParamLocationSchema().load(data)
    except ValidationError as err:
        current_app.logger.debug(f"ValidationError - {err}")
        return (
            BinaryResponseSchema().dump(
                {"message": "Неверные входные данные!", "result": False}
            ),
            http.HTTPStatus.BAD_REQUEST,
        )

    locations_ser, pagination = serialize_paginate_object(locations)
    result = {"locations": locations_ser, "pagination": pagination}

    return (
        LocationListSchema().dump(result),
        http.HTTPStatus.OK,
    )


@bp.route("/location/", methods=["POST"])
def add_mn_location_view() -> tuple[dict, int]:
    """

    :return:
    ---
    post:
        summary: Добавить локацию
        description: Добавить локацию
        requestBody:
            content:
                app/json:
                    schema: AddMNObjectSchema
        responses:
            '200':
                description: Данные успешно добавлены
                content:
                    app/json:
                        schema: BinaryResponseSchema
                        examples:
                            Good:
                                value:
                                    message: good
                                    result: true
            '400':
                description: Не удалось добавить данные!
                content:
                    app/json:
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
        location_data = AddLocationSchema().load(data)
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

    location = add_location(
        location_data.get("name"),
        location_data.get("id_protection"),
        location_data.get("id_parent"),
    )
    current_app.logger.debug(f"location add id - {location.id}")

    return BinaryResponseSchema().dump(
        {"message": "Объект успешно добавлен!", "result": True}
    )


@bp.route("/location/", methods=["PUT"])
def update_mn_location_view() -> tuple[dict, int]:
    """

    :return:
    ---
    put:
        summary: Изменить локацию
        description: Изменить локацию
        requestBody:
            content:
                app/json:
                    schema: UpdateLocationSchema
        responses:
            '200':
                description: Данные успешно добавлены
                content:
                    app/json:
                        schema: BinaryResponseSchema
                        examples:
                            Good:
                                value:
                                    message: good
                                    result: true
            '400':
                description: Не удалось добавить данные!
                content:
                    app/json:
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
        location_data = UpdateLocationSchema().load(data)
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

    result_update = update_location(
        location_data.get("id"),
        location_data.get("name"),
        location_data.get("id_parent"),
    )

    if not result_update:
        return (
            BinaryResponseSchema().dump(
                {
                    "message": "Не удалось изменить данные!",
                    "result": False
                }
            ),
            http.HTTPStatus.BAD_REQUEST,
        )

    return BinaryResponseSchema().dump(
        {"message": "Данные локации успешно изменены!", "result": True}
    )


@bp.route("/type-location/", methods=["GET"])
def get_type_location_list_view() -> tuple[dict, int]:
    """
    ---
    get:
        summary: Получить список типов объектов
        responses:
            '200':
                description: Список типов объектов
                content:
                    app/pdf:
                        schema:
                            type: array
                            items: TypeLocationSchema
            '400':
                description: Плохой запрос
                content:
                    app/json:
                        schema: BinaryResponseSchema
        tags:
            - masking
    """

    type_objects = get_type_location_list()

    return (
        jsonify(TypeLocationSchema().dump(type_objects, many=True)),
        http.HTTPStatus.OK,
    )


@bp.route("/type-location/", methods=["POST"])
def add_type_location_view() -> tuple[dict, int]:
    """
    ---
    post:
        summary: Добавить тип локаций
        requestBody:
            description:
            content:
                application/json:
                    schema: AddTypeLocationSchema
        responses:
            '200':
                description: Список типов объектов
                content:
                    app/pdf:
                        schema: BinaryResponseSchema
            '400':
                description: Плохой запрос
                content:
                    app/json:
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
        type_location = AddTypeLocationSchema().load(data)
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
        {"message": "Тип локации успешно добавлен!", "result": True}
    )


@bp.route("/type-location/", methods=["PUT"])
def update_type_location_view() -> tuple[dict, int]:
    """
    ---
    put:
        summary: Изменить тип локаций
        requestBody:
            description:
            content:
                application/json:
                    schema: UpdateTypeLocationSchema
        responses:
            '200':
                description: Список типов объектов
                content:
                    app/pdf:
                        schema: BinaryResponseSchema
            '400':
                description: Плохой запрос
                content:
                    app/json:
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
        type_location_data = UpdateTypeLocationSchema().load(data)
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

    result_update = update_type_location(
        type_location_data.get("id"),
        type_location_data.get("name"),
    )

    if not result_update:
        return (
            BinaryResponseSchema().dump(
                {
                    "message": "Не удалось изменить данные!",
                    "result": False
                }
            ),
            http.HTTPStatus.BAD_REQUEST,
        )

    return BinaryResponseSchema().dump(
        {"message": "Тип локации успешно изменен!", "result": True}
    )


@bp.route("/relationship/location-location/", methods=["POST"])
def update_relationship_location_parent():
    """
    ---
    post:
        summary: Добавить связь между локацией и локацией
        requestBody:
            description:
            content:
                application/json:
                    schema: RelationshipLocationLocationSchema
        responses:
            '200':
                description: Результат добавления связи
                content:
                    app/pdf:
                        schema: BinaryResponseSchema
            '400':
                description: Плохой запрос
                content:
                    app/json:
                        schema: BinaryResponseSchema
        tags:
            - relationship
    """

    if not request.json:
        return (
            BinaryResponseSchema().dump(MESSAGES_DICT["NO_JSON"]),
            http.HTTPStatus.BAD_REQUEST,
        )

    data = request.json

    try:
        rel_locations_data = RelationshipLocationLocationSchema().load(data)
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

    update_rel_location_location(
        rel_locations_data.get("location_id"),
        rel_locations_data.get("location_ids"),
    )

    return BinaryResponseSchema().dump(
        {"message": "Тип локации успешно добавлен!", "result": True}
    )


@bp.route("/relationship/location-protection/", methods=["POST"])
def update_relationship_location_protection():
    """
    ---
    post:
        summary: Добавить связь между локацией и защитой
        requestBody:
            description:
            content:
                application/json:
                    schema: RelationshipLocationProtectionSchema
        responses:
            '200':
                description: Результат добавления связи
                content:
                    app/pdf:
                        schema: BinaryResponseSchema
            '400':
                description: Плохой запрос
                content:
                    app/json:
                        schema: BinaryResponseSchema
        tags:
            - relationship
    """

    if not request.json:
        return (
            BinaryResponseSchema().dump(MESSAGES_DICT["NO_JSON"]),
            http.HTTPStatus.BAD_REQUEST,
        )

    data = request.json

    try:
        rel_loc_prot_data = RelationshipLocationProtectionSchema().load(data)
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

    update_rel_location_protection(
        rel_loc_prot_data.get("location_id"),
        rel_loc_prot_data.get("protections_ids"),
    )

    return BinaryResponseSchema().dump(
        {"message": "Тип локации успешно добавлен!", "result": True}
    )
