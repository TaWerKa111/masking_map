import logging.config
import os
import sys
from typing import Type

import yaml

from common.helpers.settings import BaseSetting, SettingField


# Base settings
CURRENT_FILE_PATH = os.path.abspath(__file__)
BASE_DIR = os.path.dirname(CURRENT_FILE_PATH)
LOGGING_CONF = BASE_DIR + "/logging.yaml"

# Logger config read
if os.path.isfile(LOGGING_CONF) and os.access(LOGGING_CONF, os.R_OK):
    _lc_stream = open(LOGGING_CONF, "r")
    _lc_conf = yaml.load(_lc_stream, Loader=yaml.FullLoader)
    _lc_stream.close()
    logging.config.dictConfig(_lc_conf)
else:
    print(f"ERROR: logger config file '{LOGGING_CONF}' not exists or not "
          f"readable\n")
    sys.exit(1)

APP_NAME = os.environ.get("APP_NAME", "transneft_app")


class SqlAlchemyBuilder:
    def __init__(self, settings: Type["PostgresConfig"]):
        self.settings = settings

    def __get__(self, instance, owner):
        return (
            f"postgresql://{self.settings.USER}:{self.settings.PASSWORD}"
            f"@{self.settings.HOST}:{self.settings.PORT}"
            f"/{self.settings.DBNAME}"
            f"?application_name={APP_NAME}"
        )


class PostgresConfig(BaseSetting):
    HOST = SettingField("POSTGRES_HOST", default="db")
    PORT = SettingField("POSTGRES_PORT", int, default=5432)
    USER = SettingField("POSTGRES_USER", default="admin")
    PASSWORD = SettingField("POSTGRES_PASSWORD", default="admin")
    DBNAME = SettingField("POSTGRES_DB", default="app")
    AUTO_CREATE = SettingField("PIM_POSTGRES_AUTO_CREATE", bool, default=False)

    # ssl settings
    SSL_CERT = SettingField("POSTGRES_SSL_CERT", default="")
    SSL_SSLMODE = SettingField("POSTGRES_SSL_MODE", default="")
    SSL_TARGET_SESSION_ATTRS = SettingField(
        "POSTGRES_TARGET_SESSION_ATTRS", default=""
    )


class AppConfig(BaseSetting):
    # Postgres settings
    POSTGRES = PostgresConfig
    SQLALCHEMY_DATABASE_URI = SqlAlchemyBuilder(PostgresConfig)
    # SQLALCHEMY_ECHO = True
    Access_Control_Allow_Credentials = True
