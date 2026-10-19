from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class CreditoCliente(Base):
    __tablename__ = "credito_clientes"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    cliente_id: Mapped[int] = mapped_column(
        ForeignKey("clientes.id"),
        nullable=False,
        index=True,
    )

    tipo_cliente_id: Mapped[int | None] = mapped_column(
        ForeignKey("tipos_cliente.id"),
        nullable=True,
        index=True,
    )

    dias_credito: Mapped[int] = mapped_column(
        nullable=False,
        default=0,
    )

    limite_credito: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    fecha_inicio: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    fecha_revision: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    activo: Mapped[bool] = mapped_column(
        nullable=False,
        default=True,
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