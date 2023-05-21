import datetime
import os
import uuid

from flask import render_template, current_app
from flask_sqlalchemy import Pagination
from sqlalchemy import desc

from app import db
from common.postgres.models import (
    MaskingMapFile,
    TypeWork,
    Location,
    CriteriaTypeWork,
    Criteria,
    CriteriaLocation,
    CriteriaTypeLocation,
    Rule,
    Protection,
    RuleProtection,
    CriteriaQuestion,
)
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
    locations, type_works, questions, is_test=False
) -> uuid.UUID or None:
    """
    Проверка возможности сгенерировать карту для заданных критериев
    :param location_id: int,
        идентификатор локации
    :param type_work_id: int,
        идентификатор типа работы
    :return:
    """

    # location = db.session().query(Location).get(location_id)

    criteria = (
        db.session.query(Criteria)
        .filter(
            CriteriaTypeWork.id_type_work.in_(
                [type_work["id"] for type_work in type_works]
            ),
            # CriteriaTypeLocation.id_type_location.in_([type_location["id_type"] for type_location in locations]),
            CriteriaLocation.id_location.in_(
                [location["id"] for location in locations]
            ),
            # CriteriaQuestion.id_question.in_([question["id"] for question in questions]),
        )
        .all()
    )

    criteria_question: list[CriteriaQuestion] = db.session.query(
        CriteriaQuestion
    ).filter(CriteriaQuestion.id_criteria.in_([cr.id for cr in criteria]))

    answers_d = {int(q.get("id")): q.get("answer_id") for q in questions}
    # cr_id_right = []
    # for cr_qu in criteria_question:
    #     if answers_d.get(cr_qu.id) and answers_d[cr_qu.id] == cr_qu.id_right_answer:
    #         cr_id_right.append(cr_qu.id_criteria)

    criteria_ids = [cr.id for cr in criteria]
    current_app.logger.debug(f"criteria_ids - {criteria_ids}")
    current_app.logger.debug(f"criteria - {criteria}")

    rules = (
        db.session.query(Rule)
        # .filter(Criteria.id.in_(cr_id_right))
        .filter(Criteria.id.in_(criteria_ids)).all()
    )

    current_app.logger.debug(f"rules - {rules}")
    current_app.logger.debug(f"rules - {[rule.id for rule in rules]}")

    protections = (
        db.session.query(RuleProtection)
        .filter(
            RuleProtection.id_rule.in_([rule.id for rule in rules]),
            # Rule.is_test == is_test,
        )
        .all()
    )

    prot = (
        db.session.query(Protection, RuleProtection)
        .join(RuleProtection)
        .filter(
            Protection.id.in_([p.id for p in protections]),
            # Rule.is_test == is_test,
        )
        .all()
    )

    current_app.logger.debug(
        f"protections relationship - {[p.id for p in protections]}"
    )
    # current_app.logger.debug(f"prot - {[p.__dict__ for p in prot]}")
    current_app.logger.debug(f"prot - {prot}")
    for protection, rel in prot:
        current_app.logger.debug(
            f"pr - {protection.id}, rel - {rel.is_need_masking}"
        )

        masking_uuid = uuid.uuid4()
        masking_data = {
            "number_pril": "",
            "number_project": "",
            "date": datetime.date.today().strftime("%d.%m.%Y"),
            "name_nps": "",
            "protection_cspa": [
                {
                    "name": protection.name,
                    "is_no_demask": rel.is_need_demasking,
                }
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
        return masking_map

    return None
