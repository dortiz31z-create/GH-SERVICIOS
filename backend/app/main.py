from fastapi import FastAPI, UploadFile, File, HTTPException, Form

from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

from sqlalchemy import func, select



import hashlib

import io

import re

from pathlib import Path

from decimal import Decimal, InvalidOperation

from itertools import combinations
from datetime import date, datetime



import pandas as pd



from app.database import SessionLocal

from app.models.cliente import Cliente
from app.models.credito_cliente import CreditoCliente
from app.models.documento_tributario import DocumentoTributario

from app.models.importacion_sii import ImportacionSII

from app.models.pago import Pago

from app.models.movimiento_bancario import MovimientoBancario

from app.models.importacion_bancaria import ImportacionBancaria

from app.models.cuenta_bancaria_gh import CuentaBancariaGH
from app.models.pagador import Pagador
from app.models.evaluacion_credito import EvaluacionCredito
from app.models.documento_credito import DocumentoCredito
from app.schemas.evaluacion_credito import (
    EvaluacionCreditoCrear,
    EvaluacionCreditoRespuesta,
)
from app.models.usuario import Usuario
from app.schemas.documento_credito import DocumentoCreditoRespuesta
from app.schemas.documentacion_credito import DocumentacionCreditoRespuesta
from app.schemas.decision_credito import DecisionCredito
from app.schemas.trayectoria_credito import ValidacionTrayectoriaCredito


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





# ============================================================

# FUNCIONES GENERALES

# ============================================================



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





# ============================================================

# CLIENTES

# ============================================================



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

class PagadorCreate(BaseModel):
    cliente_id: int
    rut_pagador: str
    nombre_pagador: str
    tipo: str = "empresa"
    autorizado: bool = True
    fecha_desde: date | None = None
    fecha_hasta: date | None = None
    observaciones: str | None = None


@app.get("/api/pagadores")
def listar_pagadores():
    with SessionLocal() as db:
        pagadores = db.scalars(
            select(Pagador).order_by(Pagador.nombre_pagador)
        ).all()

        return [
            {
                "id": pagador.id,
                "cliente_id": pagador.cliente_id,
                "rut_pagador": pagador.rut_pagador,
                "nombre_pagador": pagador.nombre_pagador,
                "tipo": pagador.tipo,
                "autorizado": pagador.autorizado,
                "fecha_desde": pagador.fecha_desde,
                "fecha_hasta": pagador.fecha_hasta,
                "observaciones": pagador.observaciones,
            }
            for pagador in pagadores
        ]


@app.post("/api/pagadores")
def crear_pagador(datos: PagadorCreate):
    with SessionLocal() as db:
        cliente = db.get(Cliente, datos.cliente_id)

        if not cliente:
            raise HTTPException(
                status_code=404,
                detail="El cliente indicado no existe.",
            )

        pagador_existente = db.scalar(
            select(Pagador).where(
                Pagador.cliente_id == datos.cliente_id,
                Pagador.rut_pagador == datos.rut_pagador,
            )
        )

        if pagador_existente:
            raise HTTPException(
                status_code=400,
                detail="Ese RUT ya está registrado como pagador de este cliente.",
            )

        pagador = Pagador(
            cliente_id=datos.cliente_id,
            rut_pagador=datos.rut_pagador,
            nombre_pagador=datos.nombre_pagador,
            tipo=datos.tipo,
            autorizado=datos.autorizado,
            fecha_desde=datos.fecha_desde,
            fecha_hasta=datos.fecha_hasta,
            observaciones=datos.observaciones,
        )

        db.add(pagador)
        db.commit()
        db.refresh(pagador)

        return {
            "mensaje": "Pagador registrado correctamente.",
            "pagador": {
                "id": pagador.id,
                "cliente_id": pagador.cliente_id,
                "rut_pagador": pagador.rut_pagador,
                "nombre_pagador": pagador.nombre_pagador,
                "tipo": pagador.tipo,
                "autorizado": pagador.autorizado,
                "fecha_desde": pagador.fecha_desde,
                "fecha_hasta": pagador.fecha_hasta,
                "observaciones": pagador.observaciones,
            },
        }



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

            select(Cliente).where(

                Cliente.rut == cliente_data.rut

            )

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





# ============================================================

# DOCUMENTOS TRIBUTARIOS

# ============================================================



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

                "importacion_sii_id": documento.importacion_sii_id,

                "rut_empresa": documento.rut_empresa,

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

                "tipo_documento_referencia": (

                    documento.tipo_documento_referencia

                ),

                "folio_documento_referencia": (

                    documento.folio_documento_referencia

                ),

                "numero_interno": documento.numero_interno,

                "codigo_sucursal": documento.codigo_sucursal,

            }

            for documento in documentos

        ]





# ============================================================

# FUNCIONES DE CONVERSIÓN DEL RCV

# ============================================================



def normalizar_texto(valor) -> str | None:

    """

    Convierte un valor del CSV a texto limpio.

    Devuelve None cuando viene vacío.

    """

    if valor is None:

        return None



    try:

        if pd.isna(valor):

            return None

    except (TypeError, ValueError):

        pass



    texto = str(valor).strip()



    if not texto:

        return None



    if texto.lower() in {"nan", "none"}:

        return None



    return texto





def normalizar_rut(valor) -> str | None:

    """

    Normaliza un RUT chileno quitando puntos y espacios.

    """

    texto = normalizar_texto(valor)



    if texto is None:

        return None



    return (

        texto

        .replace(".", "")

        .replace(" ", "")

        .upper()

    )





def convertir_entero(valor) -> int | None:

    """

    Convierte valores como:

    33

    33.0

    '33'

    '33.0'

    """

    texto = normalizar_texto(valor)



    if texto is None:

        return None



    try:

        return int(float(texto.replace(",", ".")))

    except (ValueError, TypeError):

        return None





def convertir_decimal(valor) -> Decimal | None:

    """

    Convierte montos provenientes del RCV.

    """

    texto = normalizar_texto(valor)



    if texto is None:

        return None



    try:

        texto = texto.replace(".", "").replace(",", ".")

        return Decimal(texto)

    except (InvalidOperation, ValueError):

        return None





def convertir_fecha(valor):

    """

    Convierte fechas del RCV a datetime.date.

    """

    texto = normalizar_texto(valor)



    if texto is None:

        return None



    fecha = pd.to_datetime(

        texto,

        dayfirst=True,

        errors="coerce",

    )



    if pd.isna(fecha):

        return None



    return fecha.date()





# ============================================================

# IDENTIFICACIÓN DEL ARCHIVO RCV

# ============================================================



def extraer_rut_y_periodo_desde_nombre(

    nombre_archivo: str,

) -> tuple[str, str]:

    """

    Extrae RUT empresa y período desde nombres como:



    RCV_VENTA_76372424-7_202608.csv

    RCV_VENTA_76372424-7_202608 (3).csv

    """



    nombre = nombre_archivo.strip()



    patron = re.compile(

        r"RCV_VENTA_([0-9Kk.\\-]+)_([0-9]{6})",

        re.IGNORECASE,

    )



    coincidencia = patron.search(nombre)



    if not coincidencia:

        raise HTTPException(

            status_code=400,

            detail=(

                "No fue posible identificar el RUT de la empresa "

                "y el período desde el nombre del archivo. "

                "Se esperaba un nombre similar a "

                "'RCV_VENTA_76372424-7_202608.csv'."

            ),

        )



    rut_empresa = normalizar_rut(

        coincidencia.group(1)

    )



    periodo = coincidencia.group(2)



    return rut_empresa, periodo





# ============================================================

# IMPORTACIÓN RCV SII

# ============================================================



@app.post("/api/documentos/importar-sii")

async def importar_sii(

    archivo: UploadFile = File(...),

):

    """

    Importa un archivo CSV del Registro de Compras y Ventas

    del SII.



    El proceso:



    1. Lee el archivo.

    2. Calcula SHA-256.

    3. Detecta si el archivo ya fue importado.

    4. Obtiene RUT empresa y período.

    5. Valida la estructura.

    6. Registra la importación.

    7. Importa documentos tributarios.

    8. Detecta documentos duplicados.

    9. Confirma todo mediante una transacción.

    """



    # --------------------------------------------------------

    # VALIDAR NOMBRE

    # --------------------------------------------------------



    if not archivo.filename:

        raise HTTPException(

            status_code=400,

            detail="No se recibió ningún archivo.",

        )



    if not archivo.filename.lower().endswith(".csv"):

        raise HTTPException(

            status_code=400,

            detail="El archivo debe ser un CSV.",

        )



    # --------------------------------------------------------

    # LEER ARCHIVO

    # --------------------------------------------------------



    contenido = await archivo.read()



    if not contenido:

        raise HTTPException(

            status_code=400,

            detail="El archivo está vacío.",

        )



    # --------------------------------------------------------

    # CALCULAR HASH SHA-256

    # --------------------------------------------------------



    hash_archivo = hashlib.sha256(

        contenido

    ).hexdigest()



    # --------------------------------------------------------

    # OBTENER RUT EMPRESA Y PERÍODO

    # --------------------------------------------------------



    rut_empresa, periodo = (

        extraer_rut_y_periodo_desde_nombre(

            archivo.filename

        )

    )



    # --------------------------------------------------------

    # VERIFICAR ARCHIVO YA IMPORTADO

    # --------------------------------------------------------



    with SessionLocal() as db:



        importacion_existente = db.scalar(

            select(ImportacionSII).where(

                ImportacionSII.hash_archivo

                == hash_archivo

            )

        )



        if importacion_existente:



            # ------------------------------------------------

            # RECUPERACIÓN DEL PRIMER INTENTO FALLIDO

            # ------------------------------------------------

            #

            # Nuestro primer intento registró la importación

            # pero no pudo procesar ninguna fila.

            #

            # Permitimos eliminar solamente ese tipo de

            # registro incompleto para poder reintentar.

            #



            if (

                importacion_existente.estado

                == "importada"

                and importacion_existente.cantidad_registros

                == 0

            ):

                db.delete(importacion_existente)

                db.commit()



            else:

                return {

                    "mensaje": (

                        "El archivo ya había sido importado."

                    ),

                    "duplicado_archivo": True,

                    "importacion_id": (

                        importacion_existente.id

                    ),

                    "archivo": (

                        importacion_existente.nombre_archivo

                    ),

                    "rut_empresa": (

                        importacion_existente.rut_empresa

                    ),

                    "periodo": (

                        importacion_existente.periodo

                    ),

                    "cantidad_registros": (

                        importacion_existente

                        .cantidad_registros

                    ),

                }



    # --------------------------------------------------------

    # LEER CSV

    # --------------------------------------------------------



    try:

        df = pd.read_csv(

            io.BytesIO(contenido),

            sep=";",

            encoding="latin1",

            dtype=str,

            index_col=False,

        )



    except Exception as e:

        raise HTTPException(

            status_code=400,

            detail=(

                "No fue posible leer el archivo CSV: "

                f"{str(e)}"

            ),

        )



    # --------------------------------------------------------

    # VALIDAR COLUMNAS

    # --------------------------------------------------------



    columnas_requeridas = [

        "Tipo Doc",

        "Rut cliente",

        "Razon Social",

        "Folio",

        "Fecha Docto",

        "Monto total",

    ]



    columnas_faltantes = [

        columna

        for columna in columnas_requeridas

        if columna not in df.columns

    ]



    if columnas_faltantes:

        raise HTTPException(

            status_code=400,

            detail={

                "mensaje": (

                    "El archivo no tiene la estructura "

                    "esperada del RCV."

                ),

                "columnas_faltantes": columnas_faltantes,

                "columnas_detectadas": list(df.columns),

            },

        )



    # --------------------------------------------------------

    # IMPORTACIÓN TRANSACCIONAL

    # --------------------------------------------------------



    with SessionLocal() as db:



        try:



            # ------------------------------------------------

            # CREAR REGISTRO DE IMPORTACIÓN

            # ------------------------------------------------



            importacion = ImportacionSII(

                rut_empresa=rut_empresa,

                periodo=periodo,

                nombre_archivo=archivo.filename,

                hash_archivo=hash_archivo,

                cantidad_registros=0,

                estado="procesando",

            )



            db.add(importacion)

            db.flush()



            # ------------------------------------------------

            # CONTADORES

            # ------------------------------------------------



            documentos_importados = 0

            documentos_duplicados = 0

            documentos_invalidos = 0



            # ------------------------------------------------

            # PROCESAR CADA FILA

            # ------------------------------------------------



            for _, fila in df.iterrows():



                tipo_documento = convertir_entero(

                    fila.get("Tipo Doc")

                )



                rut_cliente = normalizar_rut(

                    fila.get("Rut cliente")

                )



                folio = convertir_entero(

                    fila.get("Folio")

                )



                fecha_documento = convertir_fecha(

                    fila.get("Fecha Docto")

                )



                monto_total = convertir_decimal(

                    fila.get("Monto total")

                )



                # --------------------------------------------

                # VALIDACIONES MÍNIMAS

                # --------------------------------------------



                if (

                    tipo_documento is None

                    or rut_cliente is None

                    or folio is None

                    or fecha_documento is None

                    or monto_total is None

                ):

                    documentos_invalidos += 1

                    continue



                # --------------------------------------------

                # BUSCAR DOCUMENTO EXISTENTE

                # --------------------------------------------



                documento_existente = db.scalar(

                    select(DocumentoTributario).where(

                        DocumentoTributario.rut_empresa

                        == rut_empresa,

                        DocumentoTributario.tipo_documento

                        == tipo_documento,

                        DocumentoTributario.folio

                        == folio,

                    )

                )



                if documento_existente:

                    documentos_duplicados += 1

                    continue



                # --------------------------------------------

                # CREAR DOCUMENTO

                # --------------------------------------------



                documento = DocumentoTributario(

                    importacion_sii_id=importacion.id,



                    rut_empresa=rut_empresa,



                    tipo_documento=tipo_documento,



                    tipo_venta=normalizar_texto(

                        fila.get("Tipo Venta")

                    ),



                    rut_cliente=rut_cliente,



                    razon_social=normalizar_texto(

                        fila.get("Razon Social")

                    ),



                    folio=folio,



                    fecha_documento=fecha_documento,



                    fecha_recepcion=convertir_fecha(

                        fila.get("Fecha Recepcion")

                    ),



                    monto_exento=convertir_decimal(

                        fila.get("Monto Exento")

                    ),



                    monto_neto=convertir_decimal(

                        fila.get("Monto Neto")

                    ),



                    monto_iva=convertir_decimal(

                        fila.get("Monto IVA")

                    ),



                    monto_total=monto_total,



                    tipo_documento_referencia=convertir_entero(

                        fila.get(

                            "Tipo Docto. Referencia"

                        )

                    ),



                    folio_documento_referencia=convertir_entero(

                        fila.get(

                            "Folio Docto. Referencia"

                        )

                    ),



                    numero_interno=normalizar_texto(

                        fila.get("Numero Interno")

                    ),



                    codigo_sucursal=normalizar_texto(
    fila.get("Codigo Sucursal")
),
saldo_pendiente=monto_total,
)



                db.add(documento)



                documentos_importados += 1



            # ------------------------------------------------

            # ACTUALIZAR IMPORTACIÓN

            # ------------------------------------------------



            importacion.cantidad_registros = (

                documentos_importados

            )



            importacion.estado = "importada"



            # ------------------------------------------------

            # CONFIRMAR TRANSACCIÓN

            # ------------------------------------------------



            db.commit()



            # ------------------------------------------------

            # RESPUESTA

            # ------------------------------------------------



            return {

                "mensaje": (

                    "Archivo SII importado correctamente."

                ),

                "duplicado_archivo": False,

                "importacion_id": importacion.id,

                "archivo": archivo.filename,

                "rut_empresa": rut_empresa,

                "periodo": periodo,

                "registros_archivo": len(df),

                "documentos_importados": (

                    documentos_importados

                ),

                "documentos_duplicados": (

                    documentos_duplicados

                ),

                "documentos_invalidos": (

                    documentos_invalidos

                ),

            }



        except Exception as e:



            # ------------------------------------------------

            # SI FALLA, NO DEJAMOS IMPORTACIÓN PARCIAL

            # ------------------------------------------------



            db.rollback()



            raise HTTPException(

                status_code=500,

                detail=(

                    "La importación fue cancelada porque "

                    "ocurrió un error durante el procesamiento: "

                    f"{str(e)}"

                ),

            )



            # ============================================================

