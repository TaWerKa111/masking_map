import sys

from flask import Blueprint, current_app

from application.api.swagger.helpers import create_spec

bp = Blueprint("create", __name__)


@bp.cli.command("swagger")
def create_swagger():
    """
    Создание swagger документации.
    """

    create_spec()
    current_app.logger.info(f"Файл со swagger документацией создан!")
    sys.exit(0)
