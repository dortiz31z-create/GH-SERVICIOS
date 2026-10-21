from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class DocumentoCredito(Base):
    __tablename__ = "documentos_credito"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    evaluacion_credito_id: Mapped[int] = mapped_column(
        ForeignKey("evaluaciones_credito.id"),
        nullable=False,
        index=True,
    )

    tipo_documento: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )

    nombre_archivo: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    ruta_archivo: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    tipo_mime: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    tamano_bytes: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    hash_archivo: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
        index=True,
    )

    fecha_documento: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    fecha_vencimiento: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    estado_revision: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="RECIBIDO",
        index=True,
    )

    usuario_revision_id: Mapped[int | None] = mapped_column(
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