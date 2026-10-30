import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const ESTADOS_REVISION = [
  { valor: 'EN_REVISION', nombre: 'En revisión' },
  { valor: 'APROBADO', nombre: 'Aprobado' },
  { valor: 'OBSERVADO', nombre: 'Observado' },
  { valor: 'RECHAZADO', nombre: 'Rechazado' },
  { valor: 'VENCIDO', nombre: 'Vencido' },
]

function textoEstado(estado) {
  if (!estado) return 'PENDIENTE'
  return estado.replaceAll('_', ' ')
}

export default function RevisionDocumentoCredito({
  evaluacionId,
  documento,
  nombreDocumento,
  onClose,
  onGuardado,
}) {
  const [estadoRevision, setEstadoRevision] = useState(
    documento?.estado_revision || 'RECIBIDO'
  )
  const [observaciones, setObservaciones] = useState(
    documento?.observaciones || ''
  )
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  async function guardarRevision() {
    if (!documento?.documento_id) {
      setError('No se encontró el documento que se desea revisar.')
      return
    }

    try {
      setGuardando(true)
      setError('')

      const response = await fetch(
        `${API_URL}/api/evaluaciones-credito/${evaluacionId}/documentos/${documento.documento_id}/revision`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            estado_revision: estadoRevision,
            observaciones: observaciones.trim() || null,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          typeof data?.detail === 'string'
            ? data.detail
            : 'No fue posible guardar la revisión.'
        )
      }

      onGuardado(data)
      onClose()
    } catch (error) {
      console.error(error)
      setError(error.message || 'No fue posible guardar la revisión.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      <div style={styles.overlay} onClick={onClose}>
        <div
          style={styles.modal}
          onClick={(event) => event.stopPropagation()}
        >
          <div style={styles.header}>
            <div>
              <div style={styles.label}>DOCUMENTACIÓN</div>
              <h3 style={styles.title}>Revisar documento</h3>
              <p style={styles.description}>
                Registra el resultado de la revisión del antecedente.
              </p>
            </div>

            <button
              type="button"
              style={styles.closeButton}
              onClick={onClose}
              disabled={guardando}
            >
              ×
            </button>
          </div>

          <div style={styles.body}>
            <div style={styles.documentCard}>
              <span style={styles.documentLabel}>Documento</span>
              <strong style={styles.documentName}>
                {nombreDocumento}
              </strong>
              <span style={styles.documentId}>
                Documento #{documento.documento_id}
              </span>
            </div>

            <label style={styles.fieldLabel}>
              Estado de revisión
              <select
                value={estadoRevision}
                onChange={(event) => setEstadoRevision(event.target.value)}
                style={styles.input}
                disabled={guardando}
              >
                {documento.estado_revision === 'RECIBIDO' && (
                  <option value="RECIBIDO">Recibido</option>
                )}

                {ESTADOS_REVISION.map((estado) => (
                  <option key={estado.valor} value={estado.valor}>
                    {estado.nombre}
                  </option>
                ))}
              </select>
            </label>

            <div style={styles.currentState}>
              Estado actual:{' '}
              <strong>{textoEstado(documento.estado_revision)}</strong>
            </div>

            <label style={styles.fieldLabel}>
              Observaciones
              <textarea
                value={observaciones}
                onChange={(event) => setObservaciones(event.target.value)}
                placeholder="Indica el resultado de la revisión, observaciones o motivos..."
                style={styles.textarea}
                rows={5}
                disabled={guardando}
              />
            </label>

            {error && <div style={styles.error}>{error}</div>}
          </div>

          <div style={styles.footer}>
            <button
              type="button"
              style={styles.secondaryButton}
              onClick={onClose}
              disabled={guardando}
            >
              Cancelar
            </button>

            <button
              type="button"
              style={styles.primaryButton}
              onClick={guardarRevision}
              disabled={guardando}
            >
              {guardando ? 'Guardando...' : 'Guardar revisión'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    zIndex: 1000,
  },

  modal: {
    width: '100%',
    maxWidth: '560px',
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 20px 60px rgba(15, 23, 42, 0.18)',
    overflow: 'hidden',
  },

  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '20px',
    padding: '20px 22px',
    borderBottom: '1px solid #e5e7eb',
  },

  label: {
    color: '#64748b',
    fontSize: '9px',
    fontWeight: '800',
    letterSpacing: '0.8px',
    marginBottom: '5px',
  },

  title: {
    margin: 0,
    color: '#172033',
    fontSize: '18px',
    fontWeight: '750',
  },

  description: {
    margin: '5px 0 0',
    color: '#64748b',
    fontSize: '11px',
  },

  closeButton: {
    width: '30px',
    height: '30px',
    borderRadius: '7px',
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    color: '#64748b',
    fontSize: '20px',
    lineHeight: 1,
    cursor: 'pointer',
  },

  body: {
    padding: '20px 22px',
  },

  documentCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    padding: '13px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    marginBottom: '18px',
  },

  documentLabel: {
    color: '#64748b',
    fontSize: '9px',
  },

  documentName: {
    color: '#172033',
    fontSize: '12px',
  },

  documentId: {
    color: '#94a3b8',
    fontSize: '10px',
  },

  fieldLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
    color: '#334155',
    fontSize: '11px',
    fontWeight: '700',
    marginBottom: '14px',
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 11px',
    border: '1px solid #cbd5e1',
    borderRadius: '7px',
    background: '#ffffff',
    color: '#172033',
    fontSize: '12px',
  },

  textarea: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 11px',
    border: '1px solid #cbd5e1',
    borderRadius: '7px',
    background: '#ffffff',
    color: '#172033',
    fontSize: '12px',
    resize: 'vertical',
    fontFamily: 'inherit',
  },

  currentState: {
    margin: '-4px 0 15px',
    color: '#64748b',
    fontSize: '10px',
  },

  error: {
    padding: '10px 12px',
    borderRadius: '7px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    fontSize: '11px',
  },

  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '9px',
    padding: '15px 22px',
    background: '#f8fafc',
    borderTop: '1px solid #e5e7eb',
  },

  secondaryButton: {
    border: '1px solid #cbd5e1',
    borderRadius: '7px',
    background: '#ffffff',
    color: '#334155',
    padding: '9px 14px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
  },

  primaryButton: {
    border: 'none',
    borderRadius: '7px',
    background: '#111827',
    color: '#ffffff',
    padding: '9px 14px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
  },
}
