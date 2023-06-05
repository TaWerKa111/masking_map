import hashlib
import enum

from sqlalchemy.dialects import postgresql
from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    Enum,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Table,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects import postgresql
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import (
    relationship,
    backref,
    declarative_base,
)
from sqlalchemy.sql.sqltypes import DateTime, Date, Text
from sqlalchemy.ext.mutable import MutableDict

from werkzeug.security import generate_password_hash, check_password_hash

import uuid


Base = declarative_base()


class TimestampsMixin(object):
    updated_at = Column(
        postgresql.TIMESTAMP, onupdate=func.current_timestamp()
    )
    created_at = Column(postgresql.TIMESTAMP, default=func.now())


class TypeWork(Base):
    """
    Возможные типы работы, которые проводятся на МН
    """
    __tablename__ = "type_work"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), index=True)
    departament_id = Column(
        Integer, ForeignKey("departament_of_work.id", ondelete='SET NULL'), nullable=True)

    # relationship
    departament = relationship(
        "DepartamentOfWork",
        lazy="select",
        uselist=False,
        backref=backref("type_works", uselist=True)
    )
    criteria = relationship(
        "Criteria",
        lazy="select",
        uselist=True,
        back_populates="type_works",
        secondary="criteria_work_type"
    )


class DepartamentOfWork(Base):
    """
    Отдел выполняющие работы
    """
    __tablename__ = "departament_of_work"

    id = Column(Integer, primary_key=True)
    name = Column(String(255))


class Protection(Base):
    """
    Защита АСУТП
    """
    __tablename__ = "protection"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), index=True)
    id_type_protection = Column(
        Integer, ForeignKey("type_protection.id", ondelete='SET NULL'), nullable=True, index=True)
    is_end = Column(Boolean)
    id_status = Column(
        Integer, ForeignKey("protection_status.id", ondelete='SET NULL'), nullable=True
    )
    id_location = Column(
        Integer, ForeignKey("location.id", ondelete='SET NULL'), nullable=True)

    # relationship
    type_protection = relationship(
        "TypeProtection",
        uselist=False,
        backref=backref("protections", uselist=True),
        foreign_keys=[id_type_protection],
        post_update=True
    )
    status = relationship(
        "StatusProtection",
        lazy="joined",
        backref=backref("protections", uselist=True)
    )
    rules = relationship(
        "Rule",
        lazy="dynamic",
        uselist=True,
        back_populates="protections",
        secondary="rule_protection"
    )
    location = relationship("Location", backref="protections")


class TypeProtection(Base):
    """
    Тип защиты: ЦСПА, МПСА, СОУ
    """
    __tablename__ = "type_protection"

    id = Column(Integer, primary_key=True)
    name = Column(String(255))


class Location(Base, TimestampsMixin):
    """
    Объекты (локации) магистрального нефтепровода
    """
    __tablename__ = "location"

    id = Column(Integer, primary_key=True)
    name = Column(String(255))
    id_parent = Column(
        Integer, ForeignKey("location.id", ondelete='SET NULL'), nullable=True, index=True)
    id_type = Column(
        Integer, ForeignKey("location_type.id", ondelete='SET NULL'), nullable=True
    )
    ind_location = Column(
        Integer, nullable=True
    )
    full_name = Column(String(255))

    # relationship
    parent = relationship(
        "Location", backref="child", remote_side=id)
    type_location = relationship(
        "TypeLocation", backref="locations")
    criteria = relationship(
        "Criteria",
        lazy="select",
        uselist=True,
        back_populates="locations",
        secondary="criteria_location"
    )


class TypeLocation(Base):
    __tablename__ = "location_type"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), unique=True)

    # relationship
    criteria = relationship(
        "Criteria",
        lazy="select",
        uselist=True,
        back_populates="locations_type",
        secondary="criteria_location_type"
    )


class StatusProtection(Base):
    __tablename__ = "protection_status"

    id = Column(Integer, primary_key=True)
    name = Column(String(64), unique=True)


class User(Base, TimestampsMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String(64), unique=True, index=True)
    password_hash = Column(String(255))
    role = Column(String(32))
    name = Column(String(255))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class MaskingMapFile(Base):
    """
    Карты маскирования

    Поля
        - is_test: boolean - тестовый запрос на создания карты маскирования
        - params_masking: dict - параметры маскирования
        - is_valid: boolean - валидность карты маскирования
    """

    __tablename__ = "masking_map_file"

    id = Column(Integer, primary_key=True)
    filename = Column(String(255), nullable=True)
    description = Column(String(255), nullable=True)
    logic_machine_answer = Column(
        MutableDict.as_mutable(postgresql.JSONB)
    )
    masking_uuid = Column(
        UUID(as_uuid=True), default=uuid.uuid4)
    data_masking = Column(
        MutableDict.as_mutable(postgresql.JSONB)
    )
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete='SET NULL'), nullable=True
    )
    is_test = Column(Boolean)
    params_masking = Column(
        MutableDict.as_mutable(postgresql.JSONB)
    )
    is_valid = Column(Boolean)


