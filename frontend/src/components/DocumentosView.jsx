import { useEffect, useMemo, useRef, useState } from 'react'

const API_URL = 'http://127.0.0.1:8000'

const styles = {
  page: {
    padding: '32px 36px',
    maxWidth: '1500px',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
  },

  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    color: '#172033',
  },

  description: {
    margin: '6px 0 0',
    color: '#64748b',
    fontSize: '13px',
  },

  headerButtons: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },

  primaryButton: {
    border: 'none',
    borderRadius: '8px',
    background: '#2563eb',
    color: '#ffffff',
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },

  secondaryButton: {
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    background: '#ffffff',
    color: '#334155',
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },

  filters: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '18px',
    display: 'grid',
    gridTemplateColumns: '1fr 1.5fr 1fr 1fr',
    gap: '12px',
    marginBottom: '20px',
  },

  input: {
    width: '100%',
    border: '1px solid #d1d5db',
    borderRadius: '7px',
    padding: '10px 11px',
    fontSize: '13px',
    color: '#172033',
    background: '#ffffff',
    outline: 'none',
  },

  tableContainer: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    overflow: 'hidden',
  },

  tableHeader: {
    padding: '17px 18px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  tableTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '700',
    color: '#172033',
  },

  count: {
    color: '#64748b',
    fontSize: '12px',
  },

  tableWrapper: {
    overflowX: 'auto',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '1050px',
  },

  th: {
    textAlign: 'left',
    padding: '12px 14px',
    background: '#f8fafc',
    borderBottom: '1px solid #e5e7eb',
    color: '#64748b',
    fontSize: '11px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
  },

  td: {
    padding: '13px 14px',
    borderBottom: '1px solid #f1f5f9',
    color: '#334155',
    fontSize: '12px',
    whiteSpace: 'nowrap',
  },

  customer: {
    fontWeight: '600',
    color: '#172033',
  },

  documentType: {
    display: 'inline-block',
    padding: '4px 7px',
    borderRadius: '5px',
    background: '#eff6ff',
    color: '#1d4ed8',
    fontSize: '11px',
    fontWeight: '700',
  },

  amount: {
    textAlign: 'right',
    fontWeight: '700',
    color: '#172033',
  },

  loading: {
    padding: '45px',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '13px',
  },

  error: {
    marginBottom: '20px',
    padding: '12px 14px',
    borderRadius: '8px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    fontSize: '13px',
  },

  success: {
    marginBottom: '20px',
    padding: '12px 14px',
    borderRadius: '8px',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#166534',
    fontSize: '13px',
  },

  empty: {
    padding: '45px',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '13px',
  },

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
    overflowY: 'auto',
  },

  modal: {
    width: '100%',
    maxWidth: '520px',
    background: '#ffffff',
    borderRadius: '14px',
    boxShadow: '0 20px 50px rgba(15, 23, 42, 0.25)',
    overflow: 'hidden',
  },

  modalHeader: {
    padding: '20px 22px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  modalTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#172033',
  },

  closeButton: {
    border: 'none',
    background: 'transparent',
    color: '#64748b',
    fontSize: '22px',
    cursor: 'pointer',
    lineHeight: 1,
  },

  modalBody: {
    padding: '22px',
  },

  uploadBox: {
    border: '2px dashed #cbd5e1',
    borderRadius: '10px',
    padding: '28px 20px',
    textAlign: 'center',
    background: '#f8fafc',
  },

  uploadText: {
    margin: '0 0 8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#334155',
  },

  uploadHint: {
    margin: 0,
    fontSize: '12px',
    color: '#64748b',
  },

  fileName: {
    marginTop: '14px',
    padding: '10px',
    borderRadius: '7px',
    background: '#eff6ff',
    color: '#1d4ed8',
    fontSize: '12px',
    fontWeight: '600',
    wordBreak: 'break-word',
  },

  modalFooter: {
    padding: '16px 22px',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
}

function formatearMonto(valor) {
  if (valor === null || valor === undefined) {
    return '-'
  }

  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(Number(valor))
}

