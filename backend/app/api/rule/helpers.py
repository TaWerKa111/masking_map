from flask import current_app
from flask_sqlalchemy import Pagination
from sqlalchemy import or_

from app import db
from common.postgres.models import (
    Rule,
    RuleProtection,
    Criteria,
    Question,
    QuestionAnswer,
    TypeWork,
    Location,
    TypeLocation,
    CriteriaLocation,
    CriteriaTypeWork,
    CriteriaTypeLocation,
    CriteriaQuestion,
)


def add_rule(name: str, compensatory_measures: str = None) -> Rule:
    """
    Добавление правила
    :param name: str,
        название правила
    :return: Rule
    """
    rule = Rule(name=name, compensatory_measures=compensatory_measures)

    db.session.add(rule)
    db.session.commit()
    return rule


def add_criteria(name: str, type_criteria: Criteria.TypeCriteria) -> Criteria:
    """
    Добавление критерия
    :param name: str,
        название критерия
    :param type_criteria:  Criteria.TypeCriteria,
        тип критерия
    :return: Criteria
    """

    criteria = Criteria(name=name, type_criteria=type_criteria)

    db.session.add(criteria)
    db.session.commit()
    return criteria


def add_question(text: str) -> Question:
    """
    Добавление вопроса

    :param text: str,
        текст вопроса
    :return:  Question
    """
    question = Question(text=text)
    db.session.add(question)
    db.session.commit()
    return question


def add_question_answer(text: str, id_question: int) -> QuestionAnswer:
    """
    Добавление ответа к вопросу

    :param text: str,
        текст ответа
    :param id_question: int,
        идентификатор вопроса, к которому принадлежит ответ
    :return:
    """
    answer = QuestionAnswer(text=text, id_question=id_question)
    db.session.add(answer)
    db.session.commit()
    return answer


def add_new_rule(
    name_rule,
    type_works: list[TypeWork],
    locations: list[Location],
    type_locations: list[TypeLocation],
    questions: list[dict],
    protections: list[dict],
    compensatory_measures: str,
) -> Rule:
    """
    Добавление нового правила со всеми критериями и защитами к нему

    :param name_rule: str,
        название правила
    :param type_work: TypeWork
        объект "Тип Работы"
    :param location: Location
        локация для которой строится правило
    :param type_location: TypeLocation
        тип локации
    :param questions: list[dict]
        список вопросов для правила
    :param protections: list[dict]
        список защит, на которые воздействует правило
    :return: Rule
    """

    rule = add_rule(name_rule, compensatory_measures)

    criteria_work = add_criteria(
        "Критерий работы", Criteria.TypeCriteria.type_work
    )
    criteria_location = add_criteria(
        "Критерий локации", Criteria.TypeCriteria.location
    )
    criteria_type_location = add_criteria(
        "Критерий типа локации", Criteria.TypeCriteria.type_location
    )

    if type_works:
        criteria_work.type_works.extend(type_works)
        criteria_work.is_any = False
    else:
        criteria_work.is_any = True
    if locations:
        criteria_location.locations.extend(locations)
        criteria_location.is_any = False
    else:
        criteria_location.is_any = True
    if type_locations:
        criteria_type_location.locations_type.extend(type_locations)
        criteria_type_location.is_any = False
    else:
        criteria_type_location.is_any = True

    rule.criteria.extend(
        [criteria_work, criteria_location, criteria_type_location]
    )
    criteria_question = add_criteria(
        "Критерий вопросов", Criteria.TypeCriteria.question
    )
    rule.criteria.append(criteria_question)

    for question in questions:
        qu_ans = CriteriaQuestion(
            id_question=question.get("id"),
            id_criteria=criteria_question.id,
            id_right_answer=question.get("right_answer_id"),
        )
        db.session.add(qu_ans)
        db.session.commit()

    for protection in protections:
        rule_protection = RuleProtection(
            id_rule=rule.id,
            id_protection=protection.get("id"),
            is_need_masking=protection.get("is_masking"),
            is_need_demasking=protection.get("is_demasking"),
        )
        db.session.add(rule_protection)
        db.session.commit()

    db.session.commit()
    return rule


def get_locations_work_types_location_types(
    location_ids, type_work_ids, type_location_ids
):
    """
    Получить локацию, тип работы и тип локации
    :param location_id: int,
        идентификатор локации
    :param type_work_id: int,
        идентификатор типа работы
    :param type_location_id: int,
        идентификатор типа локации
    :return:
    """

    locations = (
        db.session.query(Location).filter(Location.id.in_(location_ids)).all()
    )

    type_works = (
        db.session.query(TypeWork).filter(TypeWork.id.in_(type_work_ids)).all()
    )

    type_locations = (
        db.session.query(TypeLocation)
        .filter(TypeLocation.id.in_(type_location_ids))
        .all()
    )

    return locations, type_works, type_locations


def get_rule(rule_id: int) -> Rule:
    """
    Получить правило по идентификатору

    :param rule_id: int,
        идентификатор правила
    :return: Rule
    """
    rule = db.session.query(Rule).filter(Rule.id == rule_id).first()

    return rule


def filter_list_rule(
    rules_ids: list[int],
    name: str,
    page: int = 1,
    limit: int = 1000,
    protection_ids: list[int] = None,
    type_work_ids: list[int] = None,
    type_location_ids: list[int] = None,
) -> Pagination:
    """
    Получить список правил с пагинацией
    :param rules_ids: list[int]
        список идентификаторов правил
    :param name: str
        название правила
    :param page: int = 1
        номер страницы
    :param limit: int = 10
        количество строк на странице
    :return: Pagination
    """
    query = db.session.query(Rule)

    if rules_ids:
        query = query.filter(Rule.id.in_(rules_ids))
    if name:
        filter_name = f"%{name}%"
        query = query.filter(Rule.name.ilike(filter_name))

    if type_location_ids:
        query = query.join(
            Criteria,
        ).join(
            CriteriaTypeLocation,
            CriteriaTypeLocation.id_criteria == Criteria.id,
        )
        query = query.filter(
            CriteriaTypeLocation.id_type_location.in_(type_location_ids)
        )
    if type_work_ids:
        query = query.join(
            Criteria,
        ).join(CriteriaTypeWork, CriteriaTypeWork.id_criteria == Criteria.id)
        query = query.filter(CriteriaTypeWork.id_type_work.in_(type_work_ids))
    if protection_ids:
        query = query.filter(RuleProtection.id_protection.in_(protection_ids))

    result = query.paginate(page=page, per_page=limit, error_out=False)
    return result


def update_rule(
    rule_id: int,
    name_rule: str,
    type_work: TypeWork,
    location: Location,
    type_location: TypeLocation,
    questions: list[dict],
    protections: list[dict],
) -> Rule or None:
    """
    Изменение правила, его критериев и списка защит

    :param rule_id: int,
        идентификатор правила
    :param name_rule: str,
        название правила
    :param type_work: TypeWork,
        объект "Тип Работы"
    :param location: Location,
        локация, для которой строится правило
    :param type_location: TypeLocation,
        тип локации.
    :param questions: list[dict],
        список вопросов для правила
    :param protections: list[dict],
        список защит, на которые воздействует правило
    :return: Rule
    """

    rule = get_rule(rule_id)

    if not rule:
        return None
    if name_rule:
        rule.name = name_rule

    criteria_work = add_criteria("Виды работ", Criteria.TypeCriteria.type_work)
    criteria_location = add_criteria(
        "Места проведения работ", Criteria.TypeCriteria.location
    )
    criteria_type_location = add_criteria(
        "Типы мест проведения работ", Criteria.TypeCriteria.type_location
    )

    criteria_work.works.append(type_work)
    criteria_location.locations.append(location)
    criteria_type_location.locations_type.append(type_location)

    questions_list = []
    if questions:
        for question_data in questions:
            question = add_question(question_data.get("text"))
            for answer_data in question_data.get("answers"):
                add_question_answer(
                    answer_data.get("text"), id_question=question.id
                )
            questions_list.append(question)

    rule.criteria.extend(
        [criteria_work, criteria_location, criteria_type_location]
    )
    criteria_question = add_criteria("Вопросы", Criteria.TypeCriteria.question)

    rule.criteria.append(criteria_question)

    if protections:
        for protection in protections:
            rule_protection = RuleProtection(
                id_rule=rule.id,
                id_protection=protection.get("id"),
                is_need_masking=protection.get("is_need_masking"),
                is_need_demasking=protection.get("is_need_demasking"),
            )
            db.session.add(rule_protection)
            db.session.commit()

    db.session.commit()
    return rule


