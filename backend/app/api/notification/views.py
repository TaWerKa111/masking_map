import http

from flask import Blueprint, current_app, request
from marshmallow import ValidationError

from app import db
from app.api.helpers.decorators import login_required
from app.api.helpers.schemas import BinaryResponseSchema
from app.api.helpers.utils import serialize_paginate_object
from app.api.notification.schemas import GetNotifySchema, NotifyListSchema
from common.postgres.models import Notification

bp = Blueprint("api_notify", __name__, url_prefix="/api/notify/")


@bp.route("/")
# @login_required()
def get_notify_views():
    """

    :return:
    ---
    get:
        summary: Получить уведомления
        description: Получить уведомления
        requestBody:
            description: Параметры
            content:
                application/json:
                    schema: GetNotifySchema
        responses:
            '200':
                description: Результат проверки
                content:
                    app/json:
                        schema: NotifyListSchema
            '400':
                description: Карта не нужна
                content:
                    app/json:
                        schema: BinaryResponseSchema
        tags:
            - map_files
    """

    def get_notifyes(
        _page=1,
        _limit=1
    ):
        query = (
            db.session.query(Notification)
        )
        _notifications = (
            query.order_by(Notification.created_at.desc())
            .paginate(
                per_page=_limit, page=_page, error_out=False
            )
        )

        return _notifications

    data = dict()
    data["page"] = request.args.get("page", 1)
    data["limit"] = request.args.get("limit", 10)
    try:
        valid_data = GetNotifySchema().load(data)
    except ValidationError as err:
        current_app.logger.debug(f"Validation error - {err}")
        return (
            BinaryResponseSchema().dump(
                {"message": f"{err}", "result": False}
            ),
            http.HTTPStatus.BAD_REQUEST,
        )

    notifications = get_notifyes(
        _page=data.get("page"),
        _limit=data.get("limit")
    )
    notifications_ser, pagination = serialize_paginate_object(notifications)
    result = {"notifications": notifications_ser, "pagination": pagination}

    return (
        NotifyListSchema().dump(result),
        http.HTTPStatus.OK,
    )
