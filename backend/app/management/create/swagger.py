import sys

from flask import Blueprint, current_app

from app.api.swagger.helpers import create_spec

bp = Blueprint("create_swagger", __name__)


@bp.cli.command("swagger")
def create_swagger() -> None:
    """
    Создание swagger документации.
    """

    create_spec()
    current_app.logger.info(f"Файл со swagger документацией создан!")
    sys.exit(0)
