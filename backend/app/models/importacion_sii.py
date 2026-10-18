from datetime import datetime

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class ImportacionSII(Base):
    __tablename__ = "importaciones_sii"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    rut_empresa: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        index=True,
    )

    periodo: Mapped[str] = mapped_column(
        String(6),
        nullable=False,
        index=True,
    )

    nombre_archivo: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    hash_archivo: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        unique=True,
        index=True,
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