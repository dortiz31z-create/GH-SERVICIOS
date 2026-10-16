from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class DocumentoTributario(Base):
    __tablename__ = "documentos_tributarios"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    importacion_sii_id: Mapped[int] = mapped_column(
        ForeignKey("importaciones_sii.id"),
        nullable=False,
        index=True,
    )

    tipo_documento: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        index=True,
    )

    tipo_venta: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    rut_cliente: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        index=True,
    )

    razon_social: Mapped[str | None] = mapped_column(
        String(250),
        nullable=True,
    )

    folio: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        index=True,
    )

    fecha_documento: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
    )

    fecha_recepcion: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    monto_exento: Mapped[Numeric | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    monto_neto: Mapped[Numeric | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    monto_iva: Mapped[Numeric | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    monto_total: Mapped[Numeric] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    tipo_documento_referencia: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    folio_documento_referencia: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    numero_interno: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    codigo_sucursal: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    creado_en: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )