from datetime import datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class ImportacionBancaria(Base):
    __tablename__ = "importaciones_bancarias"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    cuenta_bancaria_gh_id: Mapped[int] = mapped_column(
        ForeignKey("cuentas_bancarias_gh.id"),
        nullable=False,
        index=True,
    )

    nombre_archivo: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    fecha_desde: Mapped[datetime | None] = mapped_column(
        Date,
        nullable=True,
    )

    fecha_hasta: Mapped[datetime | None] = mapped_column(
        Date,
        nullable=True,
    )

    cantidad_registros: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    estado: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="importada",
    )

    creado_en: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )