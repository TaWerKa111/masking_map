from flask import Flask

from flask_sqlalchemy import SQLAlchemy


app = Flask(
    __name__, static_url_path="/static", template_folder="../common/templates"
)

app.config.from_object("config.AppConfig")
app.config["DEBUG"] = True

db = SQLAlchemy(app)

from app.management.create.swagger import bp as cli_launch  # noqa:
app.register_blueprint(cli_launch)