# IMPORTACIÓN CARTOLA SANTANDER

# ============================================================



def validar_digito_verificador_rut(cuerpo: str, dv: str) -> bool:
    """Valida el dígito verificador de un RUT chileno."""
    if not cuerpo.isdigit():
        return False

    cuerpo = cuerpo.lstrip("0") or "0"
    factor = 2
    suma = 0

    for digito in reversed(cuerpo):
        suma += int(digito) * factor
        factor = 2 if factor == 7 else factor + 1

    resto = 11 - (suma % 11)

    if resto == 11:
        dv_calculado = "0"
    elif resto == 10:
        dv_calculado = "K"
    else:
        dv_calculado = str(resto)

    return dv_calculado == dv.upper()


def detectar_rut_en_texto(texto: str | None) -> str | None:
    """Detecta RUT chilenos dentro de descripciones bancarias Santander."""
    if not texto:
        return None

    texto = str(texto).upper().strip()
    patron = r"(?<!\d)(?:\d[\d.\- ]{6,12}[0-9K])(?!\d)"

    for coincidencia in re.finditer(patron, texto):
        candidato = coincidencia.group(0)
        compacto = re.sub(r"[^0-9K]", "", candidato)

        if len(compacto) < 8 or len(compacto) > 11:
            continue

        cuerpo = compacto[:-1]
        dv = compacto[-1]
        cuerpo_sin_ceros = cuerpo.lstrip("0")

        if not 7 <= len(cuerpo_sin_ceros) <= 8:
            continue

        if not validar_digito_verificador_rut(cuerpo, dv):
            continue

        return f"{cuerpo_sin_ceros}-{dv}"

    return None

@app.get("/api/pagos/pendientes")
def listar_abonos_pendientes_de_pago():
    with SessionLocal() as db:
        movimientos = db.scalars(
            select(MovimientoBancario)
            .where(MovimientoBancario.cargo_abono == "A")
            .order_by(
                MovimientoBancario.fecha_movimiento.desc(),
                MovimientoBancario.id.desc(),
            )
        ).all()

        pagos_existentes = {
            pago.movimiento_bancario_id
            for pago in db.scalars(select(Pago)).all()
        }

        return [
            {
                "movimiento_bancario_id": movimiento.id,
                "fecha_movimiento": movimiento.fecha_movimiento,
                "descripcion_original": movimiento.descripcion_original,
                "numero_documento": movimiento.numero_documento,
                "tipo_movimiento": movimiento.tipo_movimiento,
                "monto": movimiento.monto,
                "rut_pagador_detectado": movimiento.rut_pagador_detectado,
                "nombre_pagador_detectado": movimiento.nombre_pagador_detectado,
                "pago_creado": movimiento.id in pagos_existentes,
            }
            for movimiento in movimientos
        ]

@app.post("/api/pagos/crear-desde-abonos")
def crear_pagos_desde_abonos():
    with SessionLocal() as db:
        movimientos = db.scalars(
            select(MovimientoBancario)
            .where(MovimientoBancario.cargo_abono == "A")
            .order_by(
                MovimientoBancario.fecha_movimiento.asc(),
                MovimientoBancario.id.asc(),
            )
        ).all()

        creados = 0
        ya_existentes = 0

        for movimiento in movimientos:
            pago_existente = db.scalar(
                select(Pago).where(
                    Pago.movimiento_bancario_id == movimiento.id
                )
            )

            if pago_existente:
                ya_existentes += 1
                continue

            pago = Pago(
                movimiento_bancario_id=movimiento.id,
                cliente_id=None,
                pagador_id=None,
                fecha_pago=movimiento.fecha_movimiento,
                monto_pago=movimiento.monto,
                moneda="CLP",
                medio_pago=movimiento.tipo_movimiento,
                estado="pendiente",
                observaciones=None,
            )

            db.add(pago)
            creados += 1

        db.commit()

        return {
            "mensaje": "Pagos creados desde abonos bancarios.",
            "abonos_revisados": len(movimientos),
            "pagos_creados": creados,
            "pagos_ya_existentes": ya_existentes,
        }

@app.get("/api/pagos/{pago_id}/propuestas-conciliacion")
def proponer_conciliaciones(pago_id: int):
    with SessionLocal() as db:
        pago = db.get(Pago, pago_id)

        if not pago:
            raise HTTPException(
                status_code=404,
                detail="El pago indicado no existe.",
            )

        movimiento = db.get(
            MovimientoBancario,
            pago.movimiento_bancario_id,
        )

        if not movimiento:
            raise HTTPException(
                status_code=404,
                detail="No se encontró el movimiento bancario asociado.",
            )

        rut_pagador = movimiento.rut_pagador_detectado

        if not rut_pagador:
            return {
                "pago_id": pago.id,
                "mensaje": "El pago no tiene RUT de pagador detectado.",
                "tipo_revision": "MANUAL",
                "propuestas": [],
            }

        pagadores = db.scalars(
            select(Pagador).where(
                Pagador.rut_pagador == rut_pagador,
                Pagador.autorizado.is_(True),
            )
        ).all()

        if not pagadores:
            return {
                "pago_id": pago.id,
                "rut_pagador": rut_pagador,
                "mensaje": (
                    "El RUT del pagador no está asociado "
                    "a ningún cliente autorizado."
                ),
                "tipo_revision": "MANUAL",
                "propuestas": [],
            }

        clientes_ids = list(
            dict.fromkeys(
                pagador.cliente_id
                for pagador in pagadores
            )
        )

        clientes = {
            cliente.id: cliente
            for cliente in db.scalars(
                select(Cliente).where(
                    Cliente.id.in_(clientes_ids)
                )
            ).all()
        }

        propuestas = []

        for cliente_id in clientes_ids:
            cliente = clientes.get(cliente_id)

            if not cliente:
                continue

            documentos = db.scalars(
                select(DocumentoTributario)
                .where(
                    DocumentoTributario.rut_cliente == cliente.rut,
                    DocumentoTributario.saldo_pendiente > 0,
                )
                .order_by(
                    DocumentoTributario.fecha_documento.desc(),
                    DocumentoTributario.folio.desc(),
                )
            ).all()

            if not documentos:
                continue

            # Buscamos combinaciones de hasta 4 documentos.
            # La fecha NO es un filtro excluyente.
            limite_combinaciones = min(
                len(documentos),
                20,
            )

            documentos_para_busqueda = documentos[
                :limite_combinaciones
            ]

            candidatos = []

            for cantidad in range(1, 5):
                if cantidad > len(documentos_para_busqueda):
                    break

                for grupo in combinations(
                    documentos_para_busqueda,
                    cantidad,
                ):
                    total = sum(
                        Decimal(documento.saldo_pendiente)
                        for documento in grupo
                    )

                    diferencia = (
                        total
                        - Decimal(pago.monto_pago)
                    )

                    candidatos.append(
                        {
                            "documentos": grupo,
                            "total_aplicado": total,
                            "diferencia": diferencia,
                            "cantidad_documentos": cantidad,
                        }
                    )

            candidatos.sort(
                key=lambda candidato: (
                    abs(candidato["diferencia"]),
                    candidato["cantidad_documentos"],
                )
            )

            # Contamos cuántas combinaciones exactas existen.
            cantidad_exactas = sum(
                1
                for candidato in candidatos
                if candidato["diferencia"] == 0
            )

            for candidato in candidatos[:10]:
                diferencia = candidato["diferencia"]

                if diferencia == 0:
                    if cantidad_exactas == 1:
                        nivel = "ALTA"
                        motivo = (
                            "Coincidencia exacta de monto."
                        )
                    else:
                        nivel = "ALTA_AMBIGUA"
                        motivo = (
                            f"Coincidencia exacta de monto, "
                            f"pero existen {cantidad_exactas} "
                            "combinaciones exactas posibles. "
                            "Requiere revisión manual."
                        )

                elif abs(diferencia) <= Decimal("1000"):
                    nivel = "MEDIA"
                    motivo = (
                        "Monto muy cercano; requiere revisión."
                    )

                else:
                    nivel = "BAJA"
                    motivo = (
                        "Existe diferencia de monto; "
                        "requiere revisión."
                    )

                propuestas.append(
                    {
                        "cliente_id": cliente.id,
                        "cliente_rut": cliente.rut,
                        "cliente_razon_social": cliente.razon_social,
                        "nivel": nivel,
                        "motivo": motivo,
                        "monto_pago": pago.monto_pago,
                        "total_documentos": candidato[
                            "total_aplicado"
                        ],
                        "diferencia": diferencia,
                        "documentos": [
                            {
                                "id": documento.id,
                                "folio": documento.folio,
                                "fecha_documento": documento.fecha_documento,
                                "monto_total": documento.monto_total,
                                "saldo_pendiente": documento.saldo_pendiente,
                            }
                            for documento in candidato[
                                "documentos"
                            ]
                        ],
                    }
                )

        propuestas.sort(
            key=lambda propuesta: (
                abs(Decimal(propuesta["diferencia"])),
                len(propuesta["documentos"]),
            )
        )

        return {
            "pago_id": pago.id,
            "fecha_pago": pago.fecha_pago,
            "monto_pago": pago.monto_pago,
            "movimiento_bancario_id": movimiento.id,
            "rut_pagador": rut_pagador,
            "nombre_pagador": movimiento.nombre_pagador_detectado,
            "tipo_revision": "PROPUESTA",
            "propuestas": propuestas[:20],
        }

