import http

from flask import Blueprint, request, current_app, Response
from marshmallow import ValidationError

from app.api.helpers.messages import MESSAGES_DICT
from app.api.helpers.schemas import BinaryResponseSchema
from app.api.helpers.utils import serialize_paginate_object
from app.api.map_file.helpers import (
    generate_file,
    render_masking_map,
    get_filtered_files, add_masking_file,
)
from app.api.map_file.schemas import (
    GetListFilesMaskingSchema,
    ListFileMaskingSchema,
    GenerateMaskingPlanSchema,
    MaskingResponseFileSchema, CheckMaskingFileSchema,
)
from app.api.map_file.helpers import check_generate_masking_plan

bp = Blueprint("api_files", __name__, url_prefix="/api/files/")


@bp.route("/get-pdf/")
def get_file_view() -> Response or tuple[dict, int]:
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
                    app/pdf:
                        schema:
                            type: file
            '400':
                description: Файл не существует
                content:
                    app/json:
                        schema: BinaryResponseSchema
        tags:
            - map_files
    """

    masking_uuid = request.args.get("masking_uuid")

    if not masking_uuid:
        return (
            BinaryResponseSchema().dump(
                {"message": "Файл не существует!", "result": False}
            ),
            http.HTTPStatus.BAD_REQUEST,
        )

    map_file_path = generate_file(masking_uuid)
    current_app.logger.debug(f"filename view - {map_file_path}")

    with open(map_file_path, "rb") as map_file:
        map_file_data = map_file.read()

    return Response(
        map_file_data,
        mimetype="app/pdf",
        headers={"Content-Disposition": f"attachment;filename={'map.pdf'}"},
    )


@bp.route("/get-html/")
def get_html_view() -> Response or tuple[dict, int]:
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
                    app/json:
                        schema: BinaryResponseSchema
        tags:
            - map_files
    """

    masking_uuid = request.args.get("masking_uuid")

    if not masking_uuid:
        return (
            BinaryResponseSchema().dump(
                {"message": "Файл не существует!", "result": False}
            ),
            http.HTTPStatus.BAD_REQUEST,
        )
    current_app.logger.debug(f"masking_uuid - {masking_uuid}")
    map_html_data = render_masking_map(masking_uuid)

    return Response(
        map_html_data,
        mimetype="text/html",
    )


@bp.route("/get-files/")
def get_files_views() -> tuple[dict, int]:
    """

    :return:
    ---
    get:
        description: Фильтрация списка файлов карт маскирования
        summary: Получить отфильтрованный список карт
        parameters:
            -   in: query
                schema: GetListFilesMaskingSchema
        responses:
            '200':
                description: Список карт
                content:
                    app/json:
                        schema: ListFileMaskingSchema
            '400':
                description: Ошибка при получении
                content:
                    app/json:
                        schema: BinaryResponseSchema

        tags:
            - map_files
    """

    data = dict()
    data["protection_ids[]"] = request.args.getlist("protection_ids[]")
    data["type_work_ids[]"] = request.args.getlist("type_work_ids[]")
    data["type_location_ids[]"] = request.args.getlist("type_location_ids[]")

    try:
        filter_data = GetListFilesMaskingSchema().load(data)
    except ValidationError as err:
        current_app.logger.debug(f"err - {err}", exc_info=True)
        return (
            BinaryResponseSchema().dump({"message": "", "result": False}),
            http.HTTPStatus.BAD_REQUEST,
        )
    current_app.logger.debug(f"filter data - {filter_data}")
    files = get_filtered_files(
        protection_ids=filter_data.get("protection_ids"),
        type_work_ids=filter_data.get("type_work_ids"),
        type_location_ids=filter_data.get("type_location_ids"),
        page=filter_data.get("page", 1), limit=filter_data.get("limit", 1000)
    )
    files_ser, pagination = serialize_paginate_object(files)
    result = {"files": files_ser, "pagination": pagination}

    return ListFileMaskingSchema().dump(result), http.HTTPStatus.OK