function formatearFecha(fecha) {
  if (!fecha) {
    return '-'
  }

  const partes = String(fecha).split('-')

  if (partes.length !== 3) {
    return fecha
  }

  return `${partes[2]}-${partes[1]}-${partes[0]}`
}

function nombreTipoDocumento(tipo) {
  const tipos = {
    30: 'Factura',
    32: 'Factura exenta',
    33: 'Factura electrónica',
    34: 'Factura exenta electrónica',
    35: 'Boleta',
    38: 'Boleta exenta',
    39: 'Boleta electrónica',
    40: 'Liquidación factura',
    41: 'Boleta exenta electrónica',
    43: 'Liquidación factura',
    45: 'Factura compra',
    46: 'Factura compra electrónica',
    50: 'Guía despacho',
    52: 'Guía despacho electrónica',
    55: 'Nota débito',
    56: 'Nota débito electrónica',
    60: 'Nota crédito',
    61: 'Nota crédito electrónica',
  }

  return tipos[tipo] || `Tipo ${tipo}`
}

export default function DocumentosView() {
  const [documentos, setDocumentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [filtroRut, setFiltroRut] = useState('')
  const [filtroRazonSocial, setFiltroRazonSocial] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroPeriodo, setFiltroPeriodo] = useState('')

  const [mostrarModal, setMostrarModal] = useState(false)
  const [archivo, setArchivo] = useState(null)
  const [importando, setImportando] = useState(false)

  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null)

  const inputArchivoRef = useRef(null)

  async function cargarDocumentos() {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`${API_URL}/api/documentos`)

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`)
      }

      const data = await response.json()

      setDocumentos(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)

      setError(
        'No fue posible cargar los documentos. Verifica que el backend esté ejecutándose.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDocumentos()
  }, [])

  function abrirModalImportacion() {
    setError('')
    setSuccess('')
    setArchivo(null)
    setMostrarModal(true)
  }

  function cerrarModalImportacion() {
    if (importando) {
      return
    }

    setMostrarModal(false)
    setArchivo(null)

    if (inputArchivoRef.current) {
      inputArchivoRef.current.value = ''
    }
  }

  function seleccionarArchivo(event) {
    const seleccionado = event.target.files?.[0]

    if (!seleccionado) {
      setArchivo(null)
      return
    }

    if (!seleccionado.name.toLowerCase().endsWith('.csv')) {
      setArchivo(null)
      setError('El archivo debe ser un CSV descargado desde el SII.')

      if (inputArchivoRef.current) {
        inputArchivoRef.current.value = ''
      }

      return
    }

    setError('')
    setSuccess('')
    setArchivo(seleccionado)
  }

  async function importarSII() {
    if (!archivo) {
      setError('Selecciona un archivo CSV antes de importar.')
      return
    }

    try {
      setImportando(true)
      setError('')
      setSuccess('')

      const formData = new FormData()

      formData.append('archivo', archivo)

      const response = await fetch(
        `${API_URL}/api/documentos/importar-sii`,
        {
          method: 'POST',
          body: formData,
        }
      )

      const data = await response.json()

      if (!response.ok) {
        const detalle =
          data?.detail ||
          'No fue posible importar el archivo SII.'

        throw new Error(detalle)
      }

      if (data.duplicado_archivo) {
        setSuccess(
          `El archivo ya había sido importado. No se duplicaron documentos. Importación #${data.importacion_id}.`
        )
      } else {
        setSuccess(
          `Archivo SII importado correctamente. ${data.documentos_importados} documentos importados, ${data.documentos_duplicados} duplicados y ${data.documentos_invalidos} inválidos.`
        )
      }

      setMostrarModal(false)
      setArchivo(null)

      if (inputArchivoRef.current) {
        inputArchivoRef.current.value = ''
      }

      await cargarDocumentos()
    } catch (err) {
      console.error(err)

      setError(
        err.message ||
          'Ocurrió un error al importar el archivo SII.'
      )
    } finally {
      setImportando(false)
    }
  }

  function abrirDetalle(documento) {
    setDocumentoSeleccionado(documento)
  }

  function cerrarDetalle() {
    setDocumentoSeleccionado(null)
  }

  const tiposDocumento = useMemo(() => {
    const tipos = [
      ...new Set(
        documentos.map((doc) => doc.tipo_documento)
      ),
    ]

    return tipos.sort((a, b) => Number(a) - Number(b))
  }, [documentos])

  const documentosFiltrados = useMemo(() => {
    return documentos.filter((doc) => {
      const rut = String(doc.rut_cliente || '').toLowerCase()

      const razonSocial = String(
        doc.razon_social || ''
      ).toLowerCase()

      const tipo = String(doc.tipo_documento || '')
      const fecha = String(doc.fecha_documento || '')

      const coincideRut = rut.includes(
        filtroRut.toLowerCase().trim()
      )

      const coincideRazon = razonSocial.includes(
        filtroRazonSocial.toLowerCase().trim()
      )

      const coincideTipo =
        !filtroTipo ||
        tipo === String(filtroTipo)

      const coincidePeriodo =
        !filtroPeriodo ||
        fecha.startsWith(filtroPeriodo)

      return (
        coincideRut &&
        coincideRazon &&
        coincideTipo &&
        coincidePeriodo
      )
    })
  }, [
    documentos,
    filtroRut,
    filtroRazonSocial,
    filtroTipo,
    filtroPeriodo,
  ])

  return (
    <main style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            Documentos
          </h1>

          <p style={styles.description}>
            Documentos tributarios importados desde el SII.
          </p>
        </div>

        <div style={styles.headerButtons}>
          <button
            type="button"
            style={styles.secondaryButton}
            onClick={cargarDocumentos}
            disabled={loading}
          >
            ↻ Actualizar
          </button>

          <button
            type="button"
            style={styles.primaryButton}
            onClick={abrirModalImportacion}
          >
            + Importar SII
          </button>
        </div>
      </div>

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {success && (
        <div style={styles.success}>
          {success}
        </div>
      )}

      <section style={styles.filters}>
        <input
          type="text"
          placeholder="RUT cliente"
          value={filtroRut}
          onChange={(e) => setFiltroRut(e.target.value)}
          style={styles.input}
        />

        <input
          type="text"
          placeholder="Razón social"
          value={filtroRazonSocial}
          onChange={(e) =>
            setFiltroRazonSocial(e.target.value)
          }
          style={styles.input}
        />

        <select
          value={filtroTipo}
          onChange={(e) =>
            setFiltroTipo(e.target.value)
          }
          style={styles.input}
        >
          <option value="">
            Todos los tipos
          </option>

          {tiposDocumento.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo} — {nombreTipoDocumento(tipo)}
            </option>
          ))}
        </select>

        <input
          type="month"
          value={filtroPeriodo}
          onChange={(e) =>
            setFiltroPeriodo(e.target.value)
          }
          style={styles.input}
        />
      </section>

      <section style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <h2 style={styles.tableTitle}>
            Documentos tributarios
          </h2>

          <span style={styles.count}>
            {loading
              ? 'Cargando...'
              : `${documentosFiltrados.length} de ${documentos.length} documentos`}
          </span>
        </div>

        {loading ? (
          <div style={styles.loading}>
            Cargando documentos...
          </div>
        ) : documentosFiltrados.length === 0 ? (
          <div style={styles.empty}>
            No existen documentos que coincidan con los filtros.
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Fecha</th>
                  <th style={styles.th}>Tipo</th>
                  <th style={styles.th}>Folio</th>
                  <th style={styles.th}>RUT cliente</th>
                  <th style={styles.th}>Razón social</th>
                  <th style={styles.th}>Neto</th>
                  <th style={styles.th}>IVA</th>
                  <th style={styles.th}>Total</th>
                </tr>
              </thead>

              <tbody>
                {documentosFiltrados.map((doc) => (
                  <tr
                    key={doc.id}
                    onClick={() => abrirDetalle(doc)}
                    style={{
                      cursor: 'pointer',
                      background: '#ffffff',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        '#f8fafc'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        '#ffffff'
                    }}
                  >
                    <td style={styles.td}>
                      {formatearFecha(
                        doc.fecha_documento
                      )}
                    </td>

                    <td style={styles.td}>
                      <span style={styles.documentType}>
                        {doc.tipo_documento}
                      </span>
                    </td>

                    <td style={styles.td}>
                      {doc.folio}
                    </td>

                    <td style={styles.td}>
                      {doc.rut_cliente}
                    </td>

                    <td style={styles.td}>
                      <span style={styles.customer}>
                        {doc.razon_social || '-'}
                      </span>
                    </td>

                    <td
                      style={{
                        ...styles.td,
                        ...styles.amount,
                      }}
                    >
                      {formatearMonto(
                        doc.monto_neto
                      )}
                    </td>

                    <td
                      style={{
                        ...styles.td,
                        ...styles.amount,
                      }}
                    >
                      {formatearMonto(
                        doc.monto_iva
                      )}
                    </td>

                    <td
                      style={{
                        ...styles.td,
                        ...styles.amount,
                      }}
                    >
                      {formatearMonto(
                        doc.monto_total
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* MODAL IMPORTACIÓN SII */}
      {mostrarModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                Importar documentos SII
              </h2>

              <button
                type="button"
                style={styles.closeButton}
                onClick={cerrarModalImportacion}
                disabled={importando}
              >
                ×
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.uploadBox}>
                <p style={styles.uploadText}>
                  Selecciona el archivo RCV del SII
                </p>

                <p style={styles.uploadHint}>
                  Formato permitido: CSV
                </p>

                <div style={{ marginTop: '18px' }}>
                  <input
                    ref={inputArchivoRef}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={seleccionarArchivo}
                    disabled={importando}
                  />
                </div>

                {archivo && (
                  <div style={styles.fileName}>
                    Archivo seleccionado: {archivo.name}
                  </div>
                )}
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                type="button"
                style={styles.secondaryButton}
                onClick={cerrarModalImportacion}
                disabled={importando}
              >
                Cancelar
              </button>

              <button
                type="button"
                style={styles.primaryButton}
                onClick={importarSII}
                disabled={!archivo || importando}
              >
                {importando
                  ? 'Importando...'
                  : 'Importar archivo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE DEL DOCUMENTO */}
      {documentoSeleccionado && (
        <div style={styles.modalOverlay}>
          <div
            style={{
              ...styles.modal,
              maxWidth: '760px',
            }}
          >
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>
                  {nombreTipoDocumento(
                    documentoSeleccionado.tipo_documento
                  )}
                </h2>

                <div
                  style={{
                    marginTop: '5px',
                    color: '#64748b',
                    fontSize: '12px',
                  }}
                >
                  Folio #{documentoSeleccionado.folio}
                </div>
              </div>

              <button
                type="button"
                style={styles.closeButton}
                onClick={cerrarDetalle}
              >
                ×
              </button>
            </div>

            <div style={styles.modalBody}>

              {/* INFORMACIÓN DEL DOCUMENTO */}
              <section
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  marginBottom: '18px',
                }}
              >
                <div
                  style={{
                    padding: '12px 15px',
                    background: '#f8fafc',
                    borderBottom: '1px solid #e5e7eb',
                    fontWeight: '700',
                    fontSize: '13px',
                    color: '#172033',
                  }}
                >
                  Información del documento
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      '1fr 1fr',
                  }}
                >
                  <div
                    style={{
                      padding: '12px 15px',
                      borderBottom:
                        '1px solid #f1f5f9',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#64748b',
                      }}
                    >
                      Tipo de documento
                    </div>

                    <div
                      style={{
                        marginTop: '4px',
                        fontWeight: '600',
                      }}
                    >
                      {documentoSeleccionado.tipo_documento}{' '}
                      —{' '}
                      {nombreTipoDocumento(
                        documentoSeleccionado.tipo_documento
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '12px 15px',
                      borderBottom:
                        '1px solid #f1f5f9',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#64748b',
                      }}
                    >
                      Folio
                    </div>

                    <div
                      style={{
                        marginTop: '4px',
                        fontWeight: '600',
                      }}
                    >
                      {documentoSeleccionado.folio}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '12px 15px',
                      borderBottom:
                        '1px solid #f1f5f9',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#64748b',
                      }}
                    >
                      RUT emisor
                    </div>

                    <div
                      style={{
                        marginTop: '4px',
                        fontWeight: '600',
                      }}
                    >
                      {documentoSeleccionado.rut_empresa}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '12px 15px',
                      borderBottom:
                        '1px solid #f1f5f9',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#64748b',
                      }}
                    >
                      Fecha documento
                    </div>

                    <div
                      style={{
                        marginTop: '4px',
                        fontWeight: '600',
                      }}
                    >
                      {formatearFecha(
                        documentoSeleccionado.fecha_documento
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '12px 15px',
                      borderBottom:
                        '1px solid #f1f5f9',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#64748b',
                      }}
                    >
                      RUT cliente
                    </div>

                    <div
                      style={{
                        marginTop: '4px',
                        fontWeight: '600',
                      }}
                    >
                      {documentoSeleccionado.rut_cliente}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '12px 15px',
                      borderBottom:
                        '1px solid #f1f5f9',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#64748b',
                      }}
                    >
                      Razón social
                    </div>

                    <div
                      style={{
                        marginTop: '4px',
                        fontWeight: '600',
                      }}
                    >
                      {documentoSeleccionado.razon_social ||
                        '-'}
                    </div>
                  </div>
                </div>
              </section>

              {/* MONTOS */}
              <section
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  marginBottom: '18px',
                }}
              >
                <div
                  style={{
                    padding: '12px 15px',
                    background: '#f8fafc',
                    borderBottom:
                      '1px solid #e5e7eb',
                    fontWeight: '700',
                    fontSize: '13px',
                  }}
                >
                  Montos
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      '1fr 1fr 1fr',
                  }}
                >
                  <div
                    style={{
                      padding: '15px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#64748b',
                      }}
                    >
                      Neto
                    </div>

                    <div
                      style={{
                        marginTop: '5px',
                        fontSize: '16px',
                        fontWeight: '700',
                      }}
                    >
                      {formatearMonto(
                        documentoSeleccionado.monto_neto
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '15px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#64748b',
                      }}
                    >
                      IVA
                    </div>

                    <div
                      style={{
                        marginTop: '5px',
                        fontSize: '16px',
                        fontWeight: '700',
                      }}
                    >
                      {formatearMonto(
                        documentoSeleccionado.monto_iva
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '15px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#64748b',
                      }}
                    >
                      Total
                    </div>

                    <div
                      style={{
                        marginTop: '5px',
                        fontSize: '18px',
                        fontWeight: '800',
                        color: '#172033',
                      }}
                    >
                      {formatearMonto(
                        documentoSeleccionado.monto_total
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* CONCILIACIÓN */}
              <section
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  padding: '15px',
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#172033',
                    marginBottom: '10px',
                  }}
                >
                  Conciliación
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent:
                      'space-between',
                    gap: '15px',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'inline-block',
                        padding: '5px 9px',
                        borderRadius: '6px',
                        background: '#fef3c7',
                        color: '#92400e',
                        fontSize: '11px',
                        fontWeight: '700',
                      }}
                    >
                      Pendiente
                    </div>

                    <div
                      style={{
                        marginTop: '8px',
                        color: '#64748b',
                        fontSize: '12px',
                      }}
                    >
                      Este documento todavía no tiene
                      pagos asociados.
                    </div>
                  </div>

                  <button
                    type="button"
                    style={{
                      ...styles.primaryButton,
                      opacity: 0.65,
                      cursor: 'not-allowed',
                    }}
                    disabled
                  >
                    Conciliar pago
                  </button>
                </div>

                <div
                  style={{
                    marginTop: '18px',
                    padding: '14px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    color: '#64748b',
                    fontSize: '12px',
                  }}
                >
                  <strong
                    style={{
                      color: '#334155',
                    }}
                  >
                    Pagos asociados
                  </strong>

                  <div
                    style={{
                      marginTop: '6px',
                    }}
                  >
                    Sin pagos asociados.
                  </div>
                </div>
              </section>
            </div>

            <div style={styles.modalFooter}>
              <button
                type="button"
                style={styles.secondaryButton}
                onClick={cerrarDetalle}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}