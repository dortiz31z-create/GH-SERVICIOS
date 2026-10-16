from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class CuentaBancariaGH(Base):
    __tablename__ = "cuentas_bancarias_gh"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    banco_id: Mapped[int] = mapped_column(
        ForeignKey("bancos.id"),
        nullable=False,
        index=True,
    )

    numero_cuenta: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
    )

    tipo_cuenta: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    moneda: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        default="CLP",
    )

    titular: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )

    rut_titular: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    activo: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    creado_en: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )