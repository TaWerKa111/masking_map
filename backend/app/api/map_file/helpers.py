import datetime
import os
import uuid

from flask import render_template, current_app
from flask_sqlalchemy import Pagination
from sqlalchemy import and_, desc, or_

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

    criteria = (
        db.session.query(Criteria)
        .outerjoin(CriteriaTypeWork, Criteria.id == CriteriaTypeWork.id_criteria)
        .filter(
            or_(
                CriteriaTypeWork.id_type_work.in_(
                    [type_work["id"] for type_work in type_works]
                ),
                and_(
                    Criteria.type_criteria == Criteria.TypeCriteria.type_work,
                    Criteria.is_any.is_(True),
                )
            )
        )
        .all()
    )

    rules_tw = (
        db.session.query(Rule)
        .join(Criteria, Criteria.rule_id == Rule.id)
        .filter(
            Criteria.id.in_([cr.id for cr in criteria]),
        )
        .all()
    )

    current_app.logger.debug(f"rule type work - {rules_tw}")
    criteria_location = (
        db.session.query(Criteria)
        .outerjoin(CriteriaLocation, Criteria.id == CriteriaLocation.id_criteria)
        .filter(
            or_(
                CriteriaLocation.id_location.in_(
                    [loc["id"] for loc in locations]
                ),
                Criteria.is_any == True
            ),
        )
        .all()
    )

    rules = (
        db.session.query(Rule)
        .join(Criteria, Criteria.rule_id == Rule.id)
        .filter(
            Criteria.id.in_([cr.id for cr in criteria_location]),
        )
        .filter(
            Rule.id.in_([rl.id for rl in rules_tw]),
        )
        .all()
    )

    current_app.logger.debug(f"cr location - {criteria_location}")
    current_app.logger.debug(f"rule type work and loc - {[r.id for r in rules]}")

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
        .filter(Criteria.id.in_(criteria_ids))
    )

    rule_ids = [rule.id for rule in rules.all()]
    current_app.logger.debug(f"rules - {rules}")
    current_app.logger.debug(f"rules - {[rule.id for rule in rules]}")

    protections = (
        db.session.query(RuleProtection)
        .filter(
            RuleProtection.id_rule.in_(rule_ids),
        )
        .all()
    )

    prot = (
        db.session.query(Protection)
        .filter(
            Protection.id.in_([p.id for p in protections]),
        )
        .all()
    )

    current_app.logger.debug(
        f"protections relationship - {[p.id for p in protections]}"
    )
    current_app.logger.debug(f"prot - {prot}")

    for protection in prot:

        masking_uuid = uuid.uuid4()
        masking_data = {
            "number_pril": "",
            "number_project": "",
            "date": datetime.date.today().strftime("%d.%m.%Y"),
            "name_nps": "",
            "protection_cspa": [
                {
                    "name": protection.name,
                }
            ],
        }
        description = "Маскирование нужно."
        masking_map = MaskingMapFile(
            description="",
            filename="",
            data_masking=masking_data,
            masking_uuid=masking_uuid,
            is_test=is_test
        )
        db.session.add(masking_map)
        db.session.commit()
        return masking_map, description
    else:
        description = (
            f"Нет необходимости. "
        )

    description = f"{description} Используемые правила: {' '.join(list(map(str, rule_ids))) or 'не было подходящих правил'}"

    return None, description