@app.get("/api/movimientos-bancarios")
def listar_movimientos_bancarios(solo_sin_rut: bool = False):
    with SessionLocal() as db:
        query = select(MovimientoBancario).order_by(
            MovimientoBancario.fecha_movimiento.desc(),
            MovimientoBancario.id.desc(),
        )

        if solo_sin_rut:
            query = query.where(
                MovimientoBancario.rut_pagador_detectado.is_(None)
            )

        movimientos = db.scalars(query).all()

        return [
            {
                "id": m.id,
                "fecha_movimiento": m.fecha_movimiento,
                "descripcion_original": m.descripcion_original,
                "numero_documento": m.numero_documento,
                "sucursal": m.sucursal,
                "tipo_movimiento": m.tipo_movimiento,
                "monto": m.monto,
                "cargo_abono": m.cargo_abono,
                "monto_abono": m.monto_abono,
                "monto_cargo": m.monto_cargo,
                "rut_pagador_detectado": m.rut_pagador_detectado,
                "nombre_pagador_detectado": m.nombre_pagador_detectado,
            }
            for m in movimientos
        ]

@app.post("/api/movimientos-bancarios/importar-santander")

async def importar_cartola_santander(

    archivo: UploadFile = File(...),

    cuenta_bancaria_gh_id: int = Form(...),

):

    """

    Importa una cartola histórica Santander en formato XLSX.



    Primera etapa:

    - Lee los movimientos de la hoja "Detalle movimientos".

    - Guarda cargos y abonos.

    - Detecta RUT dentro de la descripción.

    - No realiza conciliación automática.

    """



    if not archivo.filename:

        raise HTTPException(

            status_code=400,

            detail="No se recibió ningún archivo.",

        )



    nombre_archivo = archivo.filename



    if not nombre_archivo.lower().endswith(".xlsx"):

        raise HTTPException(

            status_code=400,

            detail="La cartola Santander debe estar en formato .xlsx.",

        )



    contenido = await archivo.read()



    if not contenido:

        raise HTTPException(

            status_code=400,

            detail="El archivo está vacío.",

        )



    # --------------------------------------------------------

    # LEER ARCHIVO SANTANDER

    # --------------------------------------------------------



    try:

        excel = pd.ExcelFile(io.BytesIO(contenido), engine="openpyxl")



        if "Cartola Historica CtaCte" not in excel.sheet_names:

            raise HTTPException(

                status_code=400,

                detail={

                    "mensaje": (

                        "La cartola Santander no contiene la hoja 'Cartola Historica CtaCte'."

                    ),

                    "hojas_detectadas": excel.sheet_names,

                },

            )



        df = pd.read_excel(

            io.BytesIO(contenido),

            sheet_name="Cartola Historica CtaCte",

            header=None,

            engine="openpyxl",

        )



    except HTTPException:

        raise



    except Exception as e:

        raise HTTPException(

            status_code=400,

            detail=f"No fue posible leer la cartola Santander: {str(e)}",

        )



    # --------------------------------------------------------

    # BUSCAR FILA DE ENCABEZADOS

    # --------------------------------------------------------



    fila_encabezado = None



    for indice, fila in df.iterrows():

        valores = [

            str(valor).strip().upper()

            for valor in fila.tolist()

            if pd.notna(valor)

        ]



        if (

            "MONTO" in valores

            and "FECHA" in valores

            and "CARGO/ABONO" in valores

        ):

            fila_encabezado = indice

            break



    if fila_encabezado is None:

        raise HTTPException(

            status_code=400,

            detail=(

                "No se encontró la estructura esperada "

                "de movimientos Santander."

            ),

        )



    # --------------------------------------------------------

    # RELEER USANDO EL ENCABEZADO ENCONTRADO

    # --------------------------------------------------------



    df_movimientos = pd.read_excel(

        io.BytesIO(contenido),

        sheet_name="Cartola Historica CtaCte",

        header=fila_encabezado,

        engine="openpyxl",

    )



    # Normalizar nombres de columnas

    df_movimientos.columns = [

        str(columna).strip()

        for columna in df_movimientos.columns

    ]



    columnas_requeridas = [

        "MONTO",

        "DESCRIPCIÓN MOVIMIENTO",

        "FECHA",

        "N° DOCUMENTO",

        "SUCURSAL",

        "CARGO/ABONO",

    ]



    columnas_faltantes = [

        columna

        for columna in columnas_requeridas

        if columna not in df_movimientos.columns

    ]



    if columnas_faltantes:

        raise HTTPException(

            status_code=400,

            detail={

                "mensaje": (

                    "La cartola Santander no tiene "

                    "todas las columnas esperadas."

                ),

                "columnas_faltantes": columnas_faltantes,

                "columnas_detectadas": list(df_movimientos.columns),

            },

        )



    # --------------------------------------------------------

    # FILTRAR FILAS REALES DE MOVIMIENTOS

    # --------------------------------------------------------



    df_movimientos = df_movimientos[

        df_movimientos["FECHA"].notna()

        & df_movimientos["MONTO"].notna()

        & df_movimientos["CARGO/ABONO"].notna()

    ].copy()



    if df_movimientos.empty:

        raise HTTPException(

            status_code=400,

            detail="No se encontraron movimientos bancarios en la cartola.",

        )



    # --------------------------------------------------------

    # CONECTAR A BASE DE DATOS

    # --------------------------------------------------------



    with SessionLocal() as db:

        try:

            cuenta = db.get(

                CuentaBancariaGH,

                cuenta_bancaria_gh_id,

            )



            if cuenta is None:

                raise HTTPException(

                    status_code=404,

                    detail=(

                        "No existe la cuenta bancaria GH indicada."

                    ),

                )



            # ------------------------------------------------

            # CREAR IMPORTACIÓN

            # ------------------------------------------------



            importacion = ImportacionBancaria(

                cuenta_bancaria_gh_id=cuenta_bancaria_gh_id,

                nombre_archivo=nombre_archivo,

                fecha_desde=None,

                fecha_hasta=None,

                cantidad_registros=0,

                estado="procesando",

            )



            db.add(importacion)

            db.flush()



            cantidad_importados = 0

            cantidad_rut_detectado = 0

            cantidad_revision = 0



            fechas = []



            # ------------------------------------------------

            # PROCESAR MOVIMIENTOS

            # ------------------------------------------------



            for _, fila in df_movimientos.iterrows():



                try:

                    fecha_valor = fila["FECHA"]



                    fecha = pd.to_datetime(

                        fecha_valor,

                        dayfirst=True,

                        errors="coerce",

                    )



                    if pd.isna(fecha):

                        continue



                    fecha = fecha.date()



                    monto_valor = fila["MONTO"]



                    if isinstance(monto_valor, str):

                        monto_limpio = (

                            monto_valor

                            .replace(".", "")

                            .replace(",", ".")

                            .replace("$", "")

                            .strip()

                        )

                    else:

                        monto_limpio = monto_valor



                    monto = Decimal(str(monto_limpio))



                    descripcion = str(

                        fila["DESCRIPCIÓN MOVIMIENTO"]

                    ).strip()



                    if descripcion == "nan":

                        descripcion = ""



                    numero_documento = str(

                        fila["N° DOCUMENTO"]

                    ).strip()



                    if numero_documento == "nan":

                        numero_documento = None



                    sucursal = str(

                        fila["SUCURSAL"]

                    ).strip()



                    if sucursal == "nan":

                        sucursal = None



                    cargo_abono = str(

                        fila["CARGO/ABONO"]

                    ).strip().upper()



                    # ------------------------------------------------

                    # DETECTAR RUT

                    # ------------------------------------------------



                    rut_detectado = detectar_rut_en_texto(

                        descripcion

                    )



                    if rut_detectado:

                        cantidad_rut_detectado += 1

                    else:

                        cantidad_revision += 1



                    # ------------------------------------------------

                    # MONTOS CARGO / ABONO

                    # ------------------------------------------------



                    monto_abono = None

                    monto_cargo = None



                    if cargo_abono == "A":

                        monto_abono = abs(monto)



                    elif cargo_abono == "C":

                        monto_cargo = abs(monto)



                    # ------------------------------------------------

                    # TIPO MOVIMIENTO

                    # ------------------------------------------------



                    if cargo_abono == "A":

                        tipo_movimiento = "ABONO"

                    elif cargo_abono == "C":

                        tipo_movimiento = "CARGO"

                    else:

                        tipo_movimiento = cargo_abono



                    movimiento = MovimientoBancario(

                        importacion_bancaria_id=importacion.id,

                        fecha_movimiento=fecha,

                        descripcion_original=descripcion,

                        numero_documento=numero_documento,

                        sucursal=sucursal,

                        tipo_movimiento=tipo_movimiento,

                        monto=monto,

                        cargo_abono=cargo_abono,

                        monto_abono=monto_abono,

                        monto_cargo=monto_cargo,

                        saldo_diario=None,

                        rut_pagador_detectado=rut_detectado,

                        nombre_pagador_detectado=None,

                    )



                    db.add(movimiento)



                    fechas.append(fecha)

                    cantidad_importados += 1



                except Exception:

                    # Una fila inválida no debe guardar datos

                    # incompletos. Se ignora por ahora.

                    continue



            if cantidad_importados == 0:

                db.rollback()



                raise HTTPException(

                    status_code=400,

                    detail=(

                        "No se pudo importar ningún movimiento "

                        "válido de la cartola."

                    ),

                )



            # ------------------------------------------------

            # ACTUALIZAR IMPORTACIÓN

            # ------------------------------------------------



            importacion.cantidad_registros = cantidad_importados

            importacion.estado = "importada"



            if fechas:

                importacion.fecha_desde = min(fechas)

                importacion.fecha_hasta = max(fechas)



            db.commit()



            return {

                "mensaje": "Cartola Santander importada correctamente.",

                "importacion_id": importacion.id,

                "archivo": nombre_archivo,

                "cuenta_bancaria_gh_id": cuenta_bancaria_gh_id,

                "movimientos_importados": cantidad_importados,

                "rut_detectados": cantidad_rut_detectado,

                "requieren_revision": cantidad_revision,

                "fecha_desde": (

                    min(fechas).isoformat()

                    if fechas

                    else None

                ),

                "fecha_hasta": (

                    max(fechas).isoformat()

                    if fechas

                    else None

                ),

            }



        except HTTPException:

            raise



        except Exception as e:

            db.rollback()



            raise HTTPException(

                status_code=500,

                detail=(

                    "Ocurrió un error al importar la cartola Santander: "

                    f"{str(e)}"

                ),

            )

