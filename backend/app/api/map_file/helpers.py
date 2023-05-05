import datetime
import os
import uuid

from flask import render_template, current_app
from flask_sqlalchemy import Pagination
from sqlalchemy import desc

from app import db
from common.postgres.models import MaskingMapFile, TypeWork, Location, \
    CriteriaTypeWork, Criteria, CriteriaLocation, CriteriaTypeLocation, Rule, \
    CriteriaRule
from config import AppConfig


def render_masking_map(map_uuid: str) -> str:
    """
    Рендер карты маскирования и получения html документа
    :param map_uuid: uuid,
        идентификатор карты
    :return: str
        html документ
    """
    file_params = (
        db.session.query(MaskingMapFile)
        .filter(MaskingMapFile.masking_uuid == map_uuid)
        .first()
    )

    render_file = render_template(
        "masking_map/mpsa.html", **file_params.data_masking
    )
    return render_file


def generate_file(map_uuid: str) -> str:
    """
    Генерация файла маскирования

    :param map_uuid: uuid,
        идентификатор карты маскирования
    :return: str,
        название файла
    """
    from weasyprint import HTML

    render_file = render_masking_map(map_uuid)

    # css = CSS("common/templates/styles/main.css")
    html = HTML(string=render_file)
    filename = os.path.join(
        AppConfig.FILES_PATHS.MAP_FILES_DIR_PATH, f"{map_uuid}.pdf"
    )
    current_app.logger.debug(f"filename - {filename}")
    html.write_pdf(filename, stylesheets=[])

    return filename


def get_filtered_files(page: int, limit: int) -> Pagination:
    """
    Получение списка файлов с пагинацией

    :param page: int,
        номер страницы
    :param limit: int
        количество элементов на странице
    :return: Pagination
    """
    query = db.session.query(MaskingMapFile)

    result = query.order_by(desc(MaskingMapFile.id)).paginate(
        page, limit, False
    )

    return result


def check_generate_masking_plan(
        location_id, type_work_id) -> uuid.UUID or None:
    """
    Проверка возможности сгенерировать карту для заданных критериев
    :param location_id: int,
        идентификатор локации
    :param type_work_id: int,
        идентификатор типа работы
    :return:
    """

    location = db.session().query(Location).get(location_id)

    criteria = (
        db.session().query(
            CriteriaTypeWork, Criteria, CriteriaLocation, CriteriaTypeLocation)
        .filter(
            CriteriaTypeWork.id_type_work == type_work_id,
            CriteriaTypeLocation.id_type_location == location.id_type,
            CriteriaLocation.id_location == location_id
        )
        .all()
    )
    criteria_ids = [cr.id for cr in criteria]

    rules = (
        db.session.query(Rule, CriteriaRule)
        .filter(CriteriaRule.id_criteria.in_(criteria_ids))
        .all()
    )

    for protection in type_work.protections:
        if protection.id == mn_object.id_protection:
            masking_uuid = uuid.uuid4()
            masking_data = {
                "number_pril": "",
                "number_project": "",
                "date": datetime.date.today().strftime("%d.%m.%Y"),
                "name_nps": "",
                "protection_cspa": [
                    {"name": protection.name, "is_no_demask": False}
                ],
            }

            masking_map = MaskingMapFile(
                description="",
                filename="",
                data_masking=masking_data,
                masking_uuid=masking_uuid,
            )
            db.session.add(masking_map)
            db.session.commit()
            return masking_uuid

    return None
