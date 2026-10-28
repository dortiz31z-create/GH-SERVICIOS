

import { useCallback, useEffect, useMemo, useState } from 'react'



const API_URL = 'http://localhost:8000'



const colores = {

  fondo: '#f5f7fb',

  tarjeta: '#ffffff',

  texto: '#172033',

  secundario: '#64748b',

  borde: '#e2e8f0',

  azul: '#2563eb',

  verde: '#15803d',

  naranja: '#b45309',

  rojo: '#b91c1c',

}



const formatoCLP = (valor) =>

  new Intl.NumberFormat('es-CL', {

    style: 'currency',

    currency: 'CLP',

    maximumFractionDigits: 0,

  }).format(Number(valor ?? 0))



const formatoFecha = (fecha) => {

  if (!fecha) return '—'



  const [anio, mes, dia] = String(fecha).slice(0, 10).split('-')



  return dia && mes && anio ? `${dia}/${mes}/${anio}` : '—'

}



const normalizar = (valor) =>

  String(valor ?? '')

    .normalize('NFD')

    .replace(/[\u0300-\u036f]/g, '')

    .toLowerCase()



const estadoPago = (estado) => {

  const valor = normalizar(estado).replace(/[\s-]+/g, '_')



  if (

    ['conciliado', 'conciliada', 'aplicado', 'aplicada'].includes(valor)

  ) {

    return {

      texto: 'Conciliado',

      fondo: '#dcfce7',

      color: '#166534',

    }

  }



  if (

    ['en_revision', 'revision', 'en_revision_manual'].includes(valor)

  ) {

    return {

      texto: 'En revisión',

      fondo: '#fef3c7',

      color: '#92400e',

    }

  }



  return {

    texto: 'Pendiente',

    fondo: '#dbeafe',

    color: '#1d4ed8',

  }

}



const panel = {

  background: colores.tarjeta,

  border: `1px solid ${colores.borde}`,

  borderRadius: 14,

  padding: 20,

  minWidth: 0,

}



const boton = {

  border: `1px solid ${colores.borde}`,

  background: '#fff',

  color: colores.texto,

  borderRadius: 9,

  padding: '10px 14px',

  cursor: 'pointer',

  fontWeight: 600,

}



const campo = {

  width: '100%',

  minWidth: 0,

  boxSizing: 'border-box',

  border: `1px solid ${colores.borde}`,

  borderRadius: 9,

  padding: '11px 12px',

  background: '#fff',

  color: colores.texto,

  fontSize: 13,

}



function Indicador({ titulo, valor, detalle, color, icono }) {

  return (

    <article

      style={{

        ...panel,

        display: 'flex',

        alignItems: 'flex-start',

        justifyContent: 'space-between',

        gap: 12,

      }}

    >

      <div style={{ minWidth: 0 }}>

        <div

          style={{

            color: colores.secundario,

            fontSize: 13,

            marginBottom: 12,

          }}

        >

          {titulo}

        </div>



        <div

          style={{

            color: colores.texto,

            fontSize: 27,

            fontWeight: 750,

            letterSpacing: '-0.7px',

            overflowWrap: 'anywhere',

          }}

        >

          {valor}

        </div>



        <div

          style={{

            color: colores.secundario,

            fontSize: 12,

            marginTop: 8,

          }}

        >

          {detalle}

        </div>

      </div>



      <div

        aria-hidden="true"

        style={{

          width: 42,

          height: 42,

          flexShrink: 0,

          borderRadius: 12,

          display: 'grid',

          placeItems: 'center',

          background: `${color}14`,

          color,

          fontSize: 21,

          fontWeight: 700,

        }}

      >

        {icono}

      </div>

    </article>

  )

}



