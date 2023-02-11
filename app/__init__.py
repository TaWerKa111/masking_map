from flask import Flask

from flask_cors import CORS

from flask_sqlalchemy import SQLAlchemy

from config import AppConfig

app = Flask(
    __name__, static_url_path="/static", template_folder="../common/templates"
)
app.config.from_object("config.AppConfig")

db = SQLAlchemy(app)

# add CORS for api resource. All origins
CORS(
    app,
    resources={r"/api/*": {"origins": "*"}},
    supports_credentials=AppConfig.Access_Control_Allow_Credentials,
)

from app.api.masking.views import bp as api_masking  # noqa:
from app.api.test.views import bp as api_test  # noqa:

app.register_blueprint(api_masking)
app.register_blueprint(api_test)

