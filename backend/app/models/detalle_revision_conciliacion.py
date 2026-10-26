from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class DetalleRevisionConciliacion(Base):
    __tablename__ = "detalles_revision_conciliacion"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    revision_id: Mapped[int] = mapped_column(
        ForeignKey("revisiones_conciliacion.id"),
        nullable=False,
        index=True,
    )

    documento_id: Mapped[int] = mapped_column(
        ForeignKey("documentos_tributarios.id"),
        nullable=False,
        index=True,
    )

    monto_propuesto: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    creado_en: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    observaciones: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )