import http

from flask import Blueprint, request, current_app
from marshmallow import ValidationError

from app import auth
from app.api.auth.helpers import login_user, logout_user
from app.api.auth.schemas import LoginSchema
from app.api.helpers.messages import MESSAGES_DICT
from app.api.helpers.schemas import BinaryResponseSchema

bp = Blueprint("api_auth", __name__, url_prefix="/api/auth/")


@bp.route("/login/")
def login() -> tuple[dict, int]:
    """
    Авторизация пользователя в приложении
    :return: tuple[dict, int]
    ---
    post:
        summary: Авторизоваться в приложении
        description: Авторизация в приложении по логину и паролю
        requestBody:
            content:
                app/json:
                    schema: LoginSchema
        responses:
            '200':
                description: Пользователь успешно залогинился
                content:
                    app/json:
                        schema: BinaryResponseSchema
            '400':
                description: Неудачный запрос
                content:
                    app/json:
                        schema: BinaryResponseSchema
        tags:
            -   auth
    """
    if not request.json:
        return (
            BinaryResponseSchema().dump(MESSAGES_DICT["NO_JSON"]),
            http.HTTPStatus.BAD_REQUEST,
        )

    data = request.json

    try:
        user = LoginSchema().load(data)
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
    login_user(user)
    return BinaryResponseSchema().dump(
        {"message": "Тип работы успешно добавлен!", "result": True}
    )


@bp.route("/logout/")
@auth.login_required
def logout() -> tuple[dict, int]:
    """

    :return: tuple[dict, int]
    ---
    get:
        summary: Выйти из приложения
        description: Выйти из приложения
        responses:
            '200':
                description: Пользователь удачно разлогинился
                content:
                    app/json:
                        schema: BinaryResponseSchema
            '401': Unauthorized
        tags:
            -   auth
    """

    logout_user()
    return (
        BinaryResponseSchema().dump(
            {"message": "Пользователь разлогинился!", "result": False}
        ),
        http.HTTPStatus.OK,
    )


@bp.route("/test/")
@auth.login_required
def test_log() -> tuple[dict, int]:
    return {"message": "Под логином!"}, 200