# ============================================================
# REPROCESAR RUT DE MOVIMIENTOS BANCARIOS
# ============================================================

@app.post("/api/movimientos-bancarios/reprocesar-rut")
def reprocesar_rut_movimientos_bancarios(
    importacion_bancaria_id: int | None = None,
):
    """Reprocesa las descripciones de movimientos ya importados."""
    with SessionLocal() as db:
        try:
            stmt = select(MovimientoBancario).where(
                MovimientoBancario.rut_pagador_detectado.is_(None)
            )

            if importacion_bancaria_id is not None:
                stmt = stmt.where(
                    MovimientoBancario.importacion_bancaria_id
                    == importacion_bancaria_id
                )

            movimientos = db.scalars(stmt).all()
            revisados = 0
            rut_detectados = 0

            for movimiento in movimientos:
                revisados += 1
                rut_detectado = detectar_rut_en_texto(
                    movimiento.descripcion_original
                )

                if rut_detectado:
                    movimiento.rut_pagador_detectado = rut_detectado
                    rut_detectados += 1

            db.commit()

            return {
                "mensaje": "RUT de movimientos reprocesados correctamente.",
                "importacion_bancaria_id": importacion_bancaria_id,
                "movimientos_revisados": revisados,
                "rut_detectados": rut_detectados,
                "requieren_revision": revisados - rut_detectados,
            }

        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=500,
                detail=(
                    "Ocurrió un error al reprocesar los RUT: "
                    f"{str(e)}"
                ),
            )

# ============================================================
# EVALUACIONES DE CRÉDITO
# ============================================================

@app.post(
    "/api/evaluaciones-credito",
    response_model=EvaluacionCreditoRespuesta,
)
def crear_evaluacion_credito(
    datos: EvaluacionCreditoCrear,
):
    """Crea una nueva evaluación de crédito para un cliente."""
    with SessionLocal() as db:
        try:
            cliente = db.get(Cliente, datos.cliente_id)

            if cliente is None:
                raise HTTPException(
                    status_code=404,
                    detail="El cliente indicado no existe.",
                )

            evaluacion = EvaluacionCredito(
                cliente_id=datos.cliente_id,
                fecha_solicitud=(
                    datos.fecha_solicitud
                    if datos.fecha_solicitud is not None
                    else date.today()
                ),
                estado="PENDIENTE",
                resultado="PENDIENTE",
                trayectoria_cumplida=datos.trayectoria_cumplida,
                tipo_trayectoria=datos.tipo_trayectoria,
                cantidad_operaciones_trayectoria=(
                    datos.cantidad_operaciones_trayectoria
                ),
                fecha_validacion_trayectoria=(
                    datos.fecha_validacion_trayectoria
                ),
                usuario_validacion_trayectoria_id=(
                    datos.usuario_validacion_trayectoria_id
                ),
                observacion_trayectoria=(
                    datos.observacion_trayectoria
                ),
                monto_solicitado=datos.monto_solicitado,
                dias_credito_solicitados=(
                    datos.dias_credito_solicitados
                ),
                observaciones=datos.observaciones,
            )

            db.add(evaluacion)
            db.commit()
            db.refresh(evaluacion)

            return evaluacion

        except HTTPException:
            raise

        except Exception as e:
            db.rollback()

            raise HTTPException(
                status_code=500,
                detail=(
                    "Ocurrió un error al crear la evaluación de crédito: "
                    f"{str(e)}"
                ),
            )
