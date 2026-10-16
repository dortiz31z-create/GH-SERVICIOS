from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Conciliacion(Base):
    __tablename__ = "conciliaciones"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    pago_id: Mapped[int] = mapped_column(
        ForeignKey("pagos.id"),
        nullable=False,
        index=True,
    )

    documento_tributario_id: Mapped[int] = mapped_column(
        ForeignKey("documentos_tributarios.id"),
        nullable=False,
        index=True,
    )

    monto_aplicado: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    tipo_conciliacion: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="manual",
    )

    estado: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="conciliada",
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