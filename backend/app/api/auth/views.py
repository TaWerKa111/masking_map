import http

from flask import Blueprint, request, current_app
from marshmallow import ValidationError

from app.api.auth.helpers import login_user, logout_user, get_user, add_user, \
    get_user_by_login
from app.api.auth.schemas import LoginSchema, UserSchema
from app.api.helpers.decorators import login_required
from app.api.helpers.messages import MESSAGES_DICT
from app.api.helpers.schemas import BinaryResponseSchema

bp = Blueprint("api_auth", __name__, url_prefix="/api/auth/")


@bp.route("/login/", methods=["POST"])
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
        user_data = LoginSchema().load(data)
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
    user = get_user_by_login(user_data.get("login"))
    if not user:
        return (
            BinaryResponseSchema().dump(
                {"message": "Пользователь не найден!", "result": False}
            ),
            http.HTTPStatus.BAD_REQUEST,
        )
    login_user(user)
    return BinaryResponseSchema().dump(
        {"message": "Успешная авторизация!", "result": True}
    )


@bp.route("/logout/")
@login_required()
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


@bp.route("/current-user/")
def profile() -> tuple[dict, int]:
    """

    :return: tuple[dict, int]
    ---
    get:
        summary: Получить профиль пользователя
        description: Получить профиль пользователя
        responses:
            '200':
                description: Профиль пользователя
                content:
                    app/json:
                        schema: UserSchema
            '401': Unauthorized
        tags:
            -   auth
    """

    # user = get_user()
    username, password = request.headers.get(
        "Authorization").split(":")
    user = get_user_by_login(username)

    if user and user.check_password(password):
        return (
            UserSchema().dump(
                user
            ),
            http.HTTPStatus.OK,
        )
    
    return BinaryResponseSchema().dump({
        "message": "Пользователь не авторизован!",
        "result": False
    }), http.HTTPStatus.UNAUTHORIZED




@bp.route("/test/")
@login_required()
def test_log() -> tuple[dict, int]:
    return {"message": "Под логином!"}, 200
