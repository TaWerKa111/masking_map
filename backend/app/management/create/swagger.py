from flask import Blueprint, current_app

from app import db
from app.api.map_file_v2.classes import StateCache, UserParams
from app.api.swagger.helpers import create_spec
import sys

import click

from common.postgres.models import User
from config import AppConfig

bp = Blueprint("create", __name__)
bp.cli.short_help = "Create any objects: Swagger, User"


@bp.cli.command("swagger")
def create_swagger() -> None:
    """
    Создание swagger документации.
    """

    create_spec()
    current_app.logger.info(f"Файл со swagger документацией создан!")
    sys.exit(0)


@bp.cli.command("user")
@click.option("--login", "-L", required=True, help="Login of user")
@click.option("--password", "-P", required=True, help="password of user")
@click.option("--role", "-R", required=False, help="role of user")
def create_user(
    login: str, password: str, role: str = AppConfig.ROLE.ADMIN
) -> None:
    """
    Создание пользователя.
    :param login: str,
        логин пользователя, является уникальным
    :param password: str,
        пароль пользователя
    :param role: str,
        роль пользователя
    :return: None
    """

    user = db.session.query(User).filter(User.username == login).first()

    if user:
        user.role = role
        db.session.commit()
        current_app.logger.info(f"User is already exists - {login}")
        sys.exit(0)

    user = User(username=login, role=role)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()


@bp.cli.command("map")
def mapping():
    # masking_uuid = str(uuid.uuid4())
    # print(masking_uuid)
    masking_uuid = "0cae6cf9-bfd4-4452-bf9a-4536a86b2867"
    state = StateCache(masking_uuid)

    user_params = {
        "type_work_ids": [5],
        "location_ids": [],
        "type_location_ids": [],
        "questions": [],
    }

    user_params = UserParams(**user_params)
    print(user_params)
    data = state.check_rule(user_params)
    # for i in data:
    #     print(f"{i.get('id')} {i.get('name')}")
    #     if i.get("description"):
    #         print(i.get("description"))
    print(f"data - {data}")
