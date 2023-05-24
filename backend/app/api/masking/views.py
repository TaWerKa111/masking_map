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
    TypeProtectionSchema,
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
    GetLocationSchema,
    ProtectionListSchema,
    RelationshipLocationLocationSchema,
    RelationshipLocationProtectionSchema,
)
from app.api.helpers.schemas import BinaryResponseSchema
from app.api.masking.helpers import (
    get_protection_list,
    get_type_protection_list,
    get_type_location_list,
    get_departament_work_list,
    update_type_work,
    add_departament,
    update_departament,
    add_protection,
    update_protection,
    update_type_protection,
    add_location,
    update_location,
    update_type_location,
    update_rel_location_location,
    update_rel_location_protection, delete_dep, delete_type_work,
    delete_protection, delete_type_protection, delete_location,
    delete_type_location,
)


bp = Blueprint("masking_api", __name__, url_prefix="/api/masking/")


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
                        schema: TypeWorkListSchema
            '400':
                description: Не удалось получить данные!
                content:
                    app/json:
                        schema: BinaryResponseSchema
        tags:
            - masking
    """

    data = dict()
    data["type_protection_ids[]"] = request.args.getlist(
        "type_protection_ids[]"
    )
    data["type_location_ids[]"] = request.args.getlist("type_location_ids[]")
    data["departament_ids[]"] = request.args.getlist("departament_ids[]")
    data["name"] = request.args.get("name")

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
    current_app.logger.debug(f"tw params - {data}")

    type_works, pagination = serialize_paginate_object(type_work_list)
    # current_app.logger.info(f"type works {type_works[1].departament}")
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
        AddTypeWorkSchema().load(data)
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

    current_app.logger.debug(f"data {type_work_data}")
    result_update = update_type_work(
        type_work_data.get("id"),
        type_work_data.get("name"),
        type_work_data.get("departament_id"),
    )

    if not result_update:
        return (
            BinaryResponseSchema().dump(
                {"message": "Не удалось изменить данные!", "result": False}
            ),
            http.HTTPStatus.BAD_REQUEST,
        )

    return BinaryResponseSchema().dump(
        {"message": "Тип работы успешно изменен!", "result": True}
    )


@bp.route("/type-work/", methods=["DELETE"])
def delete_type_work_view():
    """

    :return:
    ---
    delete:
        summary: Удалить вид работ
        description: Удаление вида работ
        parameters:
            -   in: query
                name: type_work_id
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
            - masking
    """

    type_work_id = request.args.get("type_work_id")

    result = delete_type_work(type_work_id)
    if result:
        return BinaryResponseSchema().dump(
            {
                "message": "Удаление прошло успешно!",
                "result": True
            }
        )

    return BinaryResponseSchema().dump({
        "message": "Не удалось удалить!",
        "result": False
    }), http.HTTPStatus.BAD_REQUEST


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
                {"message": "Не удалось изменить данные!", "result": False}
            ),
            http.HTTPStatus.BAD_REQUEST,
        )

    return BinaryResponseSchema().dump(
        {"message": "Данные отдела успешно изменены!", "result": True}
    )


@bp.route("/departament-type-work/", methods=["DELETE"])
def delete_departament_type_work_view():
    """

    :return:
    ---
    delete:
        summary: Удалить отдел
        description: Удаление отдела
        parameters:
            -   in: query
                name: dep_id
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
            - masking
    """

    dep_id = request.args.get("dep_id")

    result = delete_dep(dep_id)
    if result:
        return BinaryResponseSchema().dump(
            {
                "message": "Удаление прошло успешно!",
                "result": True
            }
        )

    return BinaryResponseSchema().dump({
        "message": "Не удалось удалить!",
        "result": False
    }), http.HTTPStatus.BAD_REQUEST


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
    data = dict()
    data["name"] = request.args.get("name")
    data["type_protections_ids[]"] = request.args.getlist("type_protections_ids[]")
    data["limit"] = request.args.get("limit", 1000)

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
    current_app.logger.debug(f"param - {data}")
    protection_list = get_protection_list(
        name=data.get("name"),
        type_protection_ids=data.get("type_protections_ids"),
        page=data.get("page"),
        limit=data.get("limit", 1000),
    )

    protections, pagination = serialize_paginate_object(protection_list)
    result = {"protections": protections, "pagination": pagination}
    current_app.logger.debug(
        f"protection list - {protections[0].type_protection}"
    )

    return (
        ProtectionListSchema().dump(result),
        http.HTTPStatus.OK,
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
        protection_data.get("is_end"),
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
                {"message": "Не удалось изменить данные!", "result": False}
            ),
            http.HTTPStatus.BAD_REQUEST,
        )

    return BinaryResponseSchema().dump(
        {"message": "Данные защиты успешно изменены!", "result": True}
    )


@bp.route("/protection/", methods=["DELETE"])
def delete_protection_view():
    """

    :return:
    ---
    delete:
        summary: Удалить защиту
        description: Удаление защит
        parameters:
            -   in: query
                name: protection_id
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
            - masking
    """

    protection_id = request.args.get("protection_id")

    result = delete_protection(protection_id)
    if result:
        return BinaryResponseSchema().dump(
            {
                "message": "Удаление прошло успешно!",
                "result": True
            }
        )

    return BinaryResponseSchema().dump({
        "message": "Не удалось удалить!",
        "result": False
    }), http.HTTPStatus.BAD_REQUEST


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
    current_app.logger.debug(f"data - {data}")

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
                {"message": "Не удалось изменить данные!", "result": False}
            ),
            http.HTTPStatus.BAD_REQUEST,
        )

    return BinaryResponseSchema().dump(
        {"message": "Данные типа защиты успешно изменены!", "result": True}
    )


@bp.route("/type-protection/", methods=["DELETE"])
def delete_type_protection_view():
    """

    :return:
    ---
    delete:
        summary: Удалить систему защит
        description: Удаление системы защит
        parameters:
            -   in: query
                name: type_protection_id
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
            - masking
    """

    type_protection_id = request.args.get("type_protection_id")

    result = delete_type_protection(type_protection_id)
    if result:
        return BinaryResponseSchema().dump(
            {
                "message": "Удаление прошло успешно!",
                "result": True
            }
        )

    return BinaryResponseSchema().dump({
        "message": "Не удалось удалить!",
        "result": False
    }), http.HTTPStatus.BAD_REQUEST


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
    data["type_protection_ids[]"] = request.args.getlist(
        "type_protection_ids[]"
    )
    data["type_location_ids[]"] = request.args.getlist("type_location_ids[]")
    data["name"] = request.args.get("name")
    data["parent_ids[]"] = request.args.getlist("parent_ids[]", None)
    data["limit"] = request.args.get("limit", 1000)
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
    # current_app.logger.debug(f"result - {locations.items[0].id_type}")

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
                    schema: AddLocationSchema
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
        location_data.get("ind_location"),
        location_data.get("id_parent"),
        location_data.get("id_type_location"),
    )
    current_app.logger.debug(f"location add id - {location}")

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
                {"message": "Не удалось изменить данные!", "result": False}
            ),
            http.HTTPStatus.BAD_REQUEST,
        )

    return BinaryResponseSchema().dump(
        {"message": "Данные локации успешно изменены!", "result": True}
    )


@bp.route("/location/", methods=["DELETE"])
def delete_location_view():
    """

    :return:
    ---
    delete:
        summary: Удалить место проведения работ
        description: Удаление места проведения работ
        parameters:
            -   in: query
                name: location_id
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
            - masking
    """

    location_id = request.args.get("location_id")

    result = delete_location(location_id)
    if result:
        return BinaryResponseSchema().dump(
            {
                "message": "Удаление прошло успешно!",
                "result": True
            }
        )

    return BinaryResponseSchema().dump({
        "message": "Не удалось удалить!",
        "result": False
    }), http.HTTPStatus.BAD_REQUEST


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
        AddTypeLocationSchema().load(data)
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
                {"message": "Не удалось изменить данные!", "result": False}
            ),
            http.HTTPStatus.BAD_REQUEST,
        )

    return BinaryResponseSchema().dump(
        {"message": "Тип локации успешно изменен!", "result": True}
    )


@bp.route("/type-location/", methods=["DELETE"])
def delete_type_location_view():
    """

    :return:
    ---
    delete:
        summary: Удалить тип места проведения работ
        description: Удаление типа места проведения работ
        parameters:
            -   in: query
                name: type_location_id
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
            - masking
    """

    type_location_id = request.args.get("type_location_id")

    result = delete_type_location(type_location_id)
    if result:
        return BinaryResponseSchema().dump(
            {
                "message": "Удаление прошло успешно!",
                "result": True
            }
        )

    return BinaryResponseSchema().dump({
        "message": "Не удалось удалить!",
        "result": False
    }), http.HTTPStatus.BAD_REQUEST


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
        {"message": "Связь локаций успешно добавлена!", "result": True}
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
        rel_loc_prot_data.get("protection_ids"),
    )

    return BinaryResponseSchema().dump(
        {"message": "Связь успешно добавлена!", "result": True}
    )
