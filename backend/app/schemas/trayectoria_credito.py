from datetime import date

from pydantic import BaseModel


class ValidacionTrayectoriaCredito(BaseModel):
    cumplida: bool
    tipo_trayectoria: str | None = None
    cantidad_operaciones: int | None = None
    fecha_validacion: date | None = None
    observacion: str | None = None
    usuario_validacion_id: int | None = None