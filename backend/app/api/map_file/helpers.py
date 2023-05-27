import datetime
import os
import uuid
from itertools import groupby
from operator import attrgetter

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
    locations, type_works, questions
) -> uuid.UUID or None:
    """
    Проверка возможности сгенерировать карту для заданных критериев

    :return:
    """

    descriptions = []
    tw_criteria = (
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

    )
    current_app.logger.debug(f"tw cr query - {tw_criteria}")
    tw_criteria = tw_criteria.all()
    rules_tw = (
        db.session.query(Rule)
        .join(Criteria, Criteria.rule_id == Rule.id)
        .filter(
            Criteria.id.in_([cr.id for cr in tw_criteria]),
        )
        .all()
    )
    
    descriptions.append(
        f"Правила выбранные по работам: {[rule.id for rule in rules_tw] or 'отсутствуют'}")
    
    current_app.logger.debug(f"rule type work - {rules_tw}")
    criteria_location = (
        db.session.query(Criteria)
        .outerjoin(CriteriaLocation, Criteria.id == CriteriaLocation.id_criteria)
        .filter(
            or_(
                CriteriaLocation.id_location.in_(
                    [loc["id"] for loc in locations]
                ),
                and_(
                    Criteria.type_criteria == Criteria.TypeCriteria.location,
                    Criteria.is_any.is_(True),
                )
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

    descriptions.append(
        f"Правила выбранные по работам и местам их проведения: "
        f"{[rule.id for rule in rules] or 'отсутствуют'}"
    )

    current_app.logger.debug(f"cr location - {criteria_location}")
    current_app.logger.debug(f"rule type work and loc - {[r.id for r in rules]}")
    rule_ids = [rule.id for rule in rules]

    rule_questions = dict()
    for rule_id in rule_ids:
        criteria_question: list[CriteriaQuestion] = (
            db.session.query(CriteriaQuestion)
            .join(Criteria)
            .filter(Criteria.rule_id == rule_id)
            .all()
        )
        rule_questions.setdefault(rule_id, criteria_question)

    current_app.logger.debug(f"rule questions - {rule_questions}")

    rule_right_ids = []
    if rule_questions:
        answers_d = {int(q.get("id")): q.get("answer_id") for q in questions}
        current_app.logger.debug(f"answers_d - {answers_d}")
        descriptions.append(f"Список вопросов для правил: {rule_ids or 'отсутствует'}")
        for rule_id in rule_questions:
            for cr_qu in rule_questions.get(rule_id, []):
                if (
                    answers_d[cr_qu.id_question] != cr_qu.id_right_answer
                ):
                    descriptions.append(f"правило №{rule_id} не подходит, ответ неверный на вопрос ''")
                    break
            else:
                rule_right_ids.append(rule_id)

    current_app.logger.debug(f"rule right ids = {rule_right_ids}")
    rule_ids = rule_right_ids or rule_ids
    current_app.logger.debug(f"rule right ids = {rule_ids}")

    descriptions.append(f"Итоговый список правил: {rule_ids}")

    protections = (
        db.session.query(Protection)
        .join(RuleProtection)
        .filter(
            RuleProtection.id_rule.in_(rule_ids),
        )
        .all()
    )

    current_app.logger.debug(
        f"protections relationship - {[p.id for p in protections]}"
    )

    if protections:
        descriptions.append(
            f" Маскирование нужно. Используемые правила: "
            f"{' '.join(list(map(str, rule_ids))) or 'не было подходящих правил'}"
        )
        return True, descriptions, protections
    else:
        descriptions.append(" Нет необходимости маскирования. ")

    return None, descriptions, None


def add_masking_file(
        protections, descriptions, is_test=False):
    protection_names = []
    for protection in protections:
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
        description='\n'.join(descriptions),
        filename=(
            f"Карта Маскирования от "
            f"{datetime.date.today().strftime('%d_%m_%Y')}"
        ),
        data_masking=masking_data,
        masking_uuid=masking_uuid,
        logic_machine_answer={
            "list": descriptions
        },
        is_test=is_test,
        is_valid=True
    )
    db.session.add(masking_map)
    db.session.commit()
    return masking_map.masking_uuid
