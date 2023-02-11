import hashlib
import enum

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
from sqlalchemy.orm import relationship, backref, declarative_base
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


