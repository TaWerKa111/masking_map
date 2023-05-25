from flask import Blueprint, current_app
import click

from app.transport.consumer.database import DataBaseConsumer

bp = Blueprint("launch", __name__)
bp.cli.short_help = "Launch consumer"


@bp.cli.command("consumer")
@click.option("--thread", "-t", required=True, help="threading")
@click.option("--debug", "-d", required=True, help="on debug mode")
def start_consumer(
    thread: int, debug: bool
) -> None:
    consumer = DataBaseConsumer()
    consumer.start()