@app.get(
    "/api/evaluaciones-credito",
    response_model=list[EvaluacionCreditoRespuesta],
)
def listar_evaluaciones_credito(
    cliente_id: int | None = None,
):
    """Lista las evaluaciones de crédito, opcionalmente filtradas por cliente."""
    with SessionLocal() as db:
        try:
            stmt = select(EvaluacionCredito).order_by(
                EvaluacionCredito.id.desc()
            )

            if cliente_id is not None:
                stmt = stmt.where(
                    EvaluacionCredito.cliente_id == cliente_id
                )

            evaluaciones = db.scalars(stmt).all()

            return evaluaciones

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=(
                    "Ocurrió un error al listar las evaluaciones de crédito: "
                    f"{str(e)}"
                ),
            )            
@app.post(
    "/api/evaluaciones-credito/{evaluacion_id}/decision",
    response_model=EvaluacionCreditoRespuesta,
)
def decidir_evaluacion_credito(
    evaluacion_id: int,
    datos: DecisionCredito,
):
    """Registra la decisión de Gerencia sobre una evaluación de crédito."""

    RESULTADOS_PERMITIDOS = {
        "APROBADO",
        "APROBADO_CONDICIONES",
        "RECHAZADO",
        "PENDIENTE",
    }

    resultado = datos.resultado.strip().upper()

    if resultado not in RESULTADOS_PERMITIDOS:
        raise HTTPException(
            status_code=400,
            detail=(
                "Resultado de decisión no permitido. "
                "Resultados válidos: "
                + ", ".join(sorted(RESULTADOS_PERMITIDOS))
            ),
        )

    with SessionLocal() as db:
        evaluacion = db.get(EvaluacionCredito, evaluacion_id)

        if evaluacion is None:
            raise HTTPException(
                status_code=404,
                detail="La evaluación de crédito no existe.",
            )

        # --------------------------------------------------------
        # VOLVER A PENDIENTE
        # --------------------------------------------------------

        if resultado == "PENDIENTE":
            evaluacion.resultado = "PENDIENTE"
            evaluacion.estado = "PENDIENTE"
            evaluacion.monto_aprobado = None
            evaluacion.dias_credito_aprobados = None
            evaluacion.fecha_decision = None
            evaluacion.usuario_decision_id = None
            evaluacion.observaciones = datos.observaciones

            db.commit()
            db.refresh(evaluacion)

            return evaluacion

        # --------------------------------------------------------
        # VALIDACIONES PARA APROBACIONES
        # --------------------------------------------------------

        if resultado in {"APROBADO", "APROBADO_CONDICIONES"}:

            if datos.monto_aprobado is None:
                raise HTTPException(
                    status_code=400,
                    detail="Debe indicar el monto aprobado.",
                )

            if datos.monto_aprobado <= 0:
                raise HTTPException(
                    status_code=400,
                    detail="El monto aprobado debe ser mayor que cero.",
                )

            if datos.dias_credito_aprobados is None:
                raise HTTPException(
                    status_code=400,
                    detail="Debe indicar los días de crédito aprobados.",
                )

            if datos.dias_credito_aprobados < 0:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Los días de crédito aprobados "
                        "no pueden ser negativos."
                    ),
                )

            # La trayectoria comercial debe estar validada.
            if not evaluacion.trayectoria_cumplida:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "No se puede aprobar el crédito porque "
                        "la trayectoria comercial todavía no está validada."
                    ),
                )

            # ----------------------------------------------------
            # DOCUMENTACIÓN OBLIGATORIA
            # ----------------------------------------------------

            TIPOS_DOCUMENTOS_REQUERIDOS = [
                "ESCRITURA_CONSTITUCION",
                "CEDULA_DUENOS",
                "DICOM",
                "CERTIFICADO_NO_DEUDA_TGR",
                "CARPETA_TRIBUTARIA_SII",
            ]

            documentos = (
                db.execute(
                    select(DocumentoCredito)
                    .where(
                        DocumentoCredito.evaluacion_credito_id
                        == evaluacion_id
                    )
                    .order_by(DocumentoCredito.id.desc())
                )
                .scalars()
                .all()
            )

            documentos_por_tipo = {}

            for documento in documentos:
                if documento.tipo_documento not in documentos_por_tipo:
                    documentos_por_tipo[documento.tipo_documento] = documento

            faltantes = [
                tipo
                for tipo in TIPOS_DOCUMENTOS_REQUERIDOS
                if tipo not in documentos_por_tipo
            ]

            if faltantes:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "No se puede aprobar el crédito porque faltan "
                        "documentos obligatorios: "
                        + ", ".join(faltantes)
                    ),
                )

            no_aprobados = [
                documento.tipo_documento
                for documento in documentos_por_tipo.values()
                if (
                    documento.tipo_documento
                    in TIPOS_DOCUMENTOS_REQUERIDOS
                    and documento.estado_revision != "APROBADO"
                )
            ]

            if no_aprobados:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "No se puede aprobar el crédito porque existen "
                        "documentos obligatorios que no están aprobados: "
                        + ", ".join(no_aprobados)
                    ),
                )

        # --------------------------------------------------------
        # REGISTRAR DECISIÓN
        # --------------------------------------------------------

        evaluacion.resultado = resultado
        evaluacion.estado = resultado

        if resultado == "RECHAZADO":
            evaluacion.monto_aprobado = None
            evaluacion.dias_credito_aprobados = None

        else:
            evaluacion.monto_aprobado = datos.monto_aprobado
            evaluacion.dias_credito_aprobados = (
                datos.dias_credito_aprobados
            )

        evaluacion.fecha_decision = date.today()
        evaluacion.observaciones = datos.observaciones

        # --------------------------------------------------------
        # CREAR / ACTUALIZAR CRÉDITO VIGENTE
        # --------------------------------------------------------
        #
        # Solo APROBADO genera crédito operativo.
        #
        # APROBADO_CONDICIONES queda registrado como decisión,
        # pero todavía no activa automáticamente el crédito.
        #

        if resultado == "APROBADO":

            credito = (
                db.execute(
                    select(CreditoCliente)
                    .where(
                        CreditoCliente.cliente_id
                        == evaluacion.cliente_id,
                        CreditoCliente.activo.is_(True),
                    )
                    .order_by(CreditoCliente.id.desc())
                )
                .scalars()
                .first()
            )

            if credito is None:
                credito = CreditoCliente(
                    cliente_id=evaluacion.cliente_id,
                    dias_credito=evaluacion.dias_credito_aprobados,
                    limite_credito=evaluacion.monto_aprobado,
                    fecha_inicio=date.today(),
                    fecha_revision=None,
                    activo=True,
                    observaciones=(
                        f"Crédito aprobado mediante evaluación "
                        f"#{evaluacion.id}."
                    ),
                )

                db.add(credito)

            else:
                credito.dias_credito = (
                    evaluacion.dias_credito_aprobados
                )
                credito.limite_credito = (
                    evaluacion.monto_aprobado
                )
                credito.fecha_inicio = date.today()
                credito.activo = True
                credito.observaciones = (
                    f"Crédito actualizado mediante evaluación "
                    f"#{evaluacion.id}."
                )

        # --------------------------------------------------------
        # RECHAZADO
        # --------------------------------------------------------
        #
        # Una evaluación rechazada no crea un crédito.
        # Tampoco modificamos automáticamente un crédito anterior,
        # porque eso requiere una decisión de negocio explícita.
        #

        db.commit()
        db.refresh(evaluacion)

        return evaluacion
