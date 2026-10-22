from decimal import Decimal

from pydantic import BaseModel


class DecisionCredito(BaseModel):
    resultado: str
    monto_aprobado: Decimal | None = None
    dias_credito_aprobados: int | None = None
    observaciones: str | None = None