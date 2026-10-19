from fastapi import FastAPI, UploadFile, File, HTTPException, Form

from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

from sqlalchemy import func, select



import hashlib

import io

import re

from decimal import Decimal, InvalidOperation



import pandas as pd



from app.database import SessionLocal

from app.models.cliente import Cliente

from app.models.documento_tributario import DocumentoTributario

from app.models.importacion_sii import ImportacionSII

from app.models.pago import Pago

from app.models.movimiento_bancario import MovimientoBancario

from app.models.importacion_bancaria import ImportacionBancaria

from app.models.cuenta_bancaria_gh import CuentaBancariaGH





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

