import datetime
import os
import uuid

from flask import current_app, render_template
from weasyprint import HTML, CSS

from application.api.helpers.exceptions import SqlAlchemyException
from common.postgres.models import (
    TypeWork,
    Protection,
    TypeProtection,
    TypeWorkProtection,
    Location, TypeLocation, StatusProtection, MaskingMapFile,
)

from application import db
from config import AppConfig


def session_add(session, obj):
    """
    Добавление с базу данных записи и подтверждение
    :param session: db.session,
        сессия подключения к БД
    :param obj: sqlalchemy.Model,
        экземпляр модели ORM sqlalchemy
    :return: None
    """
    try:
        session.add(obj)
        session.commit()
    except Exception as err:
        current_app.logger.info(
            f"Не удалось добавить объект в базу данных. {err}"
        )
        session.rollback()
        raise SqlAlchemyException("Не удалось добавить объект в БД!")


def add_type_work(name):
    """
    Добавление типа работы
    :param name:
    :return:
    """
    type_work = TypeWork(name=name)
    session_add(db.session, type_work)


def get_type_work_list(
        name=None, ids_type_protection=None, ids_type_mn_object=None):
    """

    :param name:
    :return:
    """

    query = (
        db.session().query(TypeWork)
        # .outerjoin(MNObject)
        .outerjoin(Protection, TypeWork.id == Protection.id)
    )

    if name:
        search_name = f"%{name}%"
        query = query.filter(TypeWork.name.ilike(search_name))

    if ids_type_protection:
        query = query.filter(Location.id_type.in_(ids_type_mn_object))

    if ids_type_mn_object:
        query = query.filter(
            Protection.id_type_protection.in_(ids_type_protection))

    result = query.all()
    current_app.logger.debug(f"res - {result}")
    return result


def add_protection(name, id_type_protection):
    """
    Добавление защиты на объекте
    :param id_type_protection:
    :param name:
    :return:
    """
    protection = Protection(name=name, id_type_protection=id_type_protection)
    session_add(db.session, protection)


def get_protection_list():
    """

    :return:
    """

    result = db.session.query(Protection).all()
    return result


def add_type_protection(
    name,
):
    """
    Добавление типа защиты
    :param name:
    :return:
    """
    type_protection = TypeProtection(name=name)
    session_add(db.session, type_protection)


def get_type_protection_list():
    """

    :return:
    """

    result = db.session.query(TypeProtection).all()
    return result


def add_type_work_protection(id_type_work, id_protection):
    """

    :param id_type_work:
    :param id_protection:
    :return:
    """

    obj = TypeWorkProtection(
        id_protection=id_protection, id_type_work=id_type_work
    )
    session_add(db.session, obj)


def add_mn_object(name, id_protection, id_parent=None):
    """

    :param name:
    :param id_protection:
    :param id_parent:
    :return:
    """

    mn_object = Location(
        name=name, id_protection=id_protection, id_parent=id_parent
    )

    session_add(db.session, mn_object)


def get_mn_object_list(
        name=None, ids_type_protection=None, ids_type_mn_object=None):
    """

    :return:
    """

    query = (
        db.session().query(Location)
        # .outerjoin(TypeMnObject)
        .join(Protection, Location.id_protection == Protection.id)
    )

    if name:
        search_name = f"%{name}%"
        query = query.filter(Location.name.ilike(search_name))

    if ids_type_protection:
        query = query.filter(Location.id_type.in_(ids_type_mn_object))

    if ids_type_mn_object:
        query = query.filter(
            Protection.id_type_protection.in_(ids_type_protection))
    current_app.logger.debug(f"query - {query}")
    # result = db.session.query(MNObject).all()
    result = query.all()
    return result


def check_generate_masking_plan(id_object, id_type_work) -> uuid.UUID or None:
    """

    :param id_object:
    :param id_type_work:
    :return:
    """

    type_work = db.session().query(TypeWork).get(id_type_work)
    mn_object = db.session().query(Location).get(id_object)

    for protection in type_work.protections:
        if protection.id == mn_object.id_protection:
            masking_uuid = uuid.uuid4()
            masking_data = {
                "number_pril": "",
                "number_project": "",
                "date": datetime.date.today().strftime("%d.%m.%Y"),
                "name_nps": "",
                "protection_cspa": [
                    {
                        "name": protection.name,
                        "is_no_demask": False
                    }
                ]
            }

            masking_map = MaskingMapFile(
                description="",
                filename="",
                data_masking=masking_data,
                masking_uuid=masking_uuid
            )
            db.session.add(masking_map)
            db.session.commit()
            return masking_uuid

    return None


def add_type_mn_object(name):
    type_mn_object = TypeLocation(
        name
    )
    session_add(db.session, type_mn_object)
    return type_mn_object


def get_type_mn_object_list():
    type_object_list = db.session.query(TypeLocation).all()

    return type_object_list


def add_status_protection(name):
    status_protection = StatusProtection(
        name=name
    )
    session_add(db.session, status_protection)
    return status_protection


def get_status_protection_list():
    status_protection_list = db.session.query(StatusProtection).all()
    return status_protection_list


def render_masking_map(map_uuid) -> str:
    file_params = db.session.query(MaskingMapFile).filter(
        MaskingMapFile.masking_uuid == map_uuid
    ).first()

    render_file = render_template(
        "masking_map/mpsa.html", **file_params.data_masking
    )
    return render_file


def generate_file(map_uuid) -> str:
    render_file = render_masking_map(map_uuid)

    # css = CSS("common/templates/styles/main.css")
    html = HTML(string=render_file)
    filename = os.path.join(AppConfig.FILES_PATHS.MAP_FILES_DIR_PATH, f"{map_uuid}.pdf")
    current_app.logger.debug(f"filename - {filename}")
    html.write_pdf(filename, stylesheets=[])

    return filename


