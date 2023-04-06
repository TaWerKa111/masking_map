import sys

import click

from common.postgres.models import User
from application import db
from flask import Blueprint, current_app

from config import AppConfig

bp = Blueprint("create_user", __name__)


@bp.cli.command("user")
@click.option(
    "--login", "-L", required=True, help="Login of user"
)
@click.option(
    "--password", "-P", required=True, help="password of user"
)
@click.option(
    "--role", "-R", required=False, help="role of user"
)
def create_user(
        login: str, password: str, role: str = AppConfig.ROLE.ADMIN) -> None:
    """

    :param login: str,
        логин пользователя, является уникальным
    :param password: str,
        пароль пользователя
    :param role: str,
        роль пользователя
    :return: None
    """

    user = db.session.query(User).filter(
        User.username == login
    ).first()

    if user:
        user.role = role
        db.session.commit()
        current_app.logger.info(f"User is already exists - {login}")
        sys.exit(0)

    user = User(
        username=login,
        role=role
    )
    user.set_password(password)

    db.session.add(user)
    db.session.commit()
