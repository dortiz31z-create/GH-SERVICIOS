from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Pago(Base):
    __tablename__ = "pagos"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    movimiento_bancario_id: Mapped[int] = mapped_column(
        ForeignKey("movimientos_bancarios.id"),
        nullable=False,
        unique=True,
        index=True,
    )

    cliente_id: Mapped[int | None] = mapped_column(
        ForeignKey("clientes.id"),
        nullable=True,
        index=True,
    )

    pagador_id: Mapped[int | None] = mapped_column(
        ForeignKey("pagadores.id"),
        nullable=True,
        index=True,
    )

    fecha_pago: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
    )

    monto_pago: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    moneda: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        default="CLP",
    )

    medio_pago: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    estado: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="pendiente",
        index=True,
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