def filter_list_question(
    questions_ids: list[int],
    text: str,
    page: int = 1,
    limit: int = 1000,
    type_work_ids=None,
    location_ids=None,
):
    """

    :param questions_ids:
    :param text:
    :param page:
    :param limit:
    :return:
    """
    rule_ids = []
    query = db.session.query(Question)

    if questions_ids:
        query = query.filter(Question.id.in_(questions_ids))
    if text:
        filter_text = f"%{text}%"
        query = query.filter(Question.text.ilike(filter_text))

    if type_work_ids:
        rules = (
            db.session.query(Rule)
            .join(Criteria)
            .join(
                CriteriaTypeWork, CriteriaTypeWork.id_criteria == Criteria.id
            )
            .filter(CriteriaTypeWork.id_type_work.in_(type_work_ids))
        )

        rule_ids.extend([rule.id for rule in rules.all()])

    if location_ids:
        rules = (
            db.session.query(Rule)
            .join(Criteria)
            .join(
                CriteriaLocation, CriteriaLocation.id_criteria == Criteria.id
            )
            .filter(CriteriaLocation.id_location.in_(location_ids))
        )
        rule_ids.extend([rule.id for rule in rules.all()])

    if rule_ids:
        rule_ids = list(set(rule_ids))
        query = query.join(
            CriteriaQuestion, CriteriaQuestion.id_question == Question.id
        ).join(Criteria, Criteria.id == CriteriaQuestion.id_criteria)
        query = query.filter(Criteria.rule_id.in_(rule_ids))


    current_app.logger.info(f"qu - {query}")
    result = query.paginate(page=page, per_page=limit, error_out=False)
    return result


def get_filter_questions_for_gen_map(
    type_work_ids=None,
    location_ids=None,
):
    """
    Получение отфильтрованного списка вопросов по правилам, 
    в которые входят работы и локации.
    На выходе выдается список вопросов, отфильтрованных по важности,
    т.е. те которые чаще всего встречаются.

    """
    def append_to_tree():
        pass

    rule_ids = []
    rules_questions = dict()
    query = db.session.query(Question, CriteriaQuestion)

    if type_work_ids:
        rules = (
            db.session.query(Rule)
            .join(Criteria)
            .join(
                CriteriaTypeWork, CriteriaTypeWork.id_criteria == Criteria.id
            )
            .filter(CriteriaTypeWork.id_type_work.in_(type_work_ids))
        )

        rule_ids.extend([rule.id for rule in rules.all()])

    if location_ids:
        rules = (
            db.session.query(Rule)
            .join(Criteria)
            .join(
                CriteriaLocation, CriteriaLocation.id_criteria == Criteria.id
            )
            .filter(CriteriaLocation.id_location.in_(location_ids))
        )
        rule_ids.extend([rule.id for rule in rules.all()])

    if rule_ids:
        rule_ids = list(set(rule_ids))
        for rule_id in rule_ids:
            temp_query = query.join(
                CriteriaQuestion, CriteriaQuestion.id_question == Question.id
            ).join(Criteria, Criteria.id == CriteriaQuestion.id_criteria)
            data_question = temp_query.filter(Criteria.rule_id == rule_id).all()
            rules_questions.setdefault(rule_id, data_question)
        # query = query.join(
        #     CriteriaQuestion, CriteriaQuestion.id_question == Question.id
        # ).join(Criteria, Criteria.id == CriteriaQuestion.id_criteria)
        # query = query.filter(Criteria.rule_id.in_(rule_ids))

    # questions = query.all()
    questions = list()

    for rule_id in rules_questions:
        # for question, cr_que in query.all():
        for question, cr_que in rules_questions.get(rule_id):
            questions.append({
                "id": question.id,
                "text": question.text,
                "answers": question.answers,
                "id_right_answer": cr_que.id_right_answer,
                "rule_id": rule_id
            })

    return questions


def get_question(question_id: int) -> Question:
    """
    Получить вопрос по идентификатору

    :param question_id: int,
        идентификатор вопроса
    :return: Question
    """
    question = (
        db.session.query(Question)
        .filter(Question.id == question_id)
        .limit(1)
        .first()
    )

    return question


def update_question(question_id: int, text: str, answers: list[dict]):
    """

    :param question_id:
    :param text:
    :param answers:
    :return:
    """

    question = (
        db.session.query(Question).filter(Question.id == question_id).first()
    )
    if not question:
        return None

    if text:
        question.text = text

    if answers is not None:
        new_answers = []
        for answer_data in answers:
            new_answers.append(
                add_question_answer(answer_data.get("text"), question.id)
            )
        current_app.logger.info(f"new answers {new_answers}")
        question.answers = new_answers

    db.session.query(QuestionAnswer).filter(
        QuestionAnswer.id_question.is_(None)
    ).delete()
    db.session.commit()
    return question


def delete_rule(rule_id):
    try:
        rule = db.session.query(Rule).filter(Rule.id == rule_id).first()
        db.session.delete(rule)
        db.session.commit()
        return True
    except Exception as err:
        current_app.logger.info(f"Error del rule - {err}", exc_info=True)
        return False
