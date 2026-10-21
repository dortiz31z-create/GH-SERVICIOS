from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class EvaluacionCredito(Base):
    __tablename__ = "evaluaciones_credito"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    cliente_id: Mapped[int] = mapped_column(
        ForeignKey("clientes.id"),
        nullable=False,
        index=True,
    )

    fecha_solicitud: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        default=date.today,
    )

    estado: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="PENDIENTE",
        index=True,
    )

    resultado: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="PENDIENTE",
        index=True,
    )

    trayectoria_cumplida: Mapped[bool] = mapped_column(
        nullable=False,
        default=False,
        index=True,
    )

    tipo_trayectoria: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    cantidad_operaciones_trayectoria: Mapped[int | None] = mapped_column(
        nullable=True,
    )

    fecha_validacion_trayectoria: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    usuario_validacion_trayectoria_id: Mapped[int | None] = mapped_column(
        ForeignKey("usuarios.id"),
        nullable=True,
        index=True,
    )

    observacion_trayectoria: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    monto_solicitado: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    dias_credito_solicitados: Mapped[int | None] = mapped_column(
        nullable=True,
    )

    monto_aprobado: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    dias_credito_aprobados: Mapped[int | None] = mapped_column(
        nullable=True,
    )

    fecha_decision: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    usuario_decision_id: Mapped[int | None] = mapped_column(
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

    actualizado_en: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )