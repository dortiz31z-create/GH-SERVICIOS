from datetime import datetime

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class TipoCliente(Base):
    __tablename__ = "tipos_cliente"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    nombre: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True,
    )

    descripcion: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    dias_credito_default: Mapped[int] = mapped_column(
        nullable=False,
        default=0,
    )

    activo: Mapped[bool] = mapped_column(
        nullable=False,
        default=True,
    )

    creado_en: Mapped[datetime] = mapped_column(
        nullable=False,
        default=datetime.utcnow,
    )