from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class MovimientoBancario(Base):
    __tablename__ = "movimientos_bancarios"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    importacion_bancaria_id: Mapped[int] = mapped_column(
        ForeignKey("importaciones_bancarias.id"),
        nullable=False,
        index=True,
    )

    fecha_movimiento: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
    )

    descripcion_original: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    numero_documento: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    sucursal: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    tipo_movimiento: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    monto: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    cargo_abono: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
    )

    monto_abono: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    monto_cargo: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    saldo_diario: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    rut_pagador_detectado: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
        index=True,
    )

    nombre_pagador_detectado: Mapped[str | None] = mapped_column(
        String(250),
        nullable=True,
    )

    creado_en: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )