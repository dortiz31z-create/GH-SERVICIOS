from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Pagador(Base):
    __tablename__ = "pagadores"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    cliente_id: Mapped[int] = mapped_column(
        ForeignKey("clientes.id"),
        nullable=False,
        index=True,
    )

    rut_pagador: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        index=True,
    )

    nombre_pagador: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    tipo: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="empresa",
    )

    autorizado: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    fecha_desde: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    fecha_hasta: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    observaciones: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    creado_en: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    actualizado_en: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )