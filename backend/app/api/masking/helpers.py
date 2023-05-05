from flask import current_app
from flask_sqlalchemy import Pagination
from sqlalchemy.orm import scoped_session

from app.api.helpers.exceptions import SqlAlchemyException
from common.postgres.models import (
    TypeWork,
    Protection,
    TypeProtection,
    TypeWorkProtection,
    Location,
    TypeLocation,
    StatusProtection,
    DepartamentOfWork,
)

from app import db
from config import AppConfig


def session_add(session: scoped_session, obj):
    """
    Добавление с базу данных записи и подтверждение
    :param session: scoped_session,
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


# TypeWork and Departament
def add_type_work(name: str, departament_id: int = None) -> None:
    """
    Добавление типа работы
    :param departament_id:
    :param name:
    :return:
    """

    type_work = TypeWork(name=name, departament_id=departament_id)
    session_add(db.session, type_work)


def get_type_work_list(
    name=None,
    ids_type_protection=None,
    ids_type_mn_object=None,
    page: int = 1,
    limit: int = 10,
):
    """

    :param name:
    :param ids_type_protection:
    :param ids_type_mn_object:
    :param page:
    :param limit:
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
            Protection.id_type_protection.in_(ids_type_protection)
        )

    # result = query.all()
    result = query.paginate(page=page, per_page=limit, error_out=True)
    current_app.logger.debug(f"res - {result}")
    return result


def update_type_work(type_work_id: int, name: str, dep_id: int):
    type_work: TypeWork = (
        db.session.query(TypeWork).filter(TypeWork.id == type_work_id).first()
    )

    if not type_work:
        return None

    if name:
        type_work.name = name
    if dep_id:
        type_work.departament_id = dep_id

    db.session.commit()


def add_departament(name: str) -> DepartamentOfWork:
    departament = DepartamentOfWork(name=name)
    session_add(db.session, departament)
    return departament


def update_departament(dep_id: int, name: str) -> bool or None:
    departament: DepartamentOfWork = (
        db.session.query(DepartamentOfWork)
        .filter(DepartamentOfWork.id == dep_id)
        .first()
    )

    if not departament:
        return None

    if name:
        departament.name = name

    db.session.commit()
    return True


def get_departament_work_list(name: str) -> list[DepartamentOfWork]:
    query = db.session.query(DepartamentOfWork)

    if name:
        filter_name = f"%{name}%"
        query = query.filer(DepartamentOfWork.name.ilike(filter_name))

    departament_list = query.all()
    return departament_list


# Protections
def add_protection(name, id_type_protection, id_location: int = None) -> Protection:
    """
    Добавление защиты на объекте
    :param id_type_protection:
    :param name:
    :return:
    """
    protection: Protection = Protection(
        name=name, id_type_protection=id_type_protection
    )

    if id_location:
        location: Location = (
            db.session.query(Location).filter(Location.id == id_location).first()
        )
        if location:
            protection.locations.append(location)

    session_add(db.session, protection)
    return protection


def get_protection_list(
    name: str = None,
    type_protection_ids: list[int] = None,
    limit: int = 10,
    page: int = 1,
) -> Pagination:
    """

    :return:
    """
    query = db.session.query(Protection)

    if name:
        filter_name = f"%{name}%"
        query = query.filter(Protection.name.ilike(filter_name))

    if type_protection_ids:
        query = query.outerjoin(Protection.type_protection)
        query = query.filter(TypeProtection.id.in_(type_protection_ids))

    result = query.paginate(page=page, per_page=limit, error_out=True)
    return result


def update_protection(
        protection_id: int, name: str, location_id: int,
        id_type_protection: int
) -> None or bool:
    protection: Protection = (
        db.session.query(Protection)
        .filter(Protection.id == protection_id)
        .first()
    )
    if not protection:
        return None

    if protection.location:
        protection.location.pop()

    if location_id:
        location = (
            db.session.query(Location).filter(Location.id == location_id).first()
        )

        if location:
            protection.location.apend(location)
    if name:
        protection.name = name
    if id_type_protection:
        protection.id_type_protection = id_type_protection

    db.session.commit()
    return True


def add_type_protection(
    name,
) -> TypeProtection:
    """
    Добавление типа защиты
    :param name:
    :return:
    """
    type_protection = TypeProtection(name=name)
    session_add(db.session, type_protection)
    return type_protection


def get_type_protection_list():
    """

    :return:
    """

    result = db.session.query(TypeProtection).all()
    return result


def update_type_protection(id_type_protection: int, name: str) -> bool or None:
    """

    :param id_type_protection:
    :param name:
    :return:
    """
    type_protection: TypeProtection = (
        db.session.query(TypeProtection)
        .filter(TypeProtection.id == id_type_protection)
        .first()
    )

    if not type_protection:
        return None

    if name:
        type_protection.name = name
    return True


def add_status_protection(name: str) -> StatusProtection:
    status_protection = StatusProtection(name=name)
    session_add(db.session, status_protection)
    return status_protection


def get_status_protection_list():
    status_protection_list = db.session.query(StatusProtection).all()
    return status_protection_list


# Locations
def add_location(name, id_protection=None, id_parent=None):
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


def get_location(location_id):
    location = (
        db.session.query(Location)
        .filter(Location.id == location_id)
        .first()
    )
    return location


def get_location_list(
    name=None,
    ids_type_protection=None,
    ids_type_mn_object=None,
    page: int = 1,
    limit: int = 10,
):
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
            Protection.id_type_protection.in_(ids_type_protection)
        )
    current_app.logger.debug(f"query - {query}")
    result = query.paginate(page=page, per_page=limit, error_out=False)
    return result


def update_location(location_id: int, name: str, parent_id: int) -> bool or None:
    """

    :param location_id:
    :param name:
    :param parent_id:
    :return:
    """

    location = (
        db.session.query(Location)
        .filter(Location.id == location_id)
        .first()
    )

    if not location:
        return None
    if name:
        location.name = name
    if parent_id:
        location.id_parent = parent_id

    db.session.commit()


def add_type_location(name: str) -> TypeLocation:
    type_mn_object = TypeLocation(name=name)
    session_add(db.session, type_mn_object)
    return type_mn_object


def get_type_location_list() -> list[TypeLocation]:
    type_object_list = db.session.query(TypeLocation).all()

    return type_object_list


def update_type_location(type_location_id: int, name: str) -> bool or None:
    """

    :param type_location_id:
    :param name:
    :return:
    """
    type_location = (
        db.session.query(TypeLocation)
        .filter(TypeLocation.id == type_location_id)
        .first()
    )

    if not type_location:
        return None

    if name:
        type_location.name = name
    db.session.commit()


def update_rel_location_location(location_id, location_ids):
    locations = (
        db.session.query(Location)
        .filter(Location.id.in_(location_ids))
        .all()
    )

    for location in locations:
        location.id_parent = location_id

    db.session.commit()


def update_rel_location_protection(location_id, protection_ids):
    protections = (
        db.session.query(Protection)
        .filter(Protection.id.in_(protection_ids))
        .all()
    )

    for protection in protections:
        protection.id_location = location_id

    db.session.commit()