@app.post(
    "/api/evaluaciones-credito/{evaluacion_id}/documentos",
    response_model=DocumentoCreditoRespuesta,
)
async def subir_documento_credito(
    evaluacion_id: int,
    tipo_documento: str = Form(...),
    archivo: UploadFile = File(...),
    fecha_documento: date | None = Form(None),
    fecha_vencimiento: date | None = Form(None),
    observaciones: str | None = Form(None),
):
    """Sube y registra un documento asociado a una evaluación de crédito."""

    TIPOS_DOCUMENTO_PERMITIDOS = {
        "ESCRITURA_CONSTITUCION",
        "CEDULA_DUENOS",
        "DICOM",
        "CERTIFICADO_NO_DEUDA_TGR",
        "CARPETA_TRIBUTARIA_SII",
    }

    MAX_TAMANO_BYTES = 10 * 1024 * 1024  # 10 MB

    with SessionLocal() as db:
        try:
            # 1. Verificar que la evaluación exista
            evaluacion = db.get(EvaluacionCredito, evaluacion_id)

            if evaluacion is None:
                raise HTTPException(
                    status_code=404,
                    detail="La evaluación de crédito no existe.",
                )

            # 2. Validar tipo de documento
            tipo_documento = tipo_documento.strip().upper()

            if tipo_documento not in TIPOS_DOCUMENTO_PERMITIDOS:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Tipo de documento no permitido. "
                        "Tipos válidos: "
                        + ", ".join(sorted(TIPOS_DOCUMENTO_PERMITIDOS))
                    ),
                )

            # 3. Validar nombre del archivo
            nombre_original = Path(archivo.filename or "").name

            if not nombre_original:
                raise HTTPException(
                    status_code=400,
                    detail="El archivo no tiene un nombre válido.",
                )

            # 4. Leer archivo
            contenido = await archivo.read()

            if not contenido:
                raise HTTPException(
                    status_code=400,
                    detail="El archivo está vacío.",
                )

            # 5. Validar tamaño
            if len(contenido) > MAX_TAMANO_BYTES:
                raise HTTPException(
                    status_code=400,
                    detail="El archivo supera el tamaño máximo permitido de 10 MB.",
                )

            # 6. Calcular hash SHA-256
            hash_archivo = hashlib.sha256(contenido).hexdigest()
                        # 6.1. Verificar si el mismo archivo ya fue cargado
            documento_existente = db.scalars(
                select(DocumentoCredito)
                .where(
                    DocumentoCredito.evaluacion_credito_id == evaluacion_id,
                    DocumentoCredito.hash_archivo == hash_archivo,
                )
            ).first()

            if documento_existente is not None:
                raise HTTPException(
                    status_code=409,
                    detail=(
                        "Este archivo ya fue cargado en esta evaluación. "
                        f"Documento existente ID: {documento_existente.id}."
                    ),
                )
            # 7. Crear carpeta específica de la evaluación
            carpeta_base = Path("uploads") / "creditos" / str(evaluacion_id)
            carpeta_base.mkdir(parents=True, exist_ok=True)

            # 8. Crear nombre físico seguro
            extension = Path(nombre_original).suffix.lower()

            nombre_fisico = (
                f"{tipo_documento}_{hash_archivo[:16]}{extension}"
            )

            ruta_archivo = carpeta_base / nombre_fisico

            # 9. Guardar archivo
            ruta_archivo.write_bytes(contenido)

            # 10. Registrar documento en base de datos
            documento = DocumentoCredito(
                evaluacion_credito_id=evaluacion_id,
                tipo_documento=tipo_documento,
                nombre_archivo=nombre_original,
                ruta_archivo=str(ruta_archivo),
                tipo_mime=archivo.content_type,
                tamano_bytes=len(contenido),
                hash_archivo=hash_archivo,
                fecha_documento=fecha_documento,
                fecha_vencimiento=fecha_vencimiento,
                estado_revision="RECIBIDO",
                observaciones=observaciones,
            )

            db.add(documento)
            db.commit()
            db.refresh(documento)

            return documento

        except HTTPException:
            raise

        except Exception as e:
            db.rollback()

            # Si ocurrió un error después de guardar el archivo,
            # intentamos eliminarlo para no dejar archivos huérfanos.
            try:
                if "ruta_archivo" in locals() and ruta_archivo.exists():
                    ruta_archivo.unlink()
            except Exception:
                pass

            raise HTTPException(
                status_code=500,
                detail=f"Ocurrió un error al subir el documento: {str(e)}",
            )

    """Lista los documentos asociados a una evaluación de crédito."""
    with SessionLocal() as db:
        try:
            evaluacion = db.get(
                EvaluacionCredito,
                evaluacion_id,
            )

            if evaluacion is None:
                raise HTTPException(
                    status_code=404,
                    detail="La evaluación de crédito no existe.",
                )

            stmt = (
                select(DocumentoCredito)
                .where(
                    DocumentoCredito.evaluacion_credito_id
                    == evaluacion_id
                )
                .order_by(DocumentoCredito.id.asc())
            )

            documentos = db.scalars(stmt).all()

            return documentos

        except HTTPException:
            raise

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=(
                    "Ocurrió un error al listar los documentos "
                    "de crédito: "
                    f"{str(e)}"
                ),
            )            
@app.get(
    "/api/evaluaciones-credito/{evaluacion_id}/documentacion",
    response_model=DocumentacionCreditoRespuesta,
)
def obtener_documentacion_credito(evaluacion_id: int):
    """Obtiene el estado de la documentación requerida para una evaluación de crédito."""

    DOCUMENTOS_REQUERIDOS = [
        "ESCRITURA_CONSTITUCION",
        "CEDULA_DUENOS",
        "DICOM",
        "CERTIFICADO_NO_DEUDA_TGR",
        "CARPETA_TRIBUTARIA_SII",
    ]

    with SessionLocal() as db:
        evaluacion = db.get(EvaluacionCredito, evaluacion_id)

        if evaluacion is None:
            raise HTTPException(
                status_code=404,
                detail="La evaluación de crédito no existe.",
            )

        documentos = db.scalars(
            select(DocumentoCredito)
            .where(
                DocumentoCredito.evaluacion_credito_id == evaluacion_id
            )
            .order_by(DocumentoCredito.id.desc())
        ).all()

        documentos_por_tipo = {}

        for documento in documentos:
            if documento.tipo_documento not in documentos_por_tipo:
                documentos_por_tipo[documento.tipo_documento] = documento

        estados = []

        for tipo_documento in DOCUMENTOS_REQUERIDOS:
            documento = documentos_por_tipo.get(tipo_documento)

            estados.append(
                {
                    "tipo_documento": tipo_documento,
                    "requerido": True,
                    "presente": documento is not None,
                    "estado_revision": (
                        documento.estado_revision
                        if documento is not None
                        else None
                    ),
                    "documento_id": (
                        documento.id
                        if documento is not None
                        else None
                    ),
                }
            )

        documentos_presentes = sum(
            1 for estado in estados if estado["presente"]
        )

        documentos_requeridos = len(DOCUMENTOS_REQUERIDOS)
        documentos_faltantes = (
            documentos_requeridos - documentos_presentes
        )

        return {
            "evaluacion_credito_id": evaluacion_id,
            "documentos_requeridos": documentos_requeridos,
            "documentos_presentes": documentos_presentes,
            "documentos_faltantes": documentos_faltantes,
            "documentacion_completa": documentos_faltantes == 0,
            "estados": estados,
        }     
class RevisarDocumentoCredito(BaseModel):
    estado_revision: str
    observaciones: str | None = None
    usuario_revision_id: int | None = None


@app.patch(
    "/api/evaluaciones-credito/{evaluacion_id}/documentos/{documento_id}/revision",
    response_model=DocumentoCreditoRespuesta,
)
def revisar_documento_credito(
    evaluacion_id: int,
    documento_id: int,
    datos: RevisarDocumentoCredito,
):
    """Actualiza el estado de revisión de un documento de crédito."""

    ESTADOS_PERMITIDOS = {
        "RECIBIDO",
        "EN_REVISION",
        "APROBADO",
        "OBSERVADO",
        "RECHAZADO",
        "VENCIDO",
    }

    estado = datos.estado_revision.strip().upper()

    if estado not in ESTADOS_PERMITIDOS:
        raise HTTPException(
            status_code=400,
            detail=(
                "Estado de revisión no permitido. "
                "Estados válidos: "
                + ", ".join(sorted(ESTADOS_PERMITIDOS))
            ),
        )

    with SessionLocal() as db:
        documento = db.get(DocumentoCredito, documento_id)

        if documento is None:
            raise HTTPException(
                status_code=404,
                detail="El documento de crédito no existe.",
            )

        if documento.evaluacion_credito_id != evaluacion_id:
            raise HTTPException(
                status_code=400,
                detail="El documento no pertenece a la evaluación indicada.",
            )

        documento.estado_revision = estado
        documento.observaciones = datos.observaciones

        if datos.usuario_revision_id is not None:
            usuario = db.get(Usuario, datos.usuario_revision_id)

            if usuario is None:
                raise HTTPException(
                    status_code=404,
                    detail="El usuario de revisión no existe.",
                )

            documento.usuario_revision_id = datos.usuario_revision_id

        documento.fecha_revision = datetime.utcnow()

        db.commit()
        db.refresh(documento)

        return documento     

      


