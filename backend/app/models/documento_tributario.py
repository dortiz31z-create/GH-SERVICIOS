from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, Numeric, String, UniqueConstraint
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class DocumentoTributario(Base):
    __tablename__ = "documentos_tributarios"

    __table_args__ = (
        UniqueConstraint(
            "rut_empresa",
            "tipo_documento",
            "folio",
            name="uq_documento_rut_empresa_tipo_folio",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    importacion_sii_id: Mapped[int] = mapped_column(
        ForeignKey("importaciones_sii.id"),
        nullable=False,
        index=True,
    )

    rut_empresa: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        index=True,
    )

    tipo_documento: Mapped[int] = mapped_column(
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

    monto_exento: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    monto_neto: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    monto_iva: Mapped[Decimal | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
    )

    monto_total: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    tipo_documento_referencia: Mapped[int | None] = mapped_column(
        nullable=True,
    )

    folio_documento_referencia: Mapped[int | None] = mapped_column(
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

    # Información de crédito aplicada a esta factura.
    # Estos valores quedan registrados en la factura y no
    # dependen de cambios posteriores en la condición del cliente.

    dias_credito_aplicado: Mapped[int] = mapped_column(
        nullable=False,
        default=0,
    )

    fecha_vencimiento: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    saldo_pendiente: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )

    estado_pago: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="PENDIENTE",
    )

    creado_en: Mapped[datetime] = mapped_column(
        nullable=False,
        default=datetime.utcnow,
    )