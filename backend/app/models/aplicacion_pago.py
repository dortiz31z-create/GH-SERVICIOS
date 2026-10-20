from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class AplicacionPago(Base):
    __tablename__ = "aplicaciones_pago"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    pago_id: Mapped[int] = mapped_column(
        ForeignKey("pagos.id"),
        nullable=False,
        index=True,
    )

    documento_id: Mapped[int] = mapped_column(
        ForeignKey("documentos_tributarios.id"),
        nullable=False,
        index=True,
    )

    monto_aplicado: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    fecha_aplicacion: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
    )

    usuario_id: Mapped[int | None] = mapped_column(
        ForeignKey("usuarios.id"),
        nullable=True,
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