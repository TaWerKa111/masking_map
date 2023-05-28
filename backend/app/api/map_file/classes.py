import datetime
import uuid
from abc import ABC, abstractmethod

from app import db
from common.postgres.models import MaskingMapFile
from config import AppConfig


class MapAbstract(ABC):
    @abstractmethod
    def generate_map(self):
        pass


class MpsaMap(MapAbstract):
    def __init__(
        self, protections, description, logic_machine_answer, is_test=False
    ):
        self.protections = protections
        self.description = description
        self.logic_machine_answer = logic_machine_answer
        self.is_test = is_test

    def generate_map(self):
        protection_names = []

        for protection in self.protections:
            protection_names.append({
                "name": protection.name
            })

        masking_uuid = uuid.uuid4()
        masking_data = {
            "number_pril": "",
            "number_project": "",
            "date": datetime.date.today().strftime("%d.%m.%Y"),
            "name_nps": "",
            "protection_cspa": [
                {
                    "name": protection_names,
                }
            ],
        }

        masking_map = MaskingMapFile(
            description=self.description,
            filename=(
                f"Карта Маскирования от "
                f"{datetime.date.today().strftime('%d_%m_%Y')}"
            ),
            data_masking=masking_data,
            masking_uuid=masking_uuid,
            logic_machine_answer={
                "list": self.logic_machine_answer
            },
            is_test=self.is_test,
            is_valid=True
        )

        db.session.add(masking_map)
        db.session.commit()
        return masking_map.masking_uuid


class CspaMap(MapAbstract):
    def __init__(
        self, protections, description, logic_machine_answer, is_test=False
    ):
        self.protections = protections
        self.description = description
        self.logic_machine_answer = logic_machine_answer
        self.is_test = is_test

    def generate_map(self):
        protection_names = []

        for protection in self.protections:
            protection_names.append({
                "name": protection.name
            })

        masking_uuid = uuid.uuid4()
        masking_data = {
            "number_pril": "",
            "number_project": "",
            "date": datetime.date.today().strftime("%d.%m.%Y"),
            "name_nps": "",
            "protection_cspa": [
                {
                    "name": protection_names,
                }
            ],
        }

        masking_map = MaskingMapFile(
            description=self.description,
            filename=(
                f"Карта Маскирования от "
                f"{datetime.date.today().strftime('%d_%m_%Y')}"
            ),
            data_masking=masking_data,
            masking_uuid=masking_uuid,
            logic_machine_answer={
                "list": self.logic_machine_answer
            },
            is_test=self.is_test,
            is_valid=True
        )

        db.session.add(masking_map)
        db.session.commit()
        return masking_map.masking_uuid


HANDLERS = {
    AppConfig.MPSA: MpsaMap,
    AppConfig.CSPA: CspaMap
}
