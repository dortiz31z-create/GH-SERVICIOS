from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import func, select

from app.database import SessionLocal
from app.models.cliente import Cliente
from app.models.documento_tributario import DocumentoTributario
from app.models.pago import Pago
from app.models.movimiento_bancario import MovimientoBancario


app = FastAPI(
    title="GH Servicios",
    description="Sistema de gestión de clientes, facturas, pagos y conciliación",
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "GH Servicios API funcionando",
        "version": "0.1.0",
    }


@app.get("/api/dashboard")
def dashboard():
    with SessionLocal() as db:
        clientes = db.scalar(
            select(func.count()).select_from(Cliente)
        )

        documentos = db.scalar(
            select(func.count()).select_from(DocumentoTributario)
        )

        pagos_pendientes = db.scalar(
            select(func.count())
            .select_from(Pago)
            .where(Pago.estado == "pendiente")
        )

        movimientos = db.scalar(
            select(func.count()).select_from(MovimientoBancario)
        )

        return {
            "clientes": clientes,
            "documentos": documentos,
            "pagos_pendientes": pagos_pendientes,
            "movimientos": movimientos,
        }


class ClienteCreate(BaseModel):
    rut: str
    razon_social: str
    nombre_fantasia: str | None = None
    giro: str | None = None
    direccion: str | None = None
    comuna: str | None = None
    ciudad: str | None = None
    telefono: str | None = None
    email: str | None = None

@app.get("/api/documentos")
def listar_documentos():
    with SessionLocal() as db:
        documentos = db.scalars(
            select(DocumentoTributario).order_by(
                DocumentoTributario.fecha_documento.desc(),
                DocumentoTributario.folio.desc(),
            )
        ).all()

        return [
            {
                "id": documento.id,
                "tipo_documento": documento.tipo_documento,
                "tipo_venta": documento.tipo_venta,
                "rut_cliente": documento.rut_cliente,
                "razon_social": documento.razon_social,
                "folio": documento.folio,
                "fecha_documento": documento.fecha_documento,
                "fecha_recepcion": documento.fecha_recepcion,
                "monto_exento": documento.monto_exento,
                "monto_neto": documento.monto_neto,
                "monto_iva": documento.monto_iva,
                "monto_total": documento.monto_total,
                "tipo_documento_referencia": documento.tipo_documento_referencia,
                "folio_documento_referencia": documento.folio_documento_referencia,
                "numero_interno": documento.numero_interno,
                "codigo_sucursal": documento.codigo_sucursal,
            }
            for documento in documentos
        ]

@app.get("/api/clientes")
def listar_clientes():
    with SessionLocal() as db:
        clientes = db.scalars(
            select(Cliente).order_by(Cliente.razon_social)
        ).all()

        return [
            {
                "id": cliente.id,
                "rut": cliente.rut,
                "razon_social": cliente.razon_social,
                "nombre_fantasia": cliente.nombre_fantasia,
                "giro": cliente.giro,
                "direccion": cliente.direccion,
                "comuna": cliente.comuna,
                "ciudad": cliente.ciudad,
                "telefono": cliente.telefono,
                "email": cliente.email,
                "activo": cliente.activo,
            }
            for cliente in clientes
        ]

@app.post("/api/clientes")
def crear_cliente(cliente_data: ClienteCreate):
    with SessionLocal() as db:
        cliente_existente = db.scalar(
            select(Cliente).where(Cliente.rut == cliente_data.rut)
        )

        if cliente_existente:
            return {
                "error": "Ya existe un cliente con ese RUT"
            }

        cliente = Cliente(
            rut=cliente_data.rut,
            razon_social=cliente_data.razon_social,
            nombre_fantasia=cliente_data.nombre_fantasia,
            giro=cliente_data.giro,
            direccion=cliente_data.direccion,
            comuna=cliente_data.comuna,
            ciudad=cliente_data.ciudad,
            telefono=cliente_data.telefono,
            email=cliente_data.email,
        )

        db.add(cliente)
        db.commit()
        db.refresh(cliente)

        return {
            "id": cliente.id,
            "rut": cliente.rut,
            "razon_social": cliente.razon_social,
            "mensaje": "Cliente creado correctamente",
        }