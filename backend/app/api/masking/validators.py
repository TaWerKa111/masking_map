from marshmallow import ValidationError

from app import db
from common.postgres.models import TypeWork, Location


def is_not_exist_type_work(id_type_work):
    type_work = (
        db.session()
        .query(TypeWork)
        .filter(TypeWork.id == id_type_work)
        .first()
    )

    if not type_work:
        raise ValidationError("нет такой работы!")


def is_not_exist_mn_object(id_object):
    type_work = (
        db.session().query(Location).filter(Location.id == id_object).first()
    )

    if not type_work:
        raise ValidationError("нет такой работы!")