@app.post(
    "/api/evaluaciones-credito/{evaluacion_id}/decision",
    response_model=EvaluacionCreditoRespuesta,
)
def decidir_evaluacion_credito(
    evaluacion_id: int,
    datos: DecisionCredito,
):
    """Registra la decisión de Gerencia sobre una evaluación de crédito."""

    RESULTADOS_PERMITIDOS = {
        "APROBADO",
        "APROBADO_CONDICIONES",
        "RECHAZADO",
        "PENDIENTE",
    }

    resultado = datos.resultado.strip().upper()

    if resultado not in RESULTADOS_PERMITIDOS:
        raise HTTPException(
            status_code=400,
            detail=(
                "Resultado de decisión no permitido. "
                "Resultados válidos: "
                + ", ".join(sorted(RESULTADOS_PERMITIDOS))
            ),
        )

    with SessionLocal() as db:
        evaluacion = db.get(EvaluacionCredito, evaluacion_id)

        if evaluacion is None:
            raise HTTPException(
                status_code=404,
                detail="La evaluación de crédito no existe.",
            )

        # Si se mantiene pendiente, no se requiere completar
        # documentación ni trayectoria.
        if resultado == "PENDIENTE":
            evaluacion.resultado = "PENDIENTE"
            evaluacion.estado = "PENDIENTE"
            evaluacion.monto_aprobado = None
            evaluacion.dias_credito_aprobados = None
            evaluacion.fecha_decision = None
            evaluacion.usuario_decision_id = None
            evaluacion.observaciones = datos.observaciones

            db.commit()
            db.refresh(evaluacion)

            return evaluacion

        # Una decisión de aprobación requiere monto y plazo.
        if resultado in {"APROBADO", "APROBADO_CONDICIONES"}:
            if datos.monto_aprobado is None:
                raise HTTPException(
                    status_code=400,
                    detail="Debe indicar el monto aprobado.",
                )

            if datos.monto_aprobado <= 0:
                raise HTTPException(
                    status_code=400,
                    detail="El monto aprobado debe ser mayor que cero.",
                )

            if datos.dias_credito_aprobados is None:
                raise HTTPException(
                    status_code=400,
                    detail="Debe indicar los días de crédito aprobados.",
                )

            if datos.dias_credito_aprobados < 0:
                raise HTTPException(
                    status_code=400,
                    detail="Los días de crédito aprobados no pueden ser negativos.",
                )

            # La trayectoria comercial debe estar validada
            # antes de aprobar el crédito.
            if not evaluacion.trayectoria_cumplida:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "No se puede aprobar el crédito porque "
                        "la trayectoria comercial todavía no está validada."
                    ),
                )

            # Obtener el último documento registrado de cada tipo.
            TIPOS_DOCUMENTOS_REQUERIDOS = [
                "ESCRITURA_CONSTITUCION",
                "CEDULA_DUENOS",
                "DICOM",
                "CERTIFICADO_NO_DEUDA_TGR",
                "CARPETA_TRIBUTARIA_SII",
            ]

            documentos = (
                db.execute(
                    select(DocumentoCredito)
                    .where(
                        DocumentoCredito.evaluacion_credito_id
                        == evaluacion_id
                    )
                    .order_by(DocumentoCredito.id.desc())
                )
                .scalars()
                .all()
            )

            documentos_por_tipo = {}

            for documento in documentos:
                if documento.tipo_documento not in documentos_por_tipo:
                    documentos_por_tipo[documento.tipo_documento] = documento

            faltantes = [
                tipo
                for tipo in TIPOS_DOCUMENTOS_REQUERIDOS
                if tipo not in documentos_por_tipo
            ]

            if faltantes:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "No se puede aprobar el crédito porque faltan "
                        "documentos obligatorios: "
                        + ", ".join(faltantes)
                    ),
                )

            no_aprobados = [
                documento.tipo_documento
                for documento in documentos_por_tipo.values()
                if documento.tipo_documento in TIPOS_DOCUMENTOS_REQUERIDOS
                and documento.estado_revision != "APROBADO"
            ]

            if no_aprobados:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "No se puede aprobar el crédito porque existen "
                        "documentos obligatorios que no están aprobados: "
                        + ", ".join(no_aprobados)
                    ),
                )

        # Una decisión RECHAZADO no requiere que el expediente
        # esté completo. Gerencia puede rechazar por antecedentes,
        # política comercial u otros motivos.
        evaluacion.resultado = resultado
        evaluacion.estado = resultado

        if resultado == "RECHAZADO":
            evaluacion.monto_aprobado = None
            evaluacion.dias_credito_aprobados = None
        else:
            evaluacion.monto_aprobado = datos.monto_aprobado
            evaluacion.dias_credito_aprobados = (
                datos.dias_credito_aprobados
            )

        evaluacion.fecha_decision = date.today()
        evaluacion.observaciones = datos.observaciones

        db.commit()
        db.refresh(evaluacion)

        return evaluacion          

@app.patch(
    "/api/evaluaciones-credito/{evaluacion_id}/trayectoria",
    response_model=EvaluacionCreditoRespuesta,
)
def validar_trayectoria_credito(
    evaluacion_id: int,
    datos: ValidacionTrayectoriaCredito,
):
    """Registra la validación de la trayectoria comercial del cliente."""

    with SessionLocal() as db:
        evaluacion = db.get(EvaluacionCredito, evaluacion_id)

        if evaluacion is None:
            raise HTTPException(
                status_code=404,
                detail="La evaluación de crédito no existe.",
            )

        if datos.cumplida:
            if not datos.tipo_trayectoria:
                raise HTTPException(
                    status_code=400,
                    detail="Debe indicar el tipo de trayectoria.",
                )

            if datos.cantidad_operaciones is None:
                raise HTTPException(
                    status_code=400,
                    detail="Debe indicar la cantidad de operaciones consideradas.",
                )

            if datos.cantidad_operaciones <= 0:
                raise HTTPException(
                    status_code=400,
                    detail="La cantidad de operaciones debe ser mayor que cero.",
                )

            evaluacion.trayectoria_cumplida = True
            evaluacion.tipo_trayectoria = datos.tipo_trayectoria.strip()
            evaluacion.cantidad_operaciones_trayectoria = datos.cantidad_operaciones
            evaluacion.fecha_validacion_trayectoria = (
                datos.fecha_validacion or date.today()
            )
            evaluacion.observacion_trayectoria = datos.observacion

            if datos.usuario_validacion_id is not None:
                usuario = db.get(Usuario, datos.usuario_validacion_id)

                if usuario is None:
                    raise HTTPException(
                        status_code=400,
                        detail="El usuario indicado no existe.",
                    )

                evaluacion.usuario_validacion_trayectoria_id = (
                    datos.usuario_validacion_id
                )

        else:
            evaluacion.trayectoria_cumplida = False
            evaluacion.tipo_trayectoria = datos.tipo_trayectoria
            evaluacion.cantidad_operaciones_trayectoria = (
                datos.cantidad_operaciones
            )
            evaluacion.fecha_validacion_trayectoria = (
                datos.fecha_validacion or date.today()
            )
            evaluacion.observacion_trayectoria = datos.observacion
            evaluacion.usuario_validacion_trayectoria_id = (
                datos.usuario_validacion_id
            )

        db.commit()
        db.refresh(evaluacion)

        return evaluacion        