export default function ConciliacionView() {

  const [pagos, setPagos] = useState([])

  const [pagoSeleccionado, setPagoSeleccionado] = useState(null)

  const [propuestas, setPropuestas] = useState([])



  const [busqueda, setBusqueda] = useState('')

  const [filtroEstado, setFiltroEstado] = useState('todos')

  const [fechaDesde, setFechaDesde] = useState('')

  const [fechaHasta, setFechaHasta] = useState('')



  const [cargandoPagos, setCargandoPagos] = useState(true)

  const [cargandoPropuestas, setCargandoPropuestas] = useState(false)

  const [error, setError] = useState('')

  const [mensajeExito, setMensajeExito] = useState('')
  const [aceptandoPropuesta, setAceptandoPropuesta] = useState(false)
  const [propuestaPendienteConfirmacion, setPropuestaPendienteConfirmacion] = useState(null)



  const cerrarModal = useCallback(() => {

    setPagoSeleccionado(null)

    setPropuestas([])

    setCargandoPropuestas(false)
    setPropuestaPendienteConfirmacion(null)

  }, [])



  const cargarPagos = useCallback(async () => {

    setCargandoPagos(true)

    setError('')



    try {

      const respuesta = await fetch(`${API_URL}/api/pagos`)



      if (!respuesta.ok) {

        throw new Error(

          `No se pudieron cargar los pagos (${respuesta.status}).`

        )

      }



      const datos = await respuesta.json()



      setPagos(Array.isArray(datos) ? datos : [])

    } catch (e) {

      setError(

        `${e.message} Comprueba que el backend esté funcionando.`

      )

    } finally {

      setCargandoPagos(false)

    }

  }, [])



  useEffect(() => {

    cargarPagos()

  }, [cargarPagos])



  *// Permitir cerrar el modal con la tecla Escape.*

  useEffect(() => {

    if (!pagoSeleccionado) return undefined



    const manejarTecla = (evento) => {

      if (evento.key === 'Escape') {
        if (propuestaPendienteConfirmacion) {
          setPropuestaPendienteConfirmacion(null)
        } else {
          cerrarModal()
        }
      }

    }



    window.addEventListener('keydown', manejarTecla)



    return () => {

      window.removeEventListener('keydown', manejarTecla)

    }

  }, [pagoSeleccionado, propuestaPendienteConfirmacion, cerrarModal])



  const pagosFiltrados = useMemo(() => {

    return pagos.filter((pago) => {

      const texto = normalizar(

        [

          pago.pago_id,

          pago.rut_pagador_detectado,

          pago.nombre_pagador_detectado,

          pago.descripcion,

          pago.estado,

        ].join(' ')

      )



      const coincideBusqueda = texto.includes(normalizar(busqueda))

      const estado = estadoPago(pago.estado).texto.toLowerCase()



      const coincideEstado =

        filtroEstado === 'todos' ||

        (filtroEstado === 'pendiente' && estado === 'pendiente') ||

        (filtroEstado === 'revision' && estado === 'en revisión') ||

        (filtroEstado === 'conciliado' && estado === 'conciliado')



      const fecha = String(pago.fecha_pago ?? '').slice(0, 10)



      const coincideDesde =

        !fechaDesde || (fecha && fecha >= fechaDesde)



      const coincideHasta =

        !fechaHasta || (fecha && fecha <= fechaHasta)



      return (

        coincideBusqueda &&

        coincideEstado &&

        coincideDesde &&

        coincideHasta

      )

    })

  }, [pagos, busqueda, filtroEstado, fechaDesde, fechaHasta])



  const indicadores = useMemo(() => {

    const pendientes = pagos.filter(

      (p) => estadoPago(p.estado).texto === 'Pendiente'

    )



    const revision = pagos.filter(

      (p) => estadoPago(p.estado).texto === 'En revisión'

    )



    const conciliados = pagos.filter(

      (p) => estadoPago(p.estado).texto === 'Conciliado'

    )



    return {

      pendientes: pendientes.length,

      montoPendiente: pendientes.reduce(

        (total, p) => total + Number(p.monto_pago ?? 0),

        0

      ),

      revision: revision.length,

      conciliados: conciliados.length,

    }

  }, [pagos])



  const verPropuestas = async (pago) => {

    setPagoSeleccionado(pago)

    setPropuestas([])

    setError('')

    setCargandoPropuestas(true)



    try {

      const respuesta = await fetch(

        `${API_URL}/api/pagos/${pago.pago_id}/propuestas-conciliacion`

      )



      if (!respuesta.ok) {

        throw new Error(

          `No se pudieron cargar las propuestas (${respuesta.status}).`

        )

      }



      const datos = await respuesta.json()



      setPropuestas(

        Array.isArray(datos.propuestas) ? datos.propuestas : []

      )

    } catch (e) {

      setError(e.message)

    } finally {

      setCargandoPropuestas(false)

    }

  }



  const nombreClientePropuesta = (propuesta) =>
    propuesta?.cliente_nombre ||
    propuesta?.documentos?.find((doc) => doc.razon_social)?.razon_social ||
    ''

  const rutClientePropuesta = (propuesta) =>
    propuesta?.rut_cliente ||
    propuesta?.documentos?.find((doc) => doc.rut_cliente)?.rut_cliente ||
    ''

  const abrirConfirmacion = (propuesta) => {
    const documentos = propuesta.documentos || []
    const total = documentos.reduce(
      (suma, doc) => suma + Number(doc.saldo_pendiente || 0),
      0
    )

    if (
      Math.round(total) !==
      Math.round(Number(pagoSeleccionado?.monto_pago || 0))
    ) {
      setError(
        'No se puede continuar: el total de los documentos debe coincidir exactamente con el pago recibido.'
      )
      return
    }

    setError('')
    setPropuestaPendienteConfirmacion(propuesta)
  }

  const aceptarPropuesta = async (propuesta) => {

    if (!pagoSeleccionado || aceptandoPropuesta) return



    const documentos = propuesta.documentos || []

    const total = documentos.reduce(

      (suma, doc) => suma + Number(doc.saldo_pendiente || 0),

      0

    )



    if (Math.round(total) !== Math.round(Number(pagoSeleccionado.monto_pago))) {

      setError(

        'No se puede aceptar: el total de los saldos de las facturas debe coincidir exactamente con el pago recibido.'

      )

      return

    }



    setError('')
    setMensajeExito('')

    setAceptandoPropuesta(true)

    setError('')

    setMensajeExito('')



    try {

      const respuesta = await fetch(

        `${API_URL}/api/pagos/${pagoSeleccionado.pago_id}/aceptar-propuesta`,

        {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({

            cliente_id: propuesta.cliente_id,

            documentos: documentos.map((doc) => ({

              documento_id: doc.documento_id,

              monto_aplicado: Number(doc.saldo_pendiente),

            })),

            observaciones: 'Propuesta aceptada manualmente desde conciliación bancaria.',

          }),

        }

      )



      const resultado = await respuesta.json()



      if (!respuesta.ok) {

        throw new Error(

          resultado.detail || 'No se pudo registrar la conciliación.'

        )

      }



      setMensajeExito(
        resultado.mensaje || 'Conciliación registrada correctamente.'
      )
      setPropuestaPendienteConfirmacion(null)
      cerrarModal()
      await cargarPagos()

    } catch (e) {

      setError(e.message)

    } finally {

      setAceptandoPropuesta(false)

    }

  }



  return (

    <div

      style={{

        width: '100%',

        maxWidth: 1500,

        margin: '0 auto',

        padding: '4px 0 28px',

        color: colores.texto,

        boxSizing: 'border-box',

      }}

    >

      {/* Encabezado */}

      <header

        style={{

          display: 'flex',

          justifyContent: 'space-between',

          alignItems: 'center',

          gap: 16,

          flexWrap: 'wrap',

          marginBottom: 22,

        }}

      >

        <div>

          <div

            style={{

              color: colores.azul,

              fontSize: 12,

              fontWeight: 700,

              marginBottom: 7,

            }}

          >

            GESTIÓN FINANCIERA

          </div>



          <h2

            style={{

              fontSize: 26,

              margin: 0,

              letterSpacing: '-0.7px',

            }}

          >

            Conciliación bancaria

          </h2>



          <p

            style={{

              color: colores.secundario,

              fontSize: 14,

              margin: '8px 0 0',

            }}

          >

            Revisa los pagos recibidos y encuentra sus posibles documentos SII.

          </p>

        </div>



        <button

          type="button"

          style={{

            ...boton,

            background: colores.azul,

            borderColor: colores.azul,

            color: '#fff',

          }}

          onClick={cargarPagos}

          disabled={cargandoPagos}

        >

          {cargandoPagos ? 'Actualizando…' : '↻ Actualizar datos'}

        </button>

      </header>



      {/* Mensaje de error */}

      {error && (

        <div

          role="alert"

          style={{

            background: '#fef2f2',

            border: '1px solid #fecaca',

            color: '#991b1b',

            borderRadius: 10,

            padding: 14,

            marginBottom: 18,

          }}

        >

          {error}

        </div>

      )}



      {mensajeExito && (
        <div
          role="status"
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            borderRadius: 10,
            padding: 14,
            marginBottom: 18,
          }}
        >
          {mensajeExito}
        </div>
      )}

      {/* Indicadores */}

      <div

        style={{

          display: 'grid',

          gridTemplateColumns:

            'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',

          gap: 14,

          marginBottom: 22,

        }}

      >

        <Indicador

          titulo="Pagos pendientes"

          valor={cargandoPagos ? '—' : indicadores.pendientes}

          detalle="Registros por revisar"

          color="#2563eb"

          icono="◷"

        />



        <Indicador

          titulo="Monto pendiente"

          valor={

            cargandoPagos

              ? '—'

              : formatoCLP(indicadores.montoPendiente)

          }

          detalle="Suma de pagos pendientes"

          color="#b45309"

          icono="$"

        />



        <Indicador

          titulo="En revisión"

          valor={cargandoPagos ? '—' : indicadores.revision}

          detalle="Pagos en revisión manual"

          color="#7c3aed"

          icono="⌕"

        />



        <Indicador

          titulo="Conciliados"

          valor={cargandoPagos ? '—' : indicadores.conciliados}

          detalle="Pagos con estado conciliado"

          color="#15803d"

          icono="✓"

        />

      </div>



      {/* Aviso de seguridad */}

      <div

        style={{

          display: 'flex',

          alignItems: 'flex-start',

          gap: 10,

          padding: 14,

          background: '#eff6ff',

          border: '1px solid #bfdbfe',

          color: '#1e40af',

          borderRadius: 11,

          fontSize: 13,

          lineHeight: 1.6,

          marginBottom: 22,

        }}

      >

        <span style={{ fontSize: 18 }} aria-hidden="true">

          ⓘ

        </span>



        <div>

          <strong>Revisión manual:</strong> las coincidencias son propuestas.

          Consultarlas no confirma la conciliación ni modifica los saldos de las facturas.

        </div>

      </div>



      {/* Tabla principal */}

      <section style={panel}>

        <div

          style={{

            display: 'flex',

            justifyContent: 'space-between',

            alignItems: 'center',

            flexWrap: 'wrap',

            gap: 12,

            marginBottom: 18,

          }}

        >

          <div>

            <h3 style={{ margin: 0, fontSize: 18 }}>

              Pagos recibidos

            </h3>



            <p

              style={{

                margin: '6px 0 0',

                fontSize: 13,

                color: colores.secundario,

              }}

            >

              {cargandoPagos

                ? 'Cargando registros…'

                : `${pagosFiltrados.length} de ${pagos.length} pagos`}

            </p>

          </div>

        </div>



        {/* Filtros */}

        <div

          style={{

            display: 'grid',

            gridTemplateColumns:

              'repeat(auto-fit, minmax(min(100%, 190px), 1fr))',

            gap: 12,

            marginBottom: 18,

          }}

        >

          <label

            style={{

              display: 'block',

              fontSize: 12,

              color: colores.secundario,

            }}

          >

            Buscar pago



            <input

              style={{ ...campo, marginTop: 6 }}

              value={busqueda}

              onChange={(e) => setBusqueda(e.target.value)}

              placeholder="RUT, pagador, descripción o ID…"

            />

          </label>



          <label

            style={{

              display: 'block',

              fontSize: 12,

              color: colores.secundario,

            }}

          >

            Estado



            <select

              style={{ ...campo, marginTop: 6 }}

              value={filtroEstado}

              onChange={(e) => setFiltroEstado(e.target.value)}

            >

              <option value="todos">Todos los estados</option>

              <option value="pendiente">Pendientes</option>

              <option value="revision">En revisión</option>

              <option value="conciliado">Conciliados</option>

            </select>

          </label>



          <label

            style={{

              display: 'block',

              fontSize: 12,

              color: colores.secundario,

            }}

          >

            Desde



            <input

              type="date"

              style={{ ...campo, marginTop: 6 }}

              value={fechaDesde}

              onChange={(e) => setFechaDesde(e.target.value)}

            />

          </label>



          <label

            style={{

              display: 'block',

              fontSize: 12,

              color: colores.secundario,

            }}

          >

            Hasta



            <input

              type="date"

              style={{ ...campo, marginTop: 6 }}

              value={fechaHasta}

              min={fechaDesde || undefined}

              onChange={(e) => setFechaHasta(e.target.value)}

            />

          </label>

        </div>



        {(busqueda ||

          filtroEstado !== 'todos' ||

          fechaDesde ||

          fechaHasta) && (

          <div style={{ marginBottom: 14 }}>

            <button

              type="button"

              style={{ ...boton, fontSize: 12 }}

              onClick={() => {

                setBusqueda('')

                setFiltroEstado('todos')

                setFechaDesde('')

                setFechaHasta('')

              }}

            >

              Limpiar filtros

            </button>

          </div>

        )}



        {cargandoPagos ? (

          <p style={{ color: colores.secundario }}>

            Cargando pagos desde el servidor…

          </p>

        ) : pagos.length === 0 ? (

          <div style={{ textAlign: 'center', padding: '42px 12px' }}>

            <div style={{ fontSize: 32, marginBottom: 12 }}>▤</div>



            <h4 style={{ margin: '0 0 8px' }}>

              Todavía no hay pagos registrados

            </h4>



            <p style={{ color: colores.secundario, fontSize: 13 }}>

              Revisa la importación bancaria y el proceso de creación de pagos.

            </p>

          </div>

        ) : pagosFiltrados.length === 0 ? (

          <div

            style={{

              textAlign: 'center',

              padding: '32px 12px',

              color: colores.secundario,

            }}

          >

            No hay pagos que coincidan con los filtros seleccionados.

          </div>

        ) : (

          <div style={{ overflowX: 'auto' }}>

            <table

              style={{

                width: '100%',

                borderCollapse: 'separate',

                borderSpacing: 0,

                fontSize: 13,

                whiteSpace: 'nowrap',

              }}

            >

              <thead>

                <tr style={{ background: '#f8fafc' }}>

                  {[

                    'Pago',

                    'Fecha',

                    'Pagador / descripción',

                    'RUT detectado',

                    'Monto',

                    'Estado',

                    '',

                  ].map((titulo, i) => (

                    <th

                      key={`${titulo}-${i}`}

                      style={{

                        textAlign: i === 4 ? 'right' : 'left',

                        padding: '13px 12px',

                        borderTop: `1px solid ${colores.borde}`,

                        borderBottom: `1px solid ${colores.borde}`,

                        color: colores.secundario,

                        fontSize: 11,

                        textTransform: 'uppercase',

                        letterSpacing: '.4px',

                        fontWeight: 700,

                      }}

                    >

                      {titulo}

                    </th>

                  ))}

                </tr>

              </thead>



              <tbody>

                {pagosFiltrados.map((pago) => {

                  const estado = estadoPago(pago.estado)

                  const seleccionado =

                    pagoSeleccionado?.pago_id === pago.pago_id



                  return (

                    <tr key={pago.pago_id}>

                      <td style={celdaTabla(seleccionado)}>

                        <strong>#{pago.pago_id}</strong>

                      </td>



                      <td style={celdaTabla(seleccionado)}>

                        {formatoFecha(pago.fecha_pago)}

                      </td>



                      <td

                        style={{

                          ...celdaTabla(seleccionado),

                          minWidth: 230,

                          whiteSpace: 'normal',

                        }}

                      >

                        <div

                          style={{

                            fontWeight: 650,

                            color: colores.texto,

                          }}

                        >

                          {pago.nombre_pagador_detectado ||

                            'Pagador sin identificar'}

                        </div>



                        <div

                          style={{

                            color: colores.secundario,

                            fontSize: 11,

                            marginTop: 4,

                            maxWidth: 300,

                            overflowWrap: 'anywhere',

                          }}

                        >

                          {pago.descripcion || 'Sin descripción bancaria'}

                        </div>

                      </td>



                      <td style={celdaTabla(seleccionado)}>

                        {pago.rut_pagador_detectado || '—'}

                      </td>



                      <td

                        style={{

                          ...celdaTabla(seleccionado),

                          textAlign: 'right',

                          fontWeight: 700,

                          fontVariantNumeric: 'tabular-nums',

                        }}

                      >

                        {formatoCLP(pago.monto_pago)}

                      </td>



                      <td style={celdaTabla(seleccionado)}>

                        <span

                          style={{

                            display: 'inline-block',

                            borderRadius: 20,

                            padding: '5px 9px',

                            fontSize: 11,

                            fontWeight: 700,

                            background: estado.fondo,

                            color: estado.color,

                          }}

                        >

                          {estado.texto}

                        </span>

                      </td>



                      <td style={celdaTabla(seleccionado)}>

                        <button

                          type="button"

                          style={{

                            ...boton,

                            padding: '8px 11px',

                            fontSize: 12,

                            borderColor: seleccionado

                              ? colores.azul

                              : colores.borde,

                            color: seleccionado

                              ? colores.azul

                              : colores.texto,

                          }}

                          onClick={() => verPropuestas(pago)}

                        >

                          Ver propuestas →

                        </button>

                      </td>

                    </tr>

                  )

                })}

              </tbody>

            </table>

          </div>

        )}

      </section>



      {/* Modal de propuestas */}

      {pagoSeleccionado && (

        <div

          role="presentation"

          onMouseDown={(e) => {

            if (e.target === e.currentTarget) {

              cerrarModal()

            }

          }}

          style={{

            position: 'fixed',

            inset: 0,

            zIndex: 9999,

            background: 'rgba(15, 23, 42, 0.58)',

            backdropFilter: 'blur(3px)',

            display: 'flex',

            alignItems: 'center',

            justifyContent: 'center',

            padding: 20,

            boxSizing: 'border-box',

          }}

        >

          <section

            role="dialog"

            aria-modal="true"

            aria-labelledby="titulo-modal-conciliacion"

            style={{

              width: '100%',

              maxWidth: 1050,

              maxHeight: '90vh',

              overflowY: 'auto',

              background: '#fff',

              borderRadius: 16,

              boxShadow: '0 25px 80px rgba(0,0,0,.25)',

              padding: 24,

              boxSizing: 'border-box',

            }}

          >

            <header

              style={{

                display: 'flex',

                justifyContent: 'space-between',

                alignItems: 'flex-start',

                gap: 16,

                borderBottom: `1px solid ${colores.borde}`,

                paddingBottom: 18,

                marginBottom: 20,

              }}

            >

              <div>

                <div

                  style={{

                    color: colores.azul,

                    fontSize: 11,

                    fontWeight: 700,

                  }}

                >

                  ANÁLISIS DEL PAGO

                </div>



                <h2

                  id="titulo-modal-conciliacion"

                  style={{

                    margin: '7px 0',

                    fontSize: 23,

                    color: colores.texto,

                  }}

                >

                  Pago #{pagoSeleccionado.pago_id}

                </h2>



                <div

                  style={{

                    color: colores.secundario,

                    fontSize: 13,

                  }}

                >

                  {formatoFecha(pagoSeleccionado.fecha_pago)} ·{' '}

                  {pagoSeleccionado.nombre_pagador_detectado ||

                    'Pagador sin identificar'}

                </div>

              </div>



              <button

                type="button"

                aria-label="Cerrar propuestas"

                onClick={cerrarModal}

                style={{

                  border: `1px solid ${colores.borde}`,

                  background: '#fff',

                  borderRadius: 9,

                  width: 38,

                  height: 38,

                  fontSize: 22,

                  cursor: 'pointer',

                  color: '#475569',

                  flexShrink: 0,

                }}

              >

                ×

              </button>

            </header>



            {/* Datos del pago */}

            <div

              style={{

                display: 'grid',

                gridTemplateColumns:

                  'repeat(auto-fit, minmax(min(100%, 230px), 1fr))',

                gap: 14,

                marginBottom: 18,

              }}

            >

              <div

                style={{

                  background: '#eff6ff',

                  padding: 16,

                  borderRadius: 11,

                }}

              >

                <div style={{ color: '#1d4ed8', fontSize: 12 }}>

                  Monto recibido

                </div>



                <div

                  style={{

                    fontSize: 25,

                    fontWeight: 750,

                    color: '#1d4ed8',

                    marginTop: 6,

                  }}

                >

                  {formatoCLP(pagoSeleccionado.monto_pago)}

                </div>

              </div>



              <div

                style={{

                  background: '#f8fafc',

                  padding: 16,

                  borderRadius: 11,

                }}

              >

                <div style={{ color: '#64748b', fontSize: 12 }}>

                  RUT detectado

                </div>



                <div

                  style={{

                    fontSize: 17,

                    fontWeight: 650,

                    marginTop: 9,

                  }}

                >

                  {pagoSeleccionado.rut_pagador_detectado ||

                    'Sin identificar'}

                </div>

              </div>

            </div>



            <div

              style={{

                padding: 14,

                background: '#f8fafc',

                border: `1px solid ${colores.borde}`,

                borderRadius: 10,

                fontSize: 13,

                overflowWrap: 'anywhere',

                marginBottom: 22,

              }}

            >

              <strong>Descripción bancaria:</strong>{' '}

              {pagoSeleccionado.descripcion || 'Sin descripción'}

            </div>



            <h3 style={{ margin: '0 0 6px', fontSize: 18 }}>

              Posibles facturas asociadas

            </h3>



            <p

              style={{

                margin: '0 0 18px',

                color: colores.secundario,

                fontSize: 13,

              }}

            >

              Compara los folios, saldos y diferencias antes de decidir.

            </p>



            {cargandoPropuestas ? (

              <div

                style={{

                  padding: 35,

                  textAlign: 'center',

                  color: colores.secundario,

                }}

              >

                Buscando coincidencias…

              </div>

            ) : propuestas.length === 0 ? (

              <div

                style={{

                  padding: 28,

                  textAlign: 'center',

                  border: '1px dashed #cbd5e1',

                  borderRadius: 11,

                  color: colores.secundario,

                  fontSize: 13,

                }}

              >

                No se encontraron propuestas para este pago. Puede requerir revisión manual.

              </div>

            ) : (

              <div style={{ display: 'grid', gap: 16 }}>

                {propuestas.map((propuesta, indice) => (

                  <article

                    key={`${propuesta.cliente_id}-${indice}-${(

                      propuesta.documentos || []

                    )

                      .map((d) => d.documento_id)

                      .join('-')}`}

                    style={{

                      border: `1px solid ${colores.borde}`,

                      borderRadius: 12,

                      padding: 17,

                    }}

                  >

                    <div

                      style={{

                        display: 'flex',

                        justifyContent: 'space-between',

                        alignItems: 'flex-start',

                        gap: 12,

                        flexWrap: 'wrap',

                        marginBottom: 14,

                      }}

                    >

                      <div>

                        <div

                          style={{

                            color: colores.azul,

                            fontSize: 11,

                            fontWeight: 700,

                          }}

                        >

                          PROPUESTA {indice + 1}

                        </div>



                        <h4 style={{ margin: '6px 0', fontSize: 16 }}>

                          {propuesta.cliente_nombre ||

                            'Cliente por identificar'}

                        </h4>



                        <div

                          style={{

                            color: colores.secundario,

                            fontSize: 12,

                          }}

                        >

                          RUT: {rutClientePropuesta(propuesta) || 'Pendiente de verificar'}

                        </div>

                      </div>



                      <span

                        style={{

                          background: '#f1f5f9',

                          padding: '6px 10px',

                          borderRadius: 20,

                          fontSize: 11,

                          fontWeight: 700,

                        }}

                      >

                        {propuesta.nivel_propuesta || 'Revisar'}

                      </span>

                    </div>



                    <div style={{ overflowX: 'auto' }}>

                      <table

                        style={{

                          width: '100%',

                          borderCollapse: 'collapse',

                          fontSize: 12,

                          minWidth: 520,

                        }}

                      >

                        <thead>

                          <tr style={{ background: '#f8fafc' }}>

                            {[

                              'Tipo',

                              'Folio',

                              'Fecha',

                              'Total',

                              'Saldo pendiente',

                            ].map((titulo) => (

                              <th

                                key={titulo}

                                style={{

                                  textAlign: 'left',

                                  padding: 11,

                                  borderBottom: `1px solid ${colores.borde}`,

                                  color: colores.secundario,

                                }}

                              >

                                {titulo}

                              </th>

                            ))}

                          </tr>

                        </thead>



                        <tbody>

                          {(propuesta.documentos || []).map((doc) => (

                            <tr key={doc.documento_id}>

                              <td style={celdaModal}>

                                {doc.tipo_documento || '—'}

                              </td>



                              <td

                                style={{

                                  ...celdaModal,

                                  fontWeight: 700,

                                }}

                              >

                                {doc.folio || '—'}

                              </td>



                              <td style={celdaModal}>

                                {formatoFecha(doc.fecha_documento)}

                              </td>



                              <td

                                style={{

                                  ...celdaModal,

                                  whiteSpace: 'nowrap',

                                }}

                              >

                                {formatoCLP(doc.monto_total)}

                              </td>



                              <td

                                style={{

                                  ...celdaModal,

                                  whiteSpace: 'nowrap',

                                }}

                              >

                                {formatoCLP(doc.saldo_pendiente)}

                              </td>

                            </tr>

                          ))}

                        </tbody>

                      </table>

                    </div>



                    <div

                      style={{

                        display: 'flex',

                        justifyContent: 'space-between',

                        gap: 18,

                        flexWrap: 'wrap',

                        background: '#f8fafc',

                        padding: 14,

                        borderRadius: 9,

                        marginTop: 13,

                      }}

                    >

                      <div>

                        <div

                          style={{

                            color: colores.secundario,

                            fontSize: 12,

                          }}

                        >

                          Total propuesto

                        </div>



                        <strong

                          style={{

                            display: 'block',

                            marginTop: 5,

                          }}

                        >

                          {formatoCLP(propuesta.total_documentos)}

                        </strong>

                      </div>



                      <div>

                        <div

                          style={{

                            color: colores.secundario,

                            fontSize: 12,

                          }}

                        >

                          Diferencia

                        </div>



                        <strong

                          style={{

                            display: 'block',

                            marginTop: 5,

                            color:

                              Number(propuesta.diferencia_abs) === 0

                                ? colores.verde

                                : colores.naranja,

                          }}

                        >

                          {formatoCLP(propuesta.diferencia)}

                        </strong>

                      </div>

                    </div>



                    <p

                      style={{

                        fontSize: 11,

                        lineHeight: 1.5,

                        color: colores.secundario,

                        margin: '12px 0 0',

                      }}

                    >

                      Sugerencia pendiente de validación humana. Esta pantalla no aplica pagos.

                    </p>


                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 12,
                        flexWrap: 'wrap',
                        marginTop: 16,
                        paddingTop: 14,
                        borderTop: `1px solid ${colores.borde}`,
                      }}
                    >
                      {Math.round(Number(propuesta.total_documentos || 0)) !==
                      Math.round(Number(pagoSeleccionado.monto_pago || 0)) ? (
                        <span style={{ color: '#b45309', fontSize: 12 }}>
                          No se puede aceptar: el total de las facturas no coincide
                          con el pago recibido.
                        </span>
                      ) : (
                        <span style={{ color: '#15803d', fontSize: 12 }}>
                          El total coincide con el pago. Revisa los documentos antes de confirmar.
                        </span>
                      )}

                      <button
                        type="button"
                        disabled={
                          aceptandoPropuesta ||
                          Math.round(Number(propuesta.total_documentos || 0)) !==
                            Math.round(Number(pagoSeleccionado.monto_pago || 0))
                        }
                        onClick={() => abrirConfirmacion(propuesta)}
                        style={{
                          ...boton,
                          background:
                            aceptandoPropuesta ||
                            Math.round(Number(propuesta.total_documentos || 0)) !==
                              Math.round(Number(pagoSeleccionado.monto_pago || 0))
                              ? '#94a3b8'
                              : '#2563eb',
                          color: '#fff',
                          padding: '10px 16px',
                          cursor:
                            aceptandoPropuesta ||
                            Math.round(Number(propuesta.total_documentos || 0)) !==
                              Math.round(Number(pagoSeleccionado.monto_pago || 0))
                              ? 'not-allowed'
                              : 'pointer',
                        }}
                      >
                        {aceptandoPropuesta ? 'Registrando...' : 'Revisar y confirmar'}
                      </button>
                    </div>
</article>



                ))}







              </div>

            )}



            {/* Pie del modal */}

            <footer

              style={{

                display: 'flex',

                justifyContent: 'space-between',

                alignItems: 'center',

                gap: 12,

                flexWrap: 'wrap',

                borderTop: `1px solid ${colores.borde}`,

                marginTop: 22,

                paddingTop: 17,

              }}

            >

              <span

                style={{

                  color: colores.secundario,

                  fontSize: 12,

                }}

              >

                Las propuestas requieren validación humana.

              </span>



              <button

                type="button"

                onClick={cerrarModal}

                style={{

                  ...boton,

                  padding: '10px 18px',

                }}

              >

                Cerrar

              </button>

            </footer>

          </section>

        </div>

      )}

      {propuestaPendienteConfirmacion && pagoSeleccionado && (() => {
        const propuesta = propuestaPendienteConfirmacion
        const documentos = propuesta.documentos || []
        const total = documentos.reduce(
          (suma, doc) => suma + Number(doc.saldo_pendiente || 0),
          0
        )
        const clienteNombre = nombreClientePropuesta(propuesta)
        const clienteRut = rutClientePropuesta(propuesta)
        const clienteVinculado = Boolean(
          propuesta.cliente_id && clienteNombre.trim() && clienteRut.trim()
        )
        const montoCoincide =
          Math.round(total) ===
          Math.round(Number(pagoSeleccionado.monto_pago || 0))

        return (
          <div
            role="presentation"
            onMouseDown={(evento) => {
              if (evento.target === evento.currentTarget && !aceptandoPropuesta) {
                setPropuestaPendienteConfirmacion(null)
              }
            }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10001,
              background: 'rgba(15, 23, 42, 0.68)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 18,
              boxSizing: 'border-box',
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="titulo-confirmacion-conciliacion"
              style={{
                width: '100%',
                maxWidth: 640,
                maxHeight: '90vh',
                overflowY: 'auto',
                background: colores.tarjeta,
                border: `1px solid ${colores.borde}`,
                borderRadius: 18,
                boxShadow: '0 28px 90px rgba(0,0,0,.30)',
                padding: 24,
                boxSizing: 'border-box',
              }}
            >
              <header
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 13,
                  paddingBottom: 18,
                  borderBottom: `1px solid ${colores.borde}`,
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    width: 46,
                    height: 46,
                    flexShrink: 0,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: 13,
                    background: '#dbeafe',
                    color: colores.azul,
                    fontSize: 23,
                    fontWeight: 800,
                  }}
                >
                  ✓
                </div>
                <div style={{ flex: 1 }}>
                  <h2
                    id="titulo-confirmacion-conciliacion"
                    style={{ margin: 0, fontSize: 20, color: colores.texto }}
                  >
                    Confirmar conciliación bancaria
                  </h2>
                  <p style={{ margin: '5px 0 0', color: colores.secundario, fontSize: 12 }}>
                    Revisión final antes de registrar la aplicación
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Cerrar confirmación"
                  disabled={aceptandoPropuesta}
                  onClick={() => setPropuestaPendienteConfirmacion(null)}
                  style={{ ...boton, padding: '7px 11px' }}
                >
                  ×
                </button>
              </header>

              {error && (
                <div
                  role="alert"
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    borderRadius: 10,
                    padding: 12,
                    marginTop: 14,
                    fontSize: 12,
                  }}
                >
                  {error}
                </div>
              )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 12,
                  marginTop: 18,
                }}
              >
                <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: 12, padding: 15 }}>
                  <div style={{ color: colores.secundario, fontSize: 12 }}>Pago bancario</div>
                  <strong style={{ display: 'block', fontSize: 20, marginTop: 5 }}>
                    #{pagoSeleccionado.pago_id}
                  </strong>
                  <div style={{ color: colores.secundario, fontSize: 12, marginTop: 4 }}>
                    {formatoFecha(pagoSeleccionado.fecha_pago)}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', border: `1px solid ${colores.borde}`, borderRadius: 12, padding: 15 }}>
                  <div style={{ color: colores.secundario, fontSize: 12 }}>Monto recibido</div>
                  <strong style={{ display: 'block', color: colores.azul, fontSize: 22, marginTop: 5 }}>
                    {formatoCLP(pagoSeleccionado.monto_pago)}
                  </strong>
                  <div style={{ color: colores.secundario, fontSize: 12, marginTop: 4 }}>CLP</div>
                </div>
              </div>

              <div style={{ border: `1px solid ${colores.borde}`, borderRadius: 12, padding: 15, marginTop: 14 }}>
                <div style={{ color: colores.secundario, fontSize: 12, marginBottom: 7 }}>
                  Cliente asociado a las facturas
                </div>
                <strong style={{ display: 'block', fontSize: 15 }}>
                  {clienteNombre || 'Cliente pendiente de identificación'}
                </strong>
                <div style={{ color: colores.secundario, fontSize: 12, marginTop: 5 }}>
                  RUT: {clienteRut || 'Pendiente de verificar'}
                </div>
              </div>

              <div style={{ border: `1px solid ${colores.borde}`, borderRadius: 12, padding: 15, marginTop: 14 }}>
                <strong style={{ display: 'block', marginBottom: 12 }}>Documentos que se aplicarán</strong>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                        <th style={celdaModal}>Tipo</th>
                        <th style={celdaModal}>Folio</th>
                        <th style={{ ...celdaModal, textAlign: 'right' }}>Saldo a aplicar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documentos.map((doc) => (
                        <tr key={doc.documento_id}>
                          <td style={celdaModal}>{doc.tipo_documento || '—'}</td>
                          <td style={{ ...celdaModal, fontWeight: 700 }}>{doc.folio || '—'}</td>
                          <td style={{ ...celdaModal, textAlign: 'right', whiteSpace: 'nowrap' }}>
                            {formatoCLP(doc.saldo_pendiente)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={2} style={{ ...celdaModal, fontWeight: 700 }}>Total propuesto</td>
                        <td style={{ ...celdaModal, fontWeight: 800, textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {formatoCLP(total)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${colores.borde}` }}>
                  <span style={{ color: colores.secundario, fontSize: 12 }}>Diferencia respecto al pago</span>
                  <strong style={{ color: montoCoincide ? colores.verde : colores.rojo }}>
                    {formatoCLP(Number(pagoSeleccionado.monto_pago) - total)}
                  </strong>
                </div>
              </div>

              {!clienteVinculado && (
                <div
                  role="alert"
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                    background: '#fff7ed',
                    border: '1px solid #fed7aa',
                    color: '#9a3412',
                    borderRadius: 11,
                    padding: 13,
                    marginTop: 14,
                    fontSize: 12,
                    lineHeight: 1.5,
                  }}
                >
                  <strong style={{ fontSize: 16 }}>!</strong>
                  <span>
                    Esta propuesta no está vinculada a una ficha de cliente identificada en GH SERVICIOS.
                    Debes asociar el cliente correcto antes de registrar la conciliación. No se modificará ningún saldo.
                  </span>
                </div>
              )}

              {!montoCoincide && (
                <div role="alert" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: 11, padding: 13, marginTop: 12, fontSize: 12 }}>
                  El total de los documentos no coincide con el pago. Resuelve la diferencia antes de continuar.
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', color: colores.secundario, fontSize: 12, lineHeight: 1.5, marginTop: 15 }}>
                <span style={{ color: colores.azul, fontWeight: 800 }}>i</span>
                <span>
                  Al confirmar se registrará la aplicación y se actualizarán los saldos de los documentos indicados.
                  Esta operación requiere tu autorización explícita.
                </span>
              </div>

              <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap', borderTop: `1px solid ${colores.borde}`, marginTop: 20, paddingTop: 18 }}>
                <button
                  type="button"
                  disabled={aceptandoPropuesta}
                  onClick={() => setPropuestaPendienteConfirmacion(null)}
                  style={{ ...boton, padding: '11px 17px' }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={aceptandoPropuesta || !montoCoincide || !clienteVinculado}
                  onClick={() => aceptarPropuesta(propuesta)}
                  style={{
                    ...boton,
                    background: aceptandoPropuesta || !montoCoincide || !clienteVinculado ? '#94a3b8' : colores.azul,
                    borderColor: aceptandoPropuesta || !montoCoincide || !clienteVinculado ? '#94a3b8' : colores.azul,
                    color: '#fff',
                    padding: '11px 17px',
                    cursor: aceptandoPropuesta || !montoCoincide || !clienteVinculado ? 'not-allowed' : 'pointer',
                  }}
                >
                  {aceptandoPropuesta ? 'Registrando conciliación…' : 'Confirmar conciliación'}
                </button>
              </footer>
            </section>
          </div>
        )
      })()}

    </div>

  )

}



function celdaTabla(seleccionado) {

  return {

    padding: '14px 12px',

    borderBottom: `1px solid ${colores.borde}`,

    background: seleccionado ? '#eff6ff' : '#fff',

    verticalAlign: 'middle',

  }

}



const celdaModal = {

  padding: 11,

  borderBottom: `1px solid ${colores.borde}`,

}
