from datetime import datetime

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Banco(Base):
    __tablename__ = "bancos"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    nombre: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True,
    )

    codigo: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
        unique=True,
    )

    activo: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    creado_en: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )