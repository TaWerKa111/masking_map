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

    # relationship
    parent = relationship(
        "MNObject", backref="child", remote_side=id)
    protection = relationship("Protection", backref="mn_objects")
