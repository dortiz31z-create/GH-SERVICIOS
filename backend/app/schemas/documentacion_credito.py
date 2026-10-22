from pydantic import BaseModel


class EstadoDocumentoCredito(BaseModel):
    tipo_documento: str
    requerido: bool
    presente: bool
    estado_revision: str | None
    documento_id: int | None


class DocumentacionCreditoRespuesta(BaseModel):
    evaluacion_credito_id: int
    documentos_requeridos: int
    documentos_presentes: int
    documentos_faltantes: int
    documentacion_completa: bool
    estados: list[EstadoDocumentoCredito]