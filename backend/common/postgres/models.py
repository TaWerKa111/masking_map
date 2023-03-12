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
from sqlalchemy.sql.sqltypes import DateTime, Date
from sqlalchemy.ext.mutable import MutableDict

from werkzeug.security import generate_password_hash, check_password_hash

import uuid

from config import AppConfig

Base = declarative_base()


class TimestampsMixin(object):
    updated_at = Column(
        postgresql.TIMESTAMP, onupdate=func.current_timestamp()
    )
    created_at = Column(postgresql.TIMESTAMP, default=func.now())


class TypeWork(Base):
    __tablename__ = "type_work"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), index=True)

    # relationship
    protections = relationship(
        "Protection",
        lazy="dynamic",
        uselist=True,
        back_populates="works",
        secondary="type_work_protection"
    )


class Protection(Base):
    __tablename__ = "protection"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), index=True)
    id_type_protection = Column(
        Integer, ForeignKey("type_protection.id"), nullable=True, index=True)
    is_end = Column(Boolean)
    is_need_masking = Column(Boolean)
    id_status = Column(
        Integer, ForeignKey("protection_status.id"), nullable=True
    )

    # relationship
    type_protection = relationship(
        "TypeProtection",
        backref=backref("protections", uselist=True),
        foreign_keys=[id_type_protection],
        post_update=True
    )
    works = relationship(
        "TypeWork",
        lazy="dynamic",
        uselist=True,
        back_populates="protections",
        secondary="type_work_protection"
    )
    status = relationship(
        "StatusProtection",
        lazy="joined",
        backref=backref("protections", uselist=True)
    )


class RulesOfProtection(Base):
    __tablename__ = "rules_of_protection"

    id = Column(Integer, primary_key=True)
    name = Column(String(255))
    any_rules = Column(MutableDict.as_mutable(postgresql.JSONB))
    id_protection = Column(Integer, ForeignKey("protection.id"))

    # relationship
    protections = relationship(
        "Protection",
        backref=backref("rules", uselist=True),
        foreign_keys=[id_protection],
        post_update=True
    )


class TypeProtection(Base):
    __tablename__ = "type_protection"

    id = Column(Integer, primary_key=True)
    name = Column(String(255))


class TypeWorkProtection(Base):
    __tablename__ = "type_work_protection"

    id = Column(Integer, primary_key=True)
    id_protection = Column(Integer, ForeignKey("protection.id"))
    id_type_work = Column(Integer, ForeignKey("type_work.id"))


class MNObject(Base, TimestampsMixin):
    """
    Объекты магистрального нефтепровода
    """
    __tablename__ = "mn_object"

    id = Column(Integer, primary_key=True)
    name = Column(String(255))
    id_protection = Column(
        Integer, ForeignKey("protection.id"), nullable=True)
    id_parent = Column(
        Integer, ForeignKey("mn_object.id"), nullable=True, index=True)
    id_type = Column(
        Integer, ForeignKey("mn_object_type.id"), nullable=True
    )

    # relationship
    parent = relationship(
        "MNObject", backref="child", remote_side=id)
    protection = relationship("Protection", backref="mn_objects")
    type_object = relationship(
        "TypeMnObject", backref="mn_objects")


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


class HistoryRequest(Base):
    __tablename__ = "history_masking"

    id = Column(Integer, primary_key=True)
    filename = Column(String(255))
    description = Column(String(255))
    masking_uuid = Column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    data_masking = Column(
        MutableDict.as_mutable(postgresql.JSONB)
    )


class TemplateMasking(Base):
    __tablename__ = "type_mnobject_protection"

    id = Column(Integer, primary_key=True)
    id_mn_object = Column(Integer, ForeignKey("mn_object.id"))
    id_type_work = Column(Integer, ForeignKey("type_work.id"))


class TypeMnObject(Base):
    __tablename__ = "mn_object_type"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), unique=True)