@bp.route("/generate-masking/", methods=["POST"])
def generate_masking_view():
    """

    :return:
    ---
    post:
        summary: Сгенерировать карту маскирования
        description: Генерация карты маскирования
        requestBody:
            description: Параметры
            content:
                application/json:
                    schema: GenerateMaskingPlanSchema
        responses:
            '200':
                description: Результат проверки
                content:
                    app/json:
                        schema: BinaryResponseSchema
            '400':
                description: Карта не нужна
                content:
                    app/json:
                        schema: BinaryResponseSchema
        tags:
            - map_files
    """

    if not request.json:
        return (
            BinaryResponseSchema().dump(MESSAGES_DICT["NO_JSON"]),
            http.HTTPStatus.BAD_REQUEST,
        )

    data = request.json

    try:
        data_for_masking = GenerateMaskingPlanSchema().load(data)
    except ValidationError as err:
        current_app.logger.debug(f"Validation error - {err}")
        return (
            BinaryResponseSchema().dump(
                {"message": f"{err}", "result": False}
            ),
            http.HTTPStatus.BAD_REQUEST,
        )

    current_app.logger.debug(f"mask data - {data_for_masking}")

    result_gen_map = check_generate_masking_plan(
        locations=data_for_masking.get("locations"),
        type_works=data_for_masking.get("type_works"),
        questions=data_for_masking.get("questions"),
    )

    current_app.logger.debug(
        f"result - {result_gen_map.result}\n"
        f"logic_machine_answer - {result_gen_map.logic_machine_answer}\n"
        f"protections - {result_gen_map.protections}\n"
    )

    if result_gen_map.result:
        data_for_masking["protections"] = [
            protection.id for protection in result_gen_map.protections]
        masking_uuid = add_masking_file(
            result_gen_map.protections,
            result_gen_map.description,
            logic_machine_answer=result_gen_map.logic_machine_answer,
            is_test=data_for_masking.get("is_test"),
            params=data_for_masking
        )

        return (
            MaskingResponseFileSchema().dump(
                {
                    "message": "Возможно сделать карту маскирования!",
                    "masking_uuid": masking_uuid,
                    "result": True,
                    "description": result_gen_map.description,
                    "logic_machine_answer": result_gen_map.logic_machine_answer
                }
            ),
            http.HTTPStatus.OK,
        )

    return (
        MaskingResponseFileSchema().dump(
            {
                "message": "Нет. Невозможно сделать карту маскирования!",
                "result": False,
                "description": result_gen_map.description,
                "logic_machine_answer": result_gen_map.logic_machine_answer
            }
        ),
        http.HTTPStatus.BAD_REQUEST,
    )


@bp.route("/check-masking-map-file/_private/", methods=["POST"])
def check_masking_map_file_view():
    """

    :return:
    """

    data = request.json

    try:
        data_for_masking = CheckMaskingFileSchema().load(data)
    except ValidationError as err:
        current_app.logger.debug(f"Validation error - {err}")
        return (
            BinaryResponseSchema().dump(
                {"message": f"{err}", "result": False}
            ),
            http.HTTPStatus.BAD_REQUEST,
        )

    current_app.logger.debug(f"mask data - {data_for_masking}")

    result_gen_map = check_generate_masking_plan(
        locations=data_for_masking.get("locations"),
        type_works=data_for_masking.get("type_works"),
        questions=data_for_masking.get("questions"),
    )

    if result_gen_map.result:
        return (
            BinaryResponseSchema().dump(
                {
                    "message": "Карта маскирования действительная!",
                    "result": True,
                }
            ),
            http.HTTPStatus.OK,
        )

    return (
        BinaryResponseSchema().dump(
            {
                "message": "Карта маскирования НЕ действительная!",
                "result": False,
            }
        ),
        http.HTTPStatus.BAD_REQUEST,
    )
