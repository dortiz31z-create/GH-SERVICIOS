from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class DocumentoCreditoRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    evaluacion_credito_id: int

    tipo_documento: str
    nombre_archivo: str
    tipo_mime: str | None
    tamano_bytes: int | None
    hash_archivo: str | None

    fecha_documento: date | None
    fecha_vencimiento: date | None

    estado_revision: str
    usuario_revision_id: int | None
    fecha_revision: datetime | None

    observaciones: str | None
    creado_en: datetime

    