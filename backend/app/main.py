from fastapi import FastAPI

app = FastAPI(
    title="GH Servicios",
    description="Sistema de gestión de clientes, facturas, pagos y conciliación",
    version="0.1.0",
)


@app.get("/")
def root():
    return {
        "message": "GH Servicios API funcionando",
        "version": "0.1.0",
    }