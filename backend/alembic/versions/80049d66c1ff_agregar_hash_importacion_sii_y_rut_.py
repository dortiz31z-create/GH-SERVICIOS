"""agregar hash importacion sii y rut empresa documentos

Revision ID: 80049d66c1ff
Revises: c72eebbc8042
Create Date: 2026-10-18 14:59:40.097627

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "80049d66c1ff"
down_revision: Union[str, Sequence[str], None] = "c72eebbc8042"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # 1. Guardamos el hash SHA-256 del archivo SII importado.
    op.add_column(
        "importaciones_sii",
        sa.Column(
            "hash_archivo",
            sa.String(length=64),
            nullable=True,
        ),
    )

    # Los registros existentes todavía no tienen hash.
    # Primero permitimos NULL para preservar los datos actuales.
    # Luego dejamos la columna como NOT NULL después de completar los datos.
    #
    # Actualmente no tenemos importaciones SII reales en la base de datos,
    # por lo que podemos convertirla directamente a NOT NULL.
    op.alter_column(
        "importaciones_sii",
        "hash_archivo",
        existing_type=sa.String(length=64),
        nullable=False,
    )

    # 2. Identificamos la empresa emisora del documento SII.
    op.add_column(
        "documentos_tributarios",
        sa.Column(
            "rut_empresa",
            sa.String(length=20),
            nullable=True,
        ),
    )

    # Actualmente no existen documentos SII cargados.
    # Por lo tanto podemos convertir la columna directamente a NOT NULL.
    op.alter_column(
        "documentos_tributarios",
        "rut_empresa",
        existing_type=sa.String(length=20),
        nullable=False,
    )

    # 3. Un documento tributario queda identificado por:
    #    empresa emisora + tipo de documento + folio.
    op.create_unique_constraint(
        "uq_documento_rut_empresa_tipo_folio",
        "documentos_tributarios",
        [
            "rut_empresa",
            "tipo_documento",
            "folio",
        ],
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_constraint(
        "uq_documento_rut_empresa_tipo_folio",
        "documentos_tributarios",
        type_="unique",
    )

    op.drop_column(
        "documentos_tributarios",
        "rut_empresa",
    )

    op.drop_column(
        "importaciones_sii",
        "hash_archivo",
    )