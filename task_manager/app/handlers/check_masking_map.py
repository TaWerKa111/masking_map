import requests

from app import db
from app.handlers.abstract import AbstractHandler
from app.helpers.exeptions import DontValidateFile
from common.postgres.models import MaskingMapFile
from config import AppConfig


class MaskingMapFileHandler(AbstractHandler):
    name = "task"

    def process(self):
        map_files: list[MaskingMapFile] = (
            db.session.query(MaskingMapFile)
            .filter(
                MaskingMapFile.is_test.is_(False),
                MaskingMapFile.is_valid.is_(True),
            )
            .all()
        )

        for map_file in map_files:
            response = requests.post(
                AppConfig.URLS.VALIDATE_FILE,
                map_file.params_masking
            )

            if response.status_code != 200:
                db.session.rollback()
                raise DontValidateFile()

            data = response.json()
            if not data.get("is_valid"):
                map_file.is_valid = False
                db.session.commit()

        return True
