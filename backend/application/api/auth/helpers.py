from flask import session

from common.postgres.models import User


def login_user(user: User) -> None:
    """
    Авторизация пользователя, создание куки сессии.

    @param user: User,
        пользователь
    @return: None
    """

    session["user_id"] = user.id
    session["is_login_in"] = True


def logout_user() -> None:
    """
    Выход пользователя. Удаление куки.

    @return: None
    """

    session.pop("user_id", None)
    session.pop("is_login_in", None)
