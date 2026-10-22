from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class EvaluacionCreditoCrear(BaseModel):
    cliente_id: int

    fecha_solicitud: date | None = None

    trayectoria_cumplida: bool = False

    tipo_trayectoria: str | None = None

    cantidad_operaciones_trayectoria: int | None = None

    fecha_validacion_trayectoria: date | None = None

    usuario_validacion_trayectoria_id: int | None = None

    observacion_trayectoria: str | None = None

    monto_solicitado: Decimal | None = None

    dias_credito_solicitados: int | None = None

    observaciones: str | None = None


class EvaluacionCreditoRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    cliente_id: int
    fecha_solicitud: date

    estado: str
    resultado: str

    trayectoria_cumplida: bool
    tipo_trayectoria: str | None
    cantidad_operaciones_trayectoria: int | None
    fecha_validacion_trayectoria: date | None
    usuario_validacion_trayectoria_id: int | None
    observacion_trayectoria: str | None

    monto_solicitado: Decimal | None
    dias_credito_solicitados: int | None

    monto_aprobado: Decimal | None
    dias_credito_aprobados: int | None

    fecha_decision: date | None
    usuario_decision_id: int | None

    observaciones: str | None

    creado_en: datetime
    actualizado_en: datetime