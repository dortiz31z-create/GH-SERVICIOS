import { useEffect, useState } from 'react'
import RevisionDocumentoCredito from './RevisionDocumentoCredito'

const API_URL = 'http://localhost:8000'

const DOCUMENTOS_REQUERIDOS = [
  {
    tipo: 'ESCRITURA_CONSTITUCION',
    nombre: 'Escritura de constitución',
  },
  {
    tipo: 'CEDULA_DUENOS',
    nombre: 'Cédula de los dueños',
  },
  {
    tipo: 'DICOM',
    nombre: 'Certificado de DICOM',
  },
  {
    tipo: 'CERTIFICADO_NO_DEUDA_TGR',
    nombre: 'Certificado de no deuda TGR',
  },
  {
    tipo: 'CARPETA_TRIBUTARIA_SII',
    nombre: 'Carpeta tributaria SII',
  },
]

function EvaluacionesCredito() {
  const [evaluaciones, setEvaluaciones] = useState([])
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState(null)
  const [documentacion, setDocumentacion] = useState(null)

  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [cargandoDocumentacion, setCargandoDocumentacion] = useState(false)
  const [cargandoClientes, setCargandoClientes] = useState(true)

  const [error, setError] = useState('')
  const [errorClientes, setErrorClientes] = useState('')

const [mostrarValidacionTrayectoria, setMostrarValidacionTrayectoria] = useState(false)
const [guardandoTrayectoria, setGuardandoTrayectoria] = useState(false)
const [errorTrayectoria, setErrorTrayectoria] = useState('')
const [formularioTrayectoria, setFormularioTrayectoria] = useState({
  cumplida: true,
  tipo_trayectoria: '',
  cantidad_operaciones: '',
  fecha_validacion: new Date().toISOString().slice(0, 10),
  observacion: '',
})

  const [mostrarNuevaEvaluacion, setMostrarNuevaEvaluacion] = useState(false)
  const [guardandoEvaluacion, setGuardandoEvaluacion] = useState(false)
  const [errorFormulario, setErrorFormulario] = useState('')
  const [formulario, setFormulario] = useState({
    cliente_id: '',
    fecha_solicitud: new Date().toISOString().slice(0, 10),
    monto_solicitado: '',
    dias_credito_solicitados: '',
    trayectoria_cumplida: false,
    tipo_trayectoria: '',
    cantidad_operaciones_trayectoria: '',
    fecha_validacion_trayectoria: '',
    observacion_trayectoria: '',
    observaciones: '',
  })
  const [documentosDetalle, setDocumentosDetalle] = useState([])
  const [mostrarSubidaDocumento, setMostrarSubidaDocumento] = useState(false)
  const [tipoDocumentoSubida, setTipoDocumentoSubida] = useState('')
  const [archivoDocumento, setArchivoDocumento] = useState(null)
  const [subiendoDocumento, setSubiendoDocumento] = useState(false)
  const [errorDocumento, setErrorDocumento] = useState('')

  const [mostrarRevisionDocumento, setMostrarRevisionDocumento] = useState(false)
  const [documentoRevision, setDocumentoRevision] = useState(null)
  const [nombreDocumentoRevision, setNombreDocumentoRevision] = useState('')

  const [guardandoDecision, setGuardandoDecision] = useState(false)
const [errorDecision, setErrorDecision] = useState('')
const [decision, setDecision] = useState({
  resultado: 'PENDIENTE',
  monto_aprobado: '',
  dias_credito_aprobados: '',
  observaciones: '',
})

  useEffect(() => {
    cargarEvaluaciones()
    cargarClientes()
  }, [])

  useEffect(() => {
    if (evaluacionSeleccionada) {
      cargarDocumentacion(evaluacionSeleccionada.id)
      cargarDocumentosDetalle(evaluacionSeleccionada.id)
    }
  }, [evaluacionSeleccionada])

  async function cargarEvaluaciones() {
    try {
      setCargando(true)
      setError('')

      const response = await fetch(
        `${API_URL}/api/evaluaciones-credito`,
      )

      if (!response.ok) {
        throw new Error('No fue posible cargar las evaluaciones.')
      }

      const data = await response.json()

      setEvaluaciones(data)

      if (data.length > 0) {
        setEvaluacionSeleccionada(data[0])
      } else {
        setEvaluacionSeleccionada(null)
        setDocumentacion(null)
      }
    } catch (error) {
      console.error(error)
      setError('No se pudieron cargar las evaluaciones de crédito.')
    } finally {
      setCargando(false)
    }
  }

  async function cargarClientes() {
    try {
      setCargandoClientes(true)
      setErrorClientes('')

      const response = await fetch(`${API_URL}/api/clientes`)

      if (!response.ok) {
        throw new Error('No fue posible cargar los clientes.')
      }

      const data = await response.json()
      setClientes(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
      setErrorClientes('No se pudieron cargar los datos del cliente.')
      setClientes([])
    } finally {
      setCargandoClientes(false)
    }
  }

  function abrirNuevaEvaluacion() {
    setErrorFormulario('')
    setFormulario({
      cliente_id: '',
      fecha_solicitud: new Date().toISOString().slice(0, 10),
      monto_solicitado: '',
      dias_credito_solicitados: '',
      trayectoria_cumplida: false,
      tipo_trayectoria: '',
      cantidad_operaciones_trayectoria: '',
      fecha_validacion_trayectoria: '',
      observacion_trayectoria: '',
      observaciones: '',
    })
    setMostrarNuevaEvaluacion(true)
  }

  function cerrarNuevaEvaluacion() {
    if (guardandoEvaluacion) {
      return
    }

    setMostrarNuevaEvaluacion(false)
    setErrorFormulario('')
  }

  async function guardarNuevaEvaluacion(event) {
    event.preventDefault()

    if (!formulario.cliente_id) {
      setErrorFormulario('Selecciona un cliente.')
      return
    }

    if (!formulario.fecha_solicitud) {
      setErrorFormulario('Indica la fecha de solicitud.')
      return
    }

    setErrorFormulario('')
    setGuardandoEvaluacion(true)

    try {
      const payload = {
        cliente_id: Number(formulario.cliente_id),
        fecha_solicitud: formulario.fecha_solicitud,
        trayectoria_cumplida: formulario.trayectoria_cumplida,
        tipo_trayectoria: formulario.tipo_trayectoria.trim() || null,
        cantidad_operaciones_trayectoria:
          formulario.cantidad_operaciones_trayectoria
            ? Number(formulario.cantidad_operaciones_trayectoria)
            : null,
        fecha_validacion_trayectoria:
          formulario.fecha_validacion_trayectoria || null,
        observacion_trayectoria:
          formulario.observacion_trayectoria.trim() || null,
        monto_solicitado: formulario.monto_solicitado
          ? Number(formulario.monto_solicitado)
          : null,
        dias_credito_solicitados: formulario.dias_credito_solicitados
          ? Number(formulario.dias_credito_solicitados)
          : null,
        observaciones: formulario.observaciones.trim() || null,
      }

      const response = await fetch(
        `${API_URL}/api/evaluaciones-credito`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      )

      if (!response.ok) {
        const detalle = await response.text()
        throw new Error(detalle || 'No fue posible crear la evaluación.')
      }

      const nuevaEvaluacion = await response.json()

      setMostrarNuevaEvaluacion(false)
      setEvaluaciones((actuales) => [nuevaEvaluacion, ...actuales])
      setEvaluacionSeleccionada(nuevaEvaluacion)
    } catch (error) {
      console.error(error)
      setErrorFormulario(
        'No fue posible crear la evaluación. Revisa los datos e inténtalo nuevamente.',
      )
    } finally {
      setGuardandoEvaluacion(false)
    }
  }

  async function cargarDocumentacion(evaluacionId) {
    try {
      setCargandoDocumentacion(true)

      const response = await fetch(
        `${API_URL}/api/evaluaciones-credito/${evaluacionId}/documentacion`,
      )

      if (!response.ok) {
        throw new Error('No fue posible cargar la documentación.')
      }

      const data = await response.json()
      setDocumentacion(data)
    } catch (error) {
      console.error(error)
      setDocumentacion(null)
    } finally {
      setCargandoDocumentacion(false)
    }
  }

  async function cargarDocumentosDetalle(evaluacionId) {
    try {
      const response = await fetch(
        `${API_URL}/api/evaluaciones-credito/${evaluacionId}/documentos`,
      )

      if (!response.ok) {
        throw new Error('No fue posible cargar los documentos.')
      }

      const data = await response.json()
      setDocumentosDetalle(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
      setDocumentosDetalle([])
    }
  }

  async function validarTrayectoria(event) {
    event.preventDefault()
  
    if (!evaluacionSeleccionada) {
      return
    }
  
    if (!formularioTrayectoria.tipo_trayectoria.trim()) {
      setErrorTrayectoria('Indica el tipo de trayectoria.')
      return
    }
  
    if (!formularioTrayectoria.cantidad_operaciones) {
      setErrorTrayectoria('Indica la cantidad de operaciones consideradas.')
      return
    }
  
    setGuardandoTrayectoria(true)
    setErrorTrayectoria('')
  
    try {
      const payload = {
        cumplida: formularioTrayectoria.cumplida,
        tipo_trayectoria: formularioTrayectoria.tipo_trayectoria.trim(),
        cantidad_operaciones: Number(
          formularioTrayectoria.cantidad_operaciones
        ),
        fecha_validacion:
          formularioTrayectoria.fecha_validacion || null,
        observacion:
          formularioTrayectoria.observacion.trim() || null,
      }
  
      const response = await fetch(
        `${API_URL}/api/evaluaciones-credito/${evaluacionSeleccionada.id}/trayectoria`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )
  
      const data = await response.json()
  
      if (!response.ok) {
        throw new Error(
          data.detail || 'No fue posible validar la trayectoria.'
        )
      }
  
      setEvaluaciones((actuales) =>
        actuales.map((item) =>
          item.id === data.id ? data : item
        )
      )
  
      setEvaluacionSeleccionada(data)
      setMostrarValidacionTrayectoria(false)
  
      setFormularioTrayectoria({
        cumplida: true,
        tipo_trayectoria: data.tipo_trayectoria || '',
        cantidad_operaciones:
          data.cantidad_operaciones_trayectoria || '',
        fecha_validacion:
          data.fecha_validacion_trayectoria ||
          new Date().toISOString().slice(0, 10),
        observacion: data.observacion_trayectoria || '',
      })
    } catch (error) {
      console.error(error)
      setErrorTrayectoria(
        error.message || 'No fue posible validar la trayectoria.'
      )
    } finally {
      setGuardandoTrayectoria(false)
    }
  }

  function obtenerDocumentoDetalle(tipoDocumento) {
    return (
      documentosDetalle.find(
        (documento) => documento.tipo_documento === tipoDocumento,
      ) || null
    )
  }

  function abrirSubidaDocumento(tipoDocumento) {
    setTipoDocumentoSubida(tipoDocumento)
    setArchivoDocumento(null)
    setErrorDocumento('')
    setMostrarSubidaDocumento(true)
  }

  function cerrarSubidaDocumento() {
    if (subiendoDocumento) {
      return
    }

    setMostrarSubidaDocumento(false)
    setTipoDocumentoSubida('')
    setArchivoDocumento(null)
    setErrorDocumento('')
  }

  function abrirRevisionDocumento(tipoDocumento) {
    const estado = obtenerEstadoDocumento(tipoDocumento)
    const detalle = obtenerDocumentoDetalle(tipoDocumento)

    if (!estado?.documento_id) {
      setErrorDocumento('Primero debes cargar el documento antes de revisarlo.')
      return
    }

    setDocumentoRevision({
      ...detalle,
      ...estado,
      documento_id: estado.documento_id,
    })
    setNombreDocumentoRevision(obtenerNombreDocumento(tipoDocumento))
    setMostrarRevisionDocumento(true)
  }

  function cerrarRevisionDocumento() {
    setMostrarRevisionDocumento(false)
    setDocumentoRevision(null)
    setNombreDocumentoRevision('')
  }

  async function despuesDeGuardarRevision() {
    if (!evaluacionSeleccionada) {
      return
    }

    await Promise.all([
      cargarDocumentacion(evaluacionSeleccionada.id),
      cargarDocumentosDetalle(evaluacionSeleccionada.id),
    ])
  }

  async function guardarDecision(event) {
    event.preventDefault()
  
    if (!evaluacionSeleccionada) {
      return
    }
  
    setErrorDecision('')
  
    const resultado = decision.resultado
  
    if (
      resultado === 'APROBADO' ||
      resultado === 'APROBADO_CONDICIONES'
    ) {
      if (!decision.monto_aprobado) {
        setErrorDecision('Indica el monto aprobado.')
        return
      }
  
      if (Number(decision.monto_aprobado) <= 0) {
        setErrorDecision(
          'El monto aprobado debe ser mayor que cero.',
        )
        return
      }
  
      if (!decision.dias_credito_aprobados) {
        setErrorDecision(
          'Indica los días de crédito aprobados.',
        )
        return
      }
  
      if (Number(decision.dias_credito_aprobados) < 0) {
        setErrorDecision(
          'Los días de crédito aprobados no pueden ser negativos.',
        )
        return
      }
    }
  
    setGuardandoDecision(true)
  
    try {
      const response = await fetch(
        `${API_URL}/api/evaluaciones-credito/${evaluacionSeleccionada.id}/decision`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            resultado,
            monto_aprobado:
              resultado === 'APROBADO' ||
              resultado === 'APROBADO_CONDICIONES'
                ? Number(decision.monto_aprobado)
                : null,
            dias_credito_aprobados:
              resultado === 'APROBADO' ||
              resultado === 'APROBADO_CONDICIONES'
                ? Number(decision.dias_credito_aprobados)
                : null,
            observaciones:
              decision.observaciones.trim() || null,
          }),
        },
      )
  
      if (!response.ok) {
        let detalle =
          'No fue posible registrar la decisión.'
  
        try {
          const data = await response.json()
  
          detalle = data.detail || detalle
  
          const nombresDocumentos = {
            ESCRITURA_CONSTITUCION:
              'Escritura de constitución',
            CEDULA_DUENOS:
              'Cédula de identidad de los dueños',
            DICOM:
              'Certificado de DICOM',
            CERTIFICADO_NO_DEUDA_TGR:
              'Certificado de no deuda de la TGR',
            CARPETA_TRIBUTARIA_SII:
              'Carpeta tributaria del SII',
          }
  
          Object.entries(nombresDocumentos).forEach(
            ([nombreTecnico, nombreVisible]) => {
              detalle = detalle.replaceAll(
                nombreTecnico,
                nombreVisible,
              )
            },
          )
        } catch {
          // Mantener el mensaje genérico.
        }
  
        throw new Error(detalle)
      }
  
      const evaluacionActualizada =
        await response.json()
  
      setEvaluaciones((actuales) =>
        actuales.map((evaluacion) =>
          evaluacion.id === evaluacionActualizada.id
            ? evaluacionActualizada
            : evaluacion,
        ),
      )
  
      setEvaluacionSeleccionada(
        evaluacionActualizada,
      )
  
      setDecision({
        resultado:
          evaluacionActualizada.resultado ||
          'PENDIENTE',
        monto_aprobado:
          evaluacionActualizada.monto_aprobado ??
          '',
        dias_credito_aprobados:
          evaluacionActualizada.dias_credito_aprobados ??
          '',
        observaciones:
          evaluacionActualizada.observaciones ||
          '',
      })
  
      setErrorDecision('')
    } catch (error) {
      console.error(error)
  
      setErrorDecision(
        error.message ||
          'No fue posible registrar la decisión.',
      )
    } finally {
      setGuardandoDecision(false)
    }
  }

  async function subirDocumento(event) {
    event.preventDefault()

    if (!evaluacionSeleccionada) {
      setErrorDocumento('No hay una evaluación seleccionada.')
      return
    }

    if (!tipoDocumentoSubida) {
      setErrorDocumento('Selecciona el tipo de documento.')
      return
    }

    if (!archivoDocumento) {
      setErrorDocumento('Selecciona un archivo.')
      return
    }

    if (archivoDocumento.size > 10 * 1024 * 1024) {
      setErrorDocumento('El archivo no puede superar los 10 MB.')
      return
    }

    setErrorDocumento('')
    setSubiendoDocumento(true)

    try {
      const formData = new FormData()
      formData.append('tipo_documento', tipoDocumentoSubida)
      formData.append('archivo', archivoDocumento)

      const response = await fetch(
        `${API_URL}/api/evaluaciones-credito/${evaluacionSeleccionada.id}/documentos`,
        {
          method: 'POST',
          body: formData,
        },
      )

      if (!response.ok) {
        let detalle = 'No fue posible subir el documento.'

        try {
          const data = await response.json()
          detalle = data.detail || detalle
        } catch {
          const texto = await response.text()
          if (texto) {
            detalle = texto
          }
        }

        throw new Error(detalle)
      }

      setMostrarSubidaDocumento(false)
      setTipoDocumentoSubida('')
      setArchivoDocumento(null)

      await Promise.all([
        cargarDocumentacion(evaluacionSeleccionada.id),
        cargarDocumentosDetalle(evaluacionSeleccionada.id),
      ])
    } catch (error) {
      console.error(error)
      setErrorDocumento(
        error.message || 'No fue posible subir el documento.',
      )
    } finally {
      setSubiendoDocumento(false)
    }
  }

  function obtenerCliente(clienteId) {
    return clientes.find((cliente) => cliente.id === clienteId) || null
  }

  function nombreCliente(clienteId) {
    const cliente = obtenerCliente(clienteId)

    if (cliente?.razon_social) {
      return cliente.razon_social
    }

    if (cargandoClientes) {
      return 'Cargando cliente...'
    }

    return `Cliente #${clienteId}`
  }

  function rutCliente(clienteId) {
    const cliente = obtenerCliente(clienteId)
    return cliente?.rut || ''
  }

  function formatearMonto(valor) {
    if (valor === null || valor === undefined) {
      return '-'
    }

    const numero = Number(valor)

    if (Number.isNaN(numero)) {
      return valor
    }

    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(numero)
  }

  function formatearFecha(fecha) {
    if (!fecha) {
      return '-'
    }

    const partes = fecha.split('-')

    if (partes.length !== 3) {
      return fecha
    }

    return `${partes[2]}-${partes[1]}-${partes[0]}`
  }

  function obtenerNombreDocumento(tipo) {
    const documento = DOCUMENTOS_REQUERIDOS.find(
      (item) => item.tipo === tipo,
    )

    return documento?.nombre || tipo
  }

  function obtenerEstadoDocumento(tipo) {
    if (!documentacion?.estados) {
      return null
    }

    return documentacion.estados.find(
      (item) => item.tipo_documento === tipo,
    )
  }

  function claseEstado(estado) {
    if (!estado) {
      return 'pendiente'
    }

    const valor = estado.toUpperCase()

    if (valor === 'APROBADO') {
      return 'aprobado'
    }

    if (valor === 'OBSERVADO') {
      return 'observado'
    }

    if (valor === 'RECHAZADO') {
      return 'rechazado'
    }

    if (valor === 'VENCIDO') {
      return 'vencido'
    }

    if (valor === 'EN_REVISION') {
      return 'revision'
    }

    return 'pendiente'
  }

  function textoEstado(estado) {
    if (!estado) {
      return 'PENDIENTE'
    }

    return estado.replaceAll('_', ' ')
  }

  if (cargando) {
    return (
      <section style={styles.page}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingIcon}>◌</div>
          <h2 style={styles.loadingTitle}>Cargando evaluaciones</h2>
          <p style={styles.loadingText}>
            Estamos consultando la información de crédito.
          </p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section style={styles.page}>
        <div style={styles.errorCard}>
          <div style={styles.errorIcon}>!</div>
          <div>
            <h2 style={styles.errorTitle}>No fue posible cargar Crédito</h2>
            <p style={styles.errorText}>{error}</p>
            <button
              type="button"
              style={styles.primaryButton}
              onClick={cargarEvaluaciones}
            >
              Reintentar
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <style>{`
        .credito-nav-button:hover {
          background: #f8fafc;
        }

        .credito-evaluacion:hover {
          background: #f8fafc;
        }

        .credito-documento:hover {
          background: #fafcff;
        }

        .credito-primary-button:hover {
          background: #1d4ed8;
        }

        .credito-upload-button:hover {
          background: #f8fafc;
          border-color: #94a3b8;
        }

        .credito-upload-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
      `}</style>

      <section style={styles.page}>
        <div style={styles.pageHeader}>
          <div>
            <div style={styles.sectionLabel}>CRÉDITO</div>

            <h2 style={styles.pageTitle}>Evaluaciones de crédito</h2>

            <p style={styles.pageDescription}>
              Revisa solicitudes, documentación y antecedentes antes de la
              decisión de crédito.
            </p>
          </div>

          <button
            type="button"
            className="credito-primary-button"
            style={styles.primaryButton}
            onClick={abrirNuevaEvaluacion}
          >
            + Nueva evaluación
          </button>
        </div>

        {evaluaciones.length === 0 ? (
          <div style={styles.emptyCard}>
            <div style={styles.emptyIcon}>💳</div>
            <h3 style={styles.emptyTitle}>No hay evaluaciones de crédito</h3>
            <p style={styles.emptyText}>
              Cuando se registre una solicitud de crédito, aparecerá aquí para
              su revisión.
            </p>
          </div>
        ) : (
          <div style={styles.layout}>
            <div style={styles.evaluationsCard}>
              <div style={styles.listHeader}>
                <div>
                  <div style={styles.listTitle}>Evaluaciones</div>
                  <div style={styles.listSubtitle}>
                    Solicitudes registradas
                  </div>
                </div>

                <div style={styles.countBadge}>{evaluaciones.length}</div>
              </div>

              <div style={styles.evaluationsList}>
                {evaluaciones.map((evaluacion) => {
                  const activa =
                    evaluacionSeleccionada?.id === evaluacion.id

                  return (
                    <button
                      key={evaluacion.id}
                      type="button"
                      className="credito-evaluacion"
                      onClick={() => setEvaluacionSeleccionada(evaluacion)}
                      style={{
                        ...styles.evaluacionItem,
                        ...(activa ? styles.evaluacionItemActive : {}),
                      }}
                    >
                      <div style={styles.evaluacionTop}>
                        <span style={styles.evaluacionNumber}>
                          Evaluación #{evaluacion.id}
                        </span>

                        <span
                          style={{
                            ...styles.statusBadge,
                            ...styles.statusPendiente,
                          }}
                        >
                          {evaluacion.estado}
                        </span>
                      </div>

                      <div style={styles.evaluacionClient}>
                        {nombreCliente(evaluacion.cliente_id)}
                      </div>

                      {rutCliente(evaluacion.cliente_id) && (
                        <div style={styles.evaluacionRut}>
                          RUT {rutCliente(evaluacion.cliente_id)}
                        </div>
                      )}

                      <div style={styles.evaluacionDate}>
                        Solicitud: {formatearFecha(evaluacion.fecha_solicitud)}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {evaluacionSeleccionada && (
              <div style={styles.detailCard}>
                <div style={styles.detailHeader}>
                  <div>
                    <div style={styles.detailLabel}>
                      EVALUACIÓN #{evaluacionSeleccionada.id}
                    </div>

                    <h2 style={styles.detailTitle}>
                      {nombreCliente(evaluacionSeleccionada.cliente_id)}
                    </h2>

                    {rutCliente(evaluacionSeleccionada.cliente_id) && (
                      <div style={styles.detailRut}>
                        RUT {rutCliente(evaluacionSeleccionada.cliente_id)}
                      </div>
                    )}

                    {errorClientes && (
                      <div style={styles.clientWarning}>{errorClientes}</div>
                    )}
                  </div>

                  <span
                    style={{
                      ...styles.statusBadge,
                      ...styles.statusPendiente,
                    }}
                  >
                    {evaluacionSeleccionada.estado}
                  </span>
                </div>

                <div style={styles.summaryGrid}>
                  <div style={styles.summaryItem}>
                    <div style={styles.summaryLabel}>Resultado</div>
                    <div style={styles.summaryValue}>
                      {evaluacionSeleccionada.resultado}
                    </div>
                  </div>

                  <div style={styles.summaryItem}>
                    <div style={styles.summaryLabel}>Monto solicitado</div>
                    <div style={styles.summaryValue}>
                      {formatearMonto(
                        evaluacionSeleccionada.monto_solicitado,
                      )}
                    </div>
                  </div>

                  <div style={styles.summaryItem}>
                    <div style={styles.summaryLabel}>Plazo solicitado</div>
                    <div style={styles.summaryValue}>
                      {evaluacionSeleccionada.dias_credito_solicitados
                        ? `${evaluacionSeleccionada.dias_credito_solicitados} días`
                        : '-'}
                    </div>
                  </div>
                </div>

                <div style={styles.trajectorySection}>
                  <div style={styles.sectionHeader}>
                    <div>
                      <h3 style={styles.sectionTitle}>Trayectoria comercial</h3>
                      <p style={styles.sectionDescription}>
                        Antecedentes utilizados para evaluar la trayectoria del
                        cliente.
                      </p>
                    </div>

                    <span
                      style={{
                        ...styles.statusBadge,
                        ...(evaluacionSeleccionada.trayectoria_cumplida
                          ? styles.statusApproved
                          : styles.statusPendingLight),
                      }}
                    >
                      {evaluacionSeleccionada.trayectoria_cumplida
                        ? 'CUMPLIDA'
                        : 'PENDIENTE'}
                    </span>
                  </div>

                  <div style={styles.trajectoryGrid}>
                    <div style={styles.infoBox}>
                      <span style={styles.infoLabel}>
                        Tipo de trayectoria
                      </span>
                      <strong style={styles.infoValue}>
                        {evaluacionSeleccionada.tipo_trayectoria ||
                          'Pendiente de validar'}
                      </strong>
                    </div>

                    <div style={styles.infoBox}>
                      <span style={styles.infoLabel}>
                        Operaciones consideradas
                      </span>
                      <strong style={styles.infoValue}>
                        {evaluacionSeleccionada
                          .cantidad_operaciones_trayectoria ?? '-'}
                      </strong>
                    </div>

                    <div style={styles.infoBox}>
                      <span style={styles.infoLabel}>Fecha de validación</span>
                      <strong style={styles.infoValue}>
                        {formatearFecha(
                          evaluacionSeleccionada.fecha_validacion_trayectoria,
                        )}
                      </strong>
                    </div>
                  </div>

                  {evaluacionSeleccionada.observacion_trayectoria && (
                    <div style={styles.observationBox}>
                      <strong>Observación:</strong>{' '}
                      {evaluacionSeleccionada.observacion_trayectoria}
                    </div>
                  )}
                </div>

                <div style={styles.documentsSection}>
                  <div style={styles.sectionHeader}>
                    <div>
                      <h3 style={styles.sectionTitle}>Documentación</h3>
                      <p style={styles.sectionDescription}>
                        {documentacion
                          ? `${documentacion.documentos_presentes} de ${documentacion.documentos_requeridos} documentos presentes`
                          : 'Consultando documentación...'}
                      </p>
                    </div>

                    {documentacion && (
                      <span
                        style={{
                          ...styles.statusBadge,
                          ...(documentacion.documentacion_completa
                            ? styles.statusApproved
                            : styles.statusIncomplete),
                        }}
                      >
                        {documentacion.documentacion_completa
                          ? 'COMPLETA'
                          : 'INCOMPLETA'}
                      </span>
                    )}
                  </div>

                  {cargandoDocumentacion ? (
                    <div style={styles.documentLoading}>
                      Cargando documentación...
                    </div>
                  ) : (
                    <div style={styles.documentsList}>
                      {DOCUMENTOS_REQUERIDOS.map((documento, index) => {
                        const estado = obtenerEstadoDocumento(documento.tipo)
                        const presente = estado?.presente === true
                        const estadoRevision =
                          estado?.estado_revision || 'PENDIENTE'
                        const clase = claseEstado(estadoRevision)

                        const estadoStyle = {
                          pendiente: styles.statusPendiente,
                          aprobado: styles.statusAprobado,
                          observado: styles.statusObservado,
                          rechazado: styles.statusRechazado,
                          vencido: styles.statusVencido,
                          revision: styles.statusRevision,
                        }[clase] || styles.statusPendiente

                        const detalleDocumento =
                          obtenerDocumentoDetalle(documento.tipo)

                        return (
                          <div
                            key={documento.tipo}
                            className="credito-documento"
                            style={{
                              ...styles.documentRow,
                              ...(index === DOCUMENTOS_REQUERIDOS.length - 1
                                ? styles.documentRowLast
                                : {}),
                            }}
                          >
                            <div
                              style={{
                                ...styles.documentIcon,
                                ...(presente
                                  ? styles.documentIconPresent
                                  : {}),
                              }}
                            >
                              {presente ? '✓' : '○'}
                            </div>

                            <div style={styles.documentInfo}>
                              <div style={styles.documentName}>
                                {obtenerNombreDocumento(documento.tipo)}
                              </div>

                              <div style={styles.documentDescription}>
                                {presente
                                  ? detalleDocumento?.nombre_archivo ||
                                    (estado.documento_id
                                      ? `Documento #${estado.documento_id}`
                                      : 'Documento recibido')
                                  : 'Documento pendiente'}
                              </div>
                            </div>

                            <div style={styles.documentActions}>
                              <span
                                style={{
                                  ...styles.statusBadge,
                                  ...estadoStyle,
                                }}
                              >
                                {textoEstado(estadoRevision)}
                              </span>

                              {presente && (
                                <button
                                  type="button"
                                  style={styles.documentButton}
                                  onClick={() =>
                                    abrirRevisionDocumento(documento.tipo)
                                  }
                                >
                                  Revisar
                                </button>
                              )}

                              <button
                                type="button"
                                className="credito-upload-button"
                                style={styles.documentButton}
                                onClick={() =>
                                  abrirSubidaDocumento(documento.tipo)
                                }
                                disabled={subiendoDocumento}
                              >
                                {presente ? 'Reemplazar' : 'Subir'}
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
            
                <div
  style={{
    padding: '22px',
    borderBottom: '1px solid #e5e7eb',
  }}
>
  <div style={styles.sectionHeader}>
    <div>
      <h3 style={styles.sectionTitle}>
        Decisión de Gerencia
      </h3>

      <p style={styles.sectionDescription}>
        Registra la decisión final sobre el
        otorgamiento del crédito.
      </p>
    </div>

    <span
      style={{
        ...styles.statusBadge,
        ...(evaluacionSeleccionada.resultado ===
        'APROBADO'
          ? styles.statusAprobado
          : evaluacionSeleccionada.resultado ===
              'RECHAZADO'
            ? styles.statusRechazado
            : styles.statusIncomplete),
      }}
    >
      {evaluacionSeleccionada.resultado ||
        'PENDIENTE'}
    </span>
  </div>

  <form onSubmit={guardarDecision}>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '14px',
        marginTop: '18px',
      }}
    >
      <label style={styles.formField}>
        <span style={styles.formLabel}>
          Resultado
        </span>

        <select
          value={decision.resultado}
          onChange={(event) =>
            setDecision((actual) => ({
              ...actual,
              resultado: event.target.value,
            }))
          }
          style={{
            ...styles.formInput,
            backgroundColor: '#fff',
          }}
          disabled={guardandoDecision}
        >
          <option value="PENDIENTE">
            Pendiente
          </option>

          <option value="APROBADO">
            Aprobado
          </option>

          <option value="APROBADO_CONDICIONES">
            Aprobado con condiciones
          </option>

          <option value="RECHAZADO">
            Rechazado
          </option>
        </select>
      </label>

      <label style={styles.formField}>
        <span style={styles.formLabel}>
          Monto aprobado
        </span>

        <input
          type="number"
          min="0"
          value={decision.monto_aprobado}
          onChange={(event) =>
            setDecision((actual) => ({
              ...actual,
              monto_aprobado:
                event.target.value,
            }))
          }
          style={styles.formInput}
          placeholder="Ej. 5000000"
          disabled={
            guardandoDecision ||
            ![
              'APROBADO',
              'APROBADO_CONDICIONES',
            ].includes(decision.resultado)
          }
        />
      </label>

      <label style={styles.formField}>
        <span style={styles.formLabel}>
          Días de crédito aprobados
        </span>

        <input
          type="number"
          min="0"
          value={
            decision.dias_credito_aprobados
          }
          onChange={(event) =>
            setDecision((actual) => ({
              ...actual,
              dias_credito_aprobados:
                event.target.value,
            }))
          }
          style={styles.formInput}
          placeholder="Ej. 30"
          disabled={
            guardandoDecision ||
            ![
              'APROBADO',
              'APROBADO_CONDICIONES',
            ].includes(decision.resultado)
          }
        />
      </label>

      <label style={styles.formField}>
        <span style={styles.formLabel}>
          Observaciones
        </span>

        <input
          type="text"
          value={decision.observaciones}
          onChange={(event) =>
            setDecision((actual) => ({
              ...actual,
              observaciones:
                event.target.value,
            }))
          }
          style={styles.formInput}
          placeholder="Observaciones de Gerencia"
          disabled={guardandoDecision}
        />
      </label>
    </div>

    {errorDecision && (
      <div
        style={{
          marginTop: '14px',
          padding: '12px 14px',
          borderRadius: '8px',
          border: '1px solid #fecaca',
          backgroundColor: '#fef2f2',
          color: '#b91c1c',
          fontSize: '12px',
        }}
      >
        {errorDecision}
      </div>
    )}

    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '18px',
      }}
    >
      <button
        type="submit"
        style={styles.primaryButton}
        disabled={guardandoDecision}
      >
        {guardandoDecision
          ? 'Registrando...'
          : 'Registrar decisión'}
      </button>
    </div>
  </form>
</div>

                {evaluacionSeleccionada.observaciones && (
                  <div style={styles.finalObservation}>
                    <div style={styles.finalObservationTitle}>
                      Observaciones de la evaluación
                    </div>
                    <div style={styles.finalObservationText}>
                      {evaluacionSeleccionada.observaciones}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {mostrarSubidaDocumento && (
          <div
            style={styles.modalOverlay}
            onMouseDown={cerrarSubidaDocumento}
          >
            <div
              style={styles.documentModalCard}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <div>
                  <div style={styles.detailLabel}>DOCUMENTACIÓN</div>
                  <h2 style={styles.modalTitle}>Subir documento</h2>
                  <p style={styles.modalDescription}>
                    Adjunta el antecedente correspondiente a esta evaluación.
                    El archivo quedará registrado con estado RECIBIDO para su
                    posterior revisión.
                  </p>
                </div>

                <button
                  type="button"
                  style={styles.closeButton}
                  onClick={cerrarSubidaDocumento}
                  disabled={subiendoDocumento}
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>

              <form onSubmit={subirDocumento}>
                <div style={styles.formBody}>
                  <div style={styles.uploadSelectedDocument}>
                    <span style={styles.infoLabel}>Documento</span>
                    <strong style={styles.infoValue}>
                      {obtenerNombreDocumento(tipoDocumentoSubida)}
                    </strong>
                  </div>

                  <label style={styles.formField}>
                    <span style={styles.formLabel}>Archivo *</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(event) =>
                        setArchivoDocumento(event.target.files?.[0] || null)
                      }
                      disabled={subiendoDocumento}
                      style={styles.fileInput}
                    />
                    <span style={styles.formHint}>
                      Máximo 10 MB. Formatos habituales: PDF, Word e imágenes.
                    </span>
                  </label>

                  {archivoDocumento && (
                    <div style={styles.selectedFile}>
                      <span style={styles.selectedFileIcon}>✓</span>
                      <div style={styles.selectedFileInfo}>
                        <strong>{archivoDocumento.name}</strong>
                        <span>
                          {(archivoDocumento.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                  )}

                  {errorDocumento && (
                    <div style={styles.formError}>{errorDocumento}</div>
                  )}
                </div>

                <div style={styles.modalFooter}>
                  <button
                    type="button"
                    style={styles.secondaryButton}
                    onClick={cerrarSubidaDocumento}
                    disabled={subiendoDocumento}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="credito-primary-button"
                    style={styles.primaryButton}
                    disabled={subiendoDocumento || !archivoDocumento}
                  >
                    {subiendoDocumento ? 'Subiendo...' : 'Subir documento'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {mostrarRevisionDocumento && documentoRevision && evaluacionSeleccionada && (
          <RevisionDocumentoCredito
            evaluacionId={evaluacionSeleccionada.id}
            documento={documentoRevision}
            nombreDocumento={nombreDocumentoRevision}
            onClose={cerrarRevisionDocumento}
            onGuardado={despuesDeGuardarRevision}
          />
        )}

        {mostrarNuevaEvaluacion && (
          <div style={styles.modalOverlay} onMouseDown={cerrarNuevaEvaluacion}>
            <div
              style={styles.modalCard}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <div>
                  <div style={styles.detailLabel}>CRÉDITO</div>
                  <h2 style={styles.modalTitle}>Nueva evaluación</h2>
                  <p style={styles.modalDescription}>
                    Registra la solicitud y sus antecedentes iniciales. La
                    aprobación del crédito seguirá siendo una decisión manual.
                  </p>
                </div>

                <button
                  type="button"
                  style={styles.closeButton}
                  onClick={cerrarNuevaEvaluacion}
                  disabled={guardandoEvaluacion}
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>

              <form onSubmit={guardarNuevaEvaluacion}>
                <div style={styles.formBody}>
                  <div style={styles.formGrid}>
                    <label style={styles.formField}>
                      <span style={styles.formLabel}>Cliente *</span>
                      <select
                        value={formulario.cliente_id}
                        onChange={(event) =>
                          setFormulario((actual) => ({
                            ...actual,
                            cliente_id: event.target.value,
                          }))
                        }
                        style={styles.formInput}
                        disabled={guardandoEvaluacion || cargandoClientes}
                      >
                        <option value="">Seleccionar cliente...</option>
                        {clientes.map((cliente) => (
                          <option key={cliente.id} value={cliente.id}>
                            {cliente.razon_social} — {cliente.rut}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label style={styles.formField}>
                      <span style={styles.formLabel}>Fecha de solicitud *</span>
                      <input
                        type="date"
                        value={formulario.fecha_solicitud}
                        onChange={(event) =>
                          setFormulario((actual) => ({
                            ...actual,
                            fecha_solicitud: event.target.value,
                          }))
                        }
                        style={styles.formInput}
                        disabled={guardandoEvaluacion}
                      />
                    </label>

                    <label style={styles.formField}>
                      <span style={styles.formLabel}>Monto solicitado</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={formulario.monto_solicitado}
                        onChange={(event) =>
                          setFormulario((actual) => ({
                            ...actual,
                            monto_solicitado: event.target.value,
                          }))
                        }
                        style={styles.formInput}
                        placeholder="Ej. 5000000"
                        disabled={guardandoEvaluacion}
                      />
                    </label>

                    <label style={styles.formField}>
                      <span style={styles.formLabel}>Plazo solicitado</span>
                      <select
                        value={formulario.dias_credito_solicitados}
                        onChange={(event) =>
                          setFormulario((actual) => ({
                            ...actual,
                            dias_credito_solicitados: event.target.value,
                          }))
                        }
                        style={styles.formInput}
                        disabled={guardandoEvaluacion}
                      >
                        <option value="">Seleccionar plazo...</option>
                        <option value="0">Contado</option>
                        <option value="7">7 días</option>
                        <option value="15">15 días</option>
                        <option value="30">30 días</option>
                      </select>
                    </label>
                  </div>

                  <div style={styles.formSection}>
                    <div style={styles.formSectionTitle}>
                      Trayectoria comercial
                    </div>

                    <label style={styles.checkboxField}>
                      <input
                        type="checkbox"
                        checked={formulario.trayectoria_cumplida}
                        onChange={(event) =>
                          setFormulario((actual) => ({
                            ...actual,
                            trayectoria_cumplida: event.target.checked,
                          }))
                        }
                        disabled={guardandoEvaluacion}
                      />
                      <span>Trayectoria validada para esta evaluación</span>
                    </label>

                    <div style={styles.formGrid}>
                      <label style={styles.formField}>
                        <span style={styles.formLabel}>
                          Tipo de trayectoria
                        </span>
                        <input
                          type="text"
                          value={formulario.tipo_trayectoria}
                          onChange={(event) =>
                            setFormulario((actual) => ({
                              ...actual,
                              tipo_trayectoria: event.target.value,
                            }))
                          }
                          style={styles.formInput}
                          placeholder="Ej. Relación comercial"
                          disabled={guardandoEvaluacion}
                        />
                      </label>

                      <label style={styles.formField}>
                        <span style={styles.formLabel}>
                          Operaciones consideradas
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={formulario.cantidad_operaciones_trayectoria}
                          onChange={(event) =>
                            setFormulario((actual) => ({
                              ...actual,
                              cantidad_operaciones_trayectoria:
                                event.target.value,
                            }))
                          }
                          style={styles.formInput}
                          placeholder="Cantidad"
                          disabled={guardandoEvaluacion}
                        />
                      </label>

                      <label style={styles.formField}>
                        <span style={styles.formLabel}>
                          Fecha de validación
                        </span>
                        <input
                          type="date"
                          value={formulario.fecha_validacion_trayectoria}
                          onChange={(event) =>
                            setFormulario((actual) => ({
                              ...actual,
                              fecha_validacion_trayectoria:
                                event.target.value,
                            }))
                          }
                          style={styles.formInput}
                          disabled={guardandoEvaluacion}
                        />
                      </label>
                    </div>

                    <label style={styles.formField}>
                      <span style={styles.formLabel}>
                        Observación de trayectoria
                      </span>
                      <textarea
                        value={formulario.observacion_trayectoria}
                        onChange={(event) =>
                          setFormulario((actual) => ({
                            ...actual,
                            observacion_trayectoria: event.target.value,
                          }))
                        }
                        style={styles.formTextarea}
                        rows="3"
                        placeholder="Antecedentes o evidencia utilizada..."
                        disabled={guardandoEvaluacion}
                      />
                    </label>
                  </div>

                  <label style={styles.formField}>
                    <span style={styles.formLabel}>Observaciones</span>
                    <textarea
                      value={formulario.observaciones}
                      onChange={(event) =>
                        setFormulario((actual) => ({
                          ...actual,
                          observaciones: event.target.value,
                        }))
                      }
                      style={styles.formTextarea}
                      rows="3"
                      placeholder="Observaciones generales de la solicitud..."
                      disabled={guardandoEvaluacion}
                    />
                  </label>

                  {errorFormulario && (
                    <div style={styles.formError}>{errorFormulario}</div>
                  )}
                </div>

                <div style={styles.modalFooter}>
                  <button
                    type="button"
                    style={styles.secondaryButton}
                    onClick={cerrarNuevaEvaluacion}
                    disabled={guardandoEvaluacion}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    style={styles.primaryButton}
                    disabled={guardandoEvaluacion}
                  >
                    {guardandoEvaluacion
                      ? 'Guardando...'
                      : 'Guardar evaluación'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </>
  )
}

const styles = {
  page: {
    width: '100%',
    padding: '30px 32px 50px',
    boxSizing: 'border-box',
  },

  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '24px',
    marginBottom: '24px',
  },

  sectionLabel: {
    color: '#64748b',
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '0.9px',
    marginBottom: '6px',
  },

  pageTitle: {
    margin: 0,
    fontSize: '25px',
    lineHeight: '1.2',
    fontWeight: '750',
    color: '#172033',
  },

  pageDescription: {
    margin: '7px 0 0',
    color: '#64748b',
    fontSize: '13px',
    lineHeight: '1.5',
  },

  primaryButton: {
    border: 'none',
    borderRadius: '8px',
    background: '#111827',
    color: '#ffffff',
    padding: '11px 16px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },

  layout: {
    display: 'grid',
    gridTemplateColumns: '264px minmax(0, 1fr)',
    gap: '18px',
    alignItems: 'start',
  },

  evaluationsCard: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    overflow: 'hidden',
    minWidth: 0,
  },

  listHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 16px',
    borderBottom: '1px solid #e5e7eb',
  },

  listTitle: {
    fontSize: '13px',
    fontWeight: '750',
    color: '#172033',
  },

  listSubtitle: {
    marginTop: '3px',
    fontSize: '11px',
    color: '#94a3b8',
  },

  countBadge: {
    minWidth: '26px',
    height: '26px',
    borderRadius: '999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#eff6ff',
    color: '#2563eb',
    fontSize: '11px',
    fontWeight: '800',
  },

  evaluationsList: {
    display: 'flex',
    flexDirection: 'column',
  },

  evaluacionItem: {
    width: '100%',
    border: 'none',
    borderBottom: '1px solid #eef2f7',
    background: '#ffffff',
    padding: '15px 16px',
    textAlign: 'left',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },

  evaluacionItemActive: {
    background: '#f8fafc',
    boxShadow: 'inset 3px 0 0 #2563eb',
  },

  evaluacionTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
  },

  evaluacionNumber: {
    fontSize: '11px',
    fontWeight: '750',
    color: '#172033',
  },

  evaluacionClient: {
    marginTop: '9px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#334155',
    lineHeight: '1.35',
  },

  evaluacionRut: {
    marginTop: '3px',
    fontSize: '10px',
    color: '#64748b',
  },

  evaluacionDate: {
    marginTop: '5px',
    fontSize: '10px',
    color: '#94a3b8',
  },

  detailCard: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    overflow: 'hidden',
    minWidth: 0,
  },

  detailHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '20px',
    padding: '22px',
    borderBottom: '1px solid #e5e7eb',
  },

  detailLabel: {
    color: '#64748b',
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '0.8px',
    marginBottom: '6px',
  },

  detailTitle: {
    margin: 0,
    fontSize: '20px',
    lineHeight: '1.2',
    fontWeight: '750',
    color: '#172033',
  },

  detailRut: {
    marginTop: '5px',
    color: '#64748b',
    fontSize: '11px',
    fontWeight: '600',
  },

  clientWarning: {
    marginTop: '7px',
    color: '#a16207',
    fontSize: '10px',
  },

  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    borderBottom: '1px solid #e5e7eb',
  },

  summaryItem: {
    padding: '18px 22px',
    minWidth: 0,
  },

  summaryLabel: {
    fontSize: '10px',
    color: '#64748b',
    marginBottom: '7px',
  },

  summaryValue: {
    fontSize: '14px',
    fontWeight: '750',
    color: '#172033',
  },

  trajectorySection: {
    padding: '22px',
    borderBottom: '1px solid #e5e7eb',
  },

  documentsSection: {
    padding: '22px',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '18px',
    marginBottom: '16px',
  },

  sectionTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: '750',
    color: '#172033',
  },

  sectionDescription: {
    margin: '5px 0 0',
    color: '#64748b',
    fontSize: '11px',
    lineHeight: '1.5',
  },

  trajectoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '12px',
  },

  infoBox: {
    padding: '13px',
    background: '#f8fafc',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    minWidth: 0,
  },

  infoLabel: {
    display: 'block',
    color: '#64748b',
    fontSize: '10px',
    marginBottom: '6px',
  },

  infoValue: {
    display: 'block',
    color: '#172033',
    fontSize: '12px',
    fontWeight: '700',
    overflowWrap: 'anywhere',
  },

  observationBox: {
    marginTop: '12px',
    padding: '12px 14px',
    borderRadius: '8px',
    background: '#fffbeb',
    border: '1px solid #fde68a',
    color: '#78350f',
    fontSize: '11px',
    lineHeight: '1.5',
  },

  documentsList: {
    border: '1px solid #e2e8f0',
    borderRadius: '9px',
    overflow: 'hidden',
  },

  documentRow: {
    display: 'grid',
    gridTemplateColumns: '28px minmax(0, 1fr) minmax(180px, auto)',
    alignItems: 'center',
    columnGap: '12px',
    minHeight: '66px',
    padding: '12px 14px',
    borderBottom: '1px solid #eef2f7',
    transition: 'background 0.15s ease',
  },

  documentRowLast: {
    borderBottom: 'none',
  },

  documentIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: '#f1f5f9',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '800',
  },

  documentIconPresent: {
    background: '#eff6ff',
    color: '#2563eb',
  },

  documentInfo: {
    minWidth: 0,
  },

  documentName: {
    fontSize: '12px',
    fontWeight: '750',
    color: '#172033',
    lineHeight: '1.4',
  },

  documentDescription: {
    marginTop: '4px',
    color: '#94a3b8',
    fontSize: '10px',
    lineHeight: '1.4',
    overflowWrap: 'anywhere',
  },

  documentActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '8px',
    flexWrap: 'wrap',
  },

  documentButton: {
    border: '1px solid #cbd5e1',
    borderRadius: '7px',
    background: '#ffffff',
    color: '#334155',
    padding: '6px 9px',
    fontSize: '9px',
    fontWeight: '750',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },

  uploadSelectedDocument: {
    padding: '13px',
    marginBottom: '16px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
  },

  fileInput: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #cbd5e1',
    borderRadius: '7px',
    background: '#ffffff',
    color: '#334155',
    padding: '7px',
    fontSize: '11px',
  },

  formHint: {
    color: '#94a3b8',
    fontSize: '10px',
    lineHeight: '1.4',
  },

  selectedFile: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '14px',
    padding: '11px 12px',
    borderRadius: '8px',
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
  },

  selectedFileIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: '#dbeafe',
    color: '#2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '800',
  },

  selectedFileInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    minWidth: 0,
    color: '#334155',
    fontSize: '10px',
  },

  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '22px',
    padding: '0 9px',
    borderRadius: '999px',
    fontSize: '9px',
    fontWeight: '800',
    letterSpacing: '0.2px',
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
  },

  statusPendiente: {
    background: '#f1f5f9',
    color: '#64748b',
  },

  statusPendingLight: {
    background: '#fff7ed',
    color: '#c2410c',
  },

  statusApproved: {
    background: '#dcfce7',
    color: '#15803d',
  },

  statusIncomplete: {
    background: '#fef3c7',
    color: '#a16207',
  },

  statusObservado: {
    background: '#fef3c7',
    color: '#a16207',
  },

  statusRechazado: {
    background: '#fee2e2',
    color: '#b91c1c',
  },

  statusVencido: {
    background: '#fee2e2',
    color: '#b91c1c',
  },

  statusRevision: {
    background: '#dbeafe',
    color: '#1d4ed8',
  },

  statusAprobado: {
    background: '#dcfce7',
    color: '#15803d',
  },

  documentLoading: {
    padding: '30px',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '9px',
  },

  finalObservation: {
    margin: '0 22px 22px',
    padding: '15px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '9px',
  },

  finalObservationTitle: {
    fontSize: '11px',
    fontWeight: '750',
    color: '#172033',
    marginBottom: '6px',
  },

  finalObservationText: {
    color: '#64748b',
    fontSize: '11px',
    lineHeight: '1.6',
  },

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    background: 'rgba(15, 23, 42, 0.42)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    boxSizing: 'border-box',
  },

  modalCard: {
    width: 'min(820px, 100%)',
    maxHeight: 'calc(100vh - 48px)',
    overflowY: 'auto',
    background: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 20px 60px rgba(15, 23, 42, 0.18)',
  },

  documentModalCard: {
    width: 'min(560px, 100%)',
    maxHeight: 'calc(100vh - 48px)',
    overflowY: 'auto',
    background: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 20px 60px rgba(15, 23, 42, 0.18)',
  },

  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '20px',
    padding: '22px',
    borderBottom: '1px solid #e5e7eb',
  },

  modalTitle: {
    margin: 0,
    fontSize: '20px',
    lineHeight: '1.2',
    fontWeight: '750',
    color: '#172033',
  },

  modalDescription: {
    margin: '7px 0 0',
    color: '#64748b',
    fontSize: '11px',
    lineHeight: '1.5',
    maxWidth: '620px',
  },

  closeButton: {
    width: '32px',
    height: '32px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    background: '#ffffff',
    color: '#64748b',
    fontSize: '22px',
    lineHeight: 1,
    cursor: 'pointer',
  },

  formBody: {
    padding: '22px',
  },

  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '14px',
  },

  formField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    minWidth: 0,
  },

  formLabel: {
    color: '#334155',
    fontSize: '10px',
    fontWeight: '750',
  },

  formInput: {
    width: '100%',
    minHeight: '38px',
    boxSizing: 'border-box',
    border: '1px solid #cbd5e1',
    borderRadius: '7px',
    background: '#ffffff',
    color: '#172033',
    padding: '8px 10px',
    fontSize: '12px',
    outline: 'none',
  },

  formTextarea: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #cbd5e1',
    borderRadius: '7px',
    background: '#ffffff',
    color: '#172033',
    padding: '9px 10px',
    fontSize: '12px',
    lineHeight: '1.5',
    resize: 'vertical',
    fontFamily: 'inherit',
  },

  formSection: {
    marginTop: '22px',
    paddingTop: '20px',
    borderTop: '1px solid #e5e7eb',
  },

  formSectionTitle: {
    marginBottom: '12px',
    color: '#172033',
    fontSize: '13px',
    fontWeight: '750',
  },

  checkboxField: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '14px',
    color: '#334155',
    fontSize: '11px',
    cursor: 'pointer',
  },

  formError: {
    marginTop: '16px',
    padding: '11px 13px',
    borderRadius: '8px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    fontSize: '11px',
    lineHeight: '1.5',
  },

  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    padding: '16px 22px',
    borderTop: '1px solid #e5e7eb',
    background: '#f8fafc',
  },

  secondaryButton: {
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    background: '#ffffff',
    color: '#334155',
    padding: '10px 15px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },

  emptyCard: {
    background: '#ffffff',
    border: '1px dashed #cbd5e1',
    borderRadius: '12px',
    padding: '60px 30px',
    textAlign: 'center',
  },

  emptyIcon: {
    width: '48px',
    height: '48px',
    margin: '0 auto 15px',
    borderRadius: '50%',
    background: '#eff6ff',
    color: '#2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
  },

  emptyTitle: {
    margin: 0,
    fontSize: '16px',
    color: '#172033',
  },

  emptyText: {
    maxWidth: '500px',
    margin: '8px auto 0',
    color: '#94a3b8',
    fontSize: '12px',
    lineHeight: '1.6',
  },

  loadingCard: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '60px 30px',
    textAlign: 'center',
  },

  loadingIcon: {
    fontSize: '28px',
    color: '#2563eb',
  },

  loadingTitle: {
    margin: '12px 0 0',
    fontSize: '16px',
    color: '#172033',
  },

  loadingText: {
    margin: '7px 0 0',
    color: '#94a3b8',
    fontSize: '12px',
  },

  errorCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '15px',
    background: '#ffffff',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    padding: '24px',
  },

  errorIcon: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: '#fee2e2',
    color: '#b91c1c',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
  },

  errorTitle: {
    margin: 0,
    fontSize: '15px',
    color: '#172033',
  },

  errorText: {
    margin: '6px 0 15px',
    color: '#64748b',
    fontSize: '12px',
  },
}

export default EvaluacionesCredito
