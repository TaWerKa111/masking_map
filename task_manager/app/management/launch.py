from flask import Blueprint, current_app
import click

bp = Blueprint("launch", __name__)
bp.cli.short_help = "Launch consumer"


@bp.cli.command("consumer")
@click.option("--thread", "-t", required=True, help="threading")
@click.option("--debug", "-d", required=True, help="on debug mode")
def consumer(
    thread: int, debug: bool
) -> None:
    pass
