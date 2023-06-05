import http
import uuid

from flask import Blueprint, request, current_app
from marshmallow import ValidationError

from app.api.helpers.messages import MESSAGES_DICT
from app.api.helpers.schemas import BinaryResponseSchema
from app.api.map_file.helpers import add_masking_file
from app.api.map_file.schemas import (
    GenerateMaskingPlanSchema,
    MaskingResponseFileSchema,
)
from app.api.map_file_v2.classes import UserParams, StateCache
from app.api.map_file_v2.schemas import GenerateMapV2Schema
from config import AppConfig

bp = Blueprint("api_files_v2", __name__, url_prefix="/api/files/")


@bp.route("/generate-masking-v2/", methods=["POST"])
def generate_masking_v2_view():
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
                    schema: GenerateMapV2Schema
        responses:
            '200':
                description: Результат проверки
                content:
                    app/json:
                        schema: MaskingCriteriaSchema
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
        data_for_masking = GenerateMapV2Schema().load(data)
    except ValidationError as err:
        current_app.logger.debug(f"Validation error - {err}")
        return (
            BinaryResponseSchema().dump(
                {"message": f"{err}", "result": False}
            ),
            http.HTTPStatus.BAD_REQUEST,
        )

    current_app.logger.debug(f"mask data - {data_for_masking}")
    current_app.logger.debug(f"mask data - {data}")

    masking_uuid = request.headers.get(AppConfig.USER_MASKING_UUID)

    if not masking_uuid:
        masking_uuid = str(uuid.uuid4())
    current_app.logger.debug(f"masking_uuid - {masking_uuid}")

    state = StateCache(masking_uuid)
    user_params = UserParams(**data_for_masking)
    current_app.logger.debug(f"user_params - {user_params}")
    data = state.check_rule(user_params)
    current_app.logger.debug(f"view data - {data}")
    if data["result"] is True and data["stage"] == "result":
        data_for_masking["protections"] = [
            protection.get("id") for protection in data["protections"]
        ]
        map_uuid = add_masking_file(
            data.get("protections"),
            data.get("description"),
            logic_machine_answer=data.get("logic_machine_answer"),
            is_test=data_for_masking.get("is_test"),
            params=data_for_masking,
        )
        data["map_uuid"] = map_uuid

    return (data, 200, {AppConfig.USER_MASKING_UUID: masking_uuid})