class Criteria(Base):
    class TypeCriteria(enum.Enum):
        location = "location"
        type_work = "type_work"
        type_location = "type_location"
        question = "question"

    __tablename__ = "criteria"

    id = Column(Integer, primary_key=True)
    name = Column(String(255))
    type_criteria = Column(
        Enum(TypeCriteria, values_callable=lambda obj: [x.value for x in obj]))
    rule_id = Column(Integer, ForeignKey("rule.id", ondelete='SET NULL'))
    is_any = Column(Boolean, default=True)

    # relationships
    locations = relationship(
        "Location",
        lazy="select",
        uselist=True,
        back_populates="criteria",
        secondary="criteria_location"
    )
    locations_type = relationship(
        "TypeLocation",
        lazy="select",
        uselist=True,
        back_populates="criteria",
        secondary="criteria_location_type"
    )
    type_works = relationship(
        "TypeWork",
        lazy="select",
        uselist=True,
        back_populates="criteria",
        secondary="criteria_work_type"
    )
    rules = relationship(
        "Rule",
        lazy="select",
        uselist=True,
        backref="criteria",
    )
    questions = relationship(
        "Question",
        lazy="select",
        uselist=True,
        back_populates="criteria",
        secondary="question_criteria",
        order_by='CriteriaQuestion.number_question.desc()'
    )


class CriteriaLocation(Base):
    __tablename__ = "criteria_location"

    id = Column(Integer, primary_key=True)
    id_criteria = Column(Integer, ForeignKey("criteria.id", ondelete='SET NULL'))
    id_location = Column(Integer, ForeignKey("location.id", ondelete='SET NULL'))


class CriteriaTypeLocation(Base):
    __tablename__ = "criteria_location_type"

    id = Column(Integer, primary_key=True)
    id_criteria = Column(Integer, ForeignKey("criteria.id", ondelete='SET NULL'))
    id_type_location = Column(Integer, ForeignKey("location_type.id", ondelete='SET NULL'))


class CriteriaTypeWork(Base):
    __tablename__ = "criteria_work_type"

    id = Column(Integer, primary_key=True)
    id_criteria = Column(Integer, ForeignKey("criteria.id", ondelete='SET NULL'))
    id_type_work = Column(Integer, ForeignKey("type_work.id", ondelete='SET NULL'))


class Rule(Base):
    """

    """

    __tablename__ = "rule"

    id = Column(Integer, primary_key=True)
    name = Column(String(255))
    user_id = Column(Integer, ForeignKey("users.id", ondelete='SET NULL'))
    compensatory_measures = Column(Text)

    # relationship
    protections = relationship(
        "Protection",
        lazy="select",
        uselist=True,
        back_populates="rules",
        secondary="rule_protection",
        # cascade="all, delete"
    )
    user = relationship(
        "User",
        lazy="select",
        backref="rules"
    )


class RuleProtection(Base):
    """

    """

    __tablename__ = "rule_protection"

    id = Column(Integer, primary_key=True)
    id_rule = Column(Integer, ForeignKey("rule.id", ondelete='SET NULL'))
    id_protection = Column(Integer, ForeignKey("protection.id", ondelete='SET NULL'))
    is_need_masking = Column(Boolean)
    is_need_demasking = Column(Boolean)


class Question(Base):
    __tablename__ = "question"

    id = Column(Integer, primary_key=True)
    text = Column(String(255))

    # relationship
    criteria = relationship(
        "Criteria",
        lazy="select",
        uselist=True,
        back_populates="questions",
        secondary="question_criteria"
    )


class QuestionAnswer(Base):
    __tablename__ = "question_answer"

    id = Column(Integer, primary_key=True)
    text = Column(String(255))
    id_question = Column(Integer, ForeignKey("question.id", ondelete="CASCADE"))

    # relationship
    questions = relationship(
        "Question",
        lazy="select",
        backref=backref("answers", uselist=True, cascade='all,delete')
    )


class CriteriaQuestion(Base):
    __tablename__ = "question_criteria"

    id = Column(Integer, primary_key=True)
    id_criteria = Column(Integer, ForeignKey("criteria.id"))
    id_question = Column(Integer, ForeignKey("question.id"))
    id_right_answer = Column(Integer)
    number_question = Column(Integer)


class TaskCheckMapFile(Base, TimestampsMixin):
    __tablename__ = "task_check_map_file"

    class StatusTask(enum.Enum):
        pending = "pending"
        in_process = "in_process"
        failed = "failed"
        success = "success"

    id = Column(Integer, primary_key=True)
    type_task = Column(String(255))
    date_start = Column(DateTime)
    status = Column(
        Enum(StatusTask, values_callable=lambda obj: [x.value for x in obj]))
    attempts = Column(Integer, default=0)
