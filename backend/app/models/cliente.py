from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Cliente(Base):
    __tablename__ = "clientes"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    rut: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        unique=True,
        index=True,
    )

    razon_social: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    nombre_fantasia: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )

    giro: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )

    direccion: Mapped[str | None] = mapped_column(
        String(250),
        nullable=True,
    )

    comuna: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    ciudad: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    telefono: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    email: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    activo: Mapped[bool] = mapped_column(
        nullable=False,
        default=True,
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