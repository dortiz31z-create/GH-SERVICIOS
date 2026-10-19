"""Agregar control de credito a documentos

Revision ID: 6497fe0d5ed6
Revises: c7f38eb0851a
Create Date: 2026-10-19 18:27:52.063856

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "6497fe0d5ed6"
down_revision: Union[str, Sequence[str], None] = "c7f38eb0851a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # Primero agregamos las columnas permitiendo NULL
    # para poder actualizar los documentos existentes.

    op.add_column(
        "documentos_tributarios",
        sa.Column(
            "dias_credito_aplicado",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.add_column(
        "documentos_tributarios",
        sa.Column(
            "fecha_vencimiento",
            sa.Date(),
            nullable=True,
        ),
    )

    op.add_column(
        "documentos_tributarios",
        sa.Column(
            "saldo_pendiente",
            sa.Numeric(15, 2),
            nullable=True,
        ),
    )

    op.add_column(
        "documentos_tributarios",
        sa.Column(
            "estado_pago",
            sa.String(30),
            nullable=True,
        ),
    )

    # Inicializamos los documentos que ya existen.
    #
    # Al importar una factura, inicialmente asumimos:
    # - 0 días de crédito hasta determinar la condición del cliente.
    # - saldo pendiente igual al monto total.
    # - estado PENDIENTE.
    #
    # No modificamos monto_total ni ningún dato tributario.

    op.execute(
        """
        UPDATE documentos_tributarios
        SET
            dias_credito_aplicado = 0,
            saldo_pendiente = monto_total,
            estado_pago = 'PENDIENTE'
        """
    )

    # Ahora que todos los documentos existentes tienen valores,
    # hacemos obligatorios estos campos.

    op.alter_column(
        "documentos_tributarios",
        "dias_credito_aplicado",
        existing_type=sa.Integer(),
        nullable=False,
    )

    op.alter_column(
        "documentos_tributarios",
        "saldo_pendiente",
        existing_type=sa.Numeric(15, 2),
        nullable=False,
    )

    op.alter_column(
        "documentos_tributarios",
        "estado_pago",
        existing_type=sa.String(30),
        nullable=False,
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column(
        "documentos_tributarios",
        "estado_pago",
    )

    op.drop_column(
        "documentos_tributarios",
        "saldo_pendiente",
    )

    op.drop_column(
        "documentos_tributarios",
        "fecha_vencimiento",
    )

    op.drop_column(
        "documentos_tributarios",
        "dias_credito_aplicado",
    )