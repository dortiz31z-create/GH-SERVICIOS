from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class RevisionConciliacion(Base):
    __tablename__ = "revisiones_conciliacion"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    pago_id: Mapped[int] = mapped_column(
        ForeignKey("pagos.id"),
        nullable=False,
        index=True,
    )

    estado: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="PENDIENTE",
        index=True,
    )

    cliente_propuesto_id: Mapped[int | None] = mapped_column(
        ForeignKey("clientes.id"),
        nullable=True,
        index=True,
    )

    puntaje_propuesta: Mapped[Decimal | None] = mapped_column(
        Numeric(6, 2),
        nullable=True,
    )

    nivel_propuesta: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )

    evidencia_propuesta: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    cliente_confirmado_id: Mapped[int | None] = mapped_column(
        ForeignKey("clientes.id"),
        nullable=True,
        index=True,
    )

    usuario_id: Mapped[int | None] = mapped_column(
        ForeignKey("usuarios.id"),
        nullable=True,
        index=True,
    )

    fecha_revision: Mapped[datetime | None] = mapped_column(
        DateTime,
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