from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class HistorialCredito(Base):
    __tablename__ = "historial_credito"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    cliente_id: Mapped[int] = mapped_column(
        ForeignKey("clientes.id"),
        nullable=False,
        index=True,
    )

    tipo_cliente_anterior_id: Mapped[int | None] = mapped_column(
        ForeignKey("tipos_cliente.id"),
        nullable=True,
    )

    tipo_cliente_nuevo_id: Mapped[int | None] = mapped_column(
        ForeignKey("tipos_cliente.id"),
        nullable=True,
    )

    dias_credito_anterior: Mapped[int | None] = mapped_column(
        nullable=True,
    )

    dias_credito_nuevo: Mapped[int | None] = mapped_column(
        nullable=True,
    )

    limite_credito_anterior: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    limite_credito_nuevo: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    motivo: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    usuario_id: Mapped[int | None] = mapped_column(
        ForeignKey("usuarios.id"),
        nullable=True,
    )

    creado_en: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )