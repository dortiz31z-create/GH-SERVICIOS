import { useEffect, useState } from 'react'

import DocumentosView from './components/DocumentosView'

import EvaluacionesCredito from './components/EvaluacionesCredito'


const API_URL = 'http://localhost:8000'


const formularioInicial = {

  rut: '',

  razon_social: '',

  nombre_fantasia: '',

  giro: '',

  direccion: '',

  comuna: '',

  ciudad: '',

  telefono: '',

  email: '',

}


function App() {

  const [vista, setVista] = useState('dashboard')


  const [dashboard, setDashboard] = useState({

    clientes: 0,

    documentos: 0,

    pagos_pendientes: 0,

    movimientos: 0,

  })


  const [clientes, setClientes] = useState([])

  const [mostrarFormulario, setMostrarFormulario] = useState(false)


  useEffect(() => {

    cargarDashboard()

    cargarClientes()

  }, [])


  async function cargarDashboard() {

    try {

      const response = await fetch(`${API_URL}/api/dashboard`)

      const data = await response.json()

      setDashboard(data)

    } catch (error) {

      console.error('Error cargando dashboard:', error)

    }

  }


  async function cargarClientes() {

    try {

      const response = await fetch(`${API_URL}/api/clientes`)

      const data = await response.json()

      setClientes(data)

    } catch (error) {

      console.error('Error cargando clientes:', error)

    }

  }


  function cambiarVista(nuevaVista) {

    setVista(nuevaVista)

    setMostrarFormulario(false)

  }


  return (

    <div style={styles.app}>


      {/* SIDEBAR */}

      <aside style={styles.sidebar}>


        <div style={styles.logo}>

          <div style={styles.logoMark}>GH</div>


          <div>

            <div style={styles.logoTitle}>

              GH SERVICIOS

            </div>


            <div style={styles.logoSubtitle}>

              Gestión y conciliación

            </div>
</div>

        </div>


        <nav style={styles.nav}>


          <div

            style={{

              ...styles.navItem,

              ...(vista === 'dashboard'

                ? styles.navItemActive

                : {}),

            }}

            onClick={() => cambiarVista('dashboard')}

         >

            <span>⌂</span>

            Dashboard

          </div>


          <div

            style={{

              ...styles.navItem,

              ...(vista === 'clientes'

                ? styles.navItemActive

                : {}),

            }}

            onClick={() => cambiarVista('clientes')}

         >

            <span>👥</span>

            Clientes

          </div>


          <div

            style={{

              ...styles.navItem,

              ...(vista === 'documentos'

                ? styles.navItemActive

                : {}),

            }}

            onClick={() => cambiarVista('documentos')}

         >

            <span>🧾</span>

            Documentos

          </div>


          <div

            style={styles.navItem}

            onClick={() => cambiarVista('pagos')}

         >

            <span>💰</span>

            Pagos

          </div>


          <div

            style={styles.navItem}

            onClick={() => cambiarVista('bancos')}

         >

            <span>🏦</span>

            Bancos

          </div>


          <div

            style={styles.navItem}

            onClick={() => cambiarVista('conciliacion')}

         >

            <span>↔</span>

            Conciliación

          </div>

          <div
            style={{
              ...styles.navItem,
              ...(vista === 'credito'
                ? styles.navItemActive
                : {}),
            }}
            onClick={() => cambiarVista('credito')}
          >
            <span>💳</span>
            Crédito
          </div>


        </nav>


        <div style={styles.sidebarBottom}>

          <div style={styles.systemLabel}>

            SISTEMA

          </div>


          <div style={styles.navItem}>

            <span>⚙</span>

            Configuración

          </div>

        </div>


      </aside>


      {/* CONTENIDO PRINCIPAL */}

      <main style={styles.main}>


        <header style={styles.header}>


          <div>

            <div style={styles.breadcrumb}>

              {vista === 'dashboard'

                ? 'Inicio'

                : 'Gestión'}

            </div>


            <h1 style={styles.title}>

              {vista === 'dashboard' && 'Dashboard'}

              {vista === 'clientes' && 'Clientes'}

              {vista === 'documentos' && 'Documentos'}

              {vista === 'pagos' && 'Pagos'}

              {vista === 'bancos' && 'Bancos'}

              {vista === 'conciliacion' && 'Conciliación'}
              {vista === 'credito' && 'Crédito'}

            </h1>

          </div>


          <div style={styles.user}>

            <div style={styles.avatar}>

              DO

            </div>


            <div>

              <div style={styles.userName}>

                Administrador

              </div>


              <div style={styles.userRole}>

                Gestor

              </div>

            </div>

          </div>


        </header>


        {/* DASHBOARD */}

        {vista === 'dashboard' && (

          <DashboardView

            dashboard={dashboard}

          />

        )}


        {/* CLIENTES */}

        {vista === 'clientes' && (

          <ClientesView

            clientes={clientes}

            mostrarFormulario={mostrarFormulario}

            setMostrarFormulario={setMostrarFormulario}

            cargarClientes={cargarClientes}

            cargarDashboard={cargarDashboard}

          />

        )}


        {/* DOCUMENTOS */}

        {vista === 'documentos' && (

          <DocumentosView />

        )}


        {/* FUTUROS MÓDULOS */}

        {vista === 'pagos' && (

          <ModuloProximamente

            titulo="Pagos"

            descripcion="Aquí gestionaremos los pagos recibidos y su estado de conciliación."

          />

        )}


        {vista === 'bancos' && (

          <ModuloProximamente

            titulo="Bancos"

            descripcion="Aquí gestionaremos las cuentas bancarias e importaciones de cartolas."

          />

        )}


        {vista === 'conciliacion' && (

          <ModuloProximamente

            titulo="Conciliación"

            descripcion="Aquí construiremos el proceso de conciliación entre pagos, movimientos bancarios y documentos SII."

          />

        )}

        {/* CRÉDITO */}
        {vista === 'credito' && (
          <EvaluacionesCredito />
        )}


      </main>

    </div>

  )

}


/* =========================================================*

*&#xA0;  DASHBOARD*

*========================================================= */


function DashboardView({ dashboard }) {

  return (

    <section style={styles.content}>


      <div style={styles.welcome}>


        <div>

          <h2 style={styles.welcomeTitle}>

            Bienvenido a GH Servicios

          </h2>


          <p style={styles.welcomeText}>

            Gestiona clientes, documentos, pagos y

            conciliaciones desde un solo lugar.

          </p>

        </div>


        <div style={styles.dateBox}>


          <div style={styles.dateLabel}>

            ESTADO DEL SISTEMA

          </div>


          <div style={styles.status}>

            <span style={styles.statusDot}></span>

            Operativo

          </div>


        </div>


      </div>


      <div style={styles.cards}>


        <DashboardCard

          title="Clientes"

          value={dashboard.clientes}

          description="Clientes registrados"

          icon="👥"

        />


        <DashboardCard

          title="Documentos"

          value={dashboard.documentos}

          description="Documentos tributarios"

          icon="🧾"

        />


        <DashboardCard

          title="Pagos pendientes"

          value={dashboard.pagos_pendientes}

          description="Pagos por conciliar"

          icon="💰"

        />


        <DashboardCard

          title="Movimientos"

          value={dashboard.movimientos}

          description="Movimientos bancarios"

          icon="🏦"

        />


      </div>


      <div style={styles.sectionHeader}>


        <div>

          <h2 style={styles.sectionTitle}>

            Conciliación bancaria

          </h2>


          <p style={styles.sectionDescription}>

            Estado general de los pagos y documentos.

          </p>

        </div>


        <button style={styles.primaryButton}>

          Ir a conciliación →

        </button>


      </div>


      <div style={styles.emptyState}>


        <div style={styles.emptyIcon}>

          ↔

        </div>


        <h3 style={styles.emptyTitle}>

          Todavía no hay conciliaciones

        </h3>


        <p style={styles.emptyText}>

          Cuando importemos movimientos bancarios y

          documentos SII, aquí podremos revisar y

          conciliar los pagos.

        </p>


      </div>


    </section>

  )

}


/* =========================================================*

*&#xA0;  CLIENTES*

*========================================================= */


function ClientesView({

  clientes,

  mostrarFormulario,

  setMostrarFormulario,

  cargarClientes,

  cargarDashboard,

}) {

  return (

    <section style={styles.content}>


      <div style={styles.pageHeader}>


        <div>

          <div style={styles.breadcrumb}>

            Gestión

          </div>


          <h2 style={styles.pageTitle}>

            Clientes

          </h2>


          <p style={styles.pageDescription}>

            Clientes registrados en GH Servicios.

          </p>

        </div>


        <button

          style={styles.primaryButton}

          onClick={() => setMostrarFormulario(true)}

       >

          + Nuevo cliente

        </button>


      </div>


      {mostrarFormulario && (

        <ClienteForm

          onCancel={() => setMostrarFormulario(false)}

          onSuccess={() => {

            cargarClientes()

            cargarDashboard()

            setMostrarFormulario(false)

          }}

        />

      )}


      <div style={styles.tableCard}>


        <div style={styles.tableHeader}>


          <div>

            <h3 style={styles.tableTitle}>

              Clientes registrados

            </h3>


            <p style={styles.tableDescription}>

              Empresas y organizaciones gestionadas por GH Servicios.

            </p>

          </div>


          <div style={styles.counter}>

            {clientes.length} clientes

          </div>


        </div>


        {clientes.length === 0 ? (


          <div style={styles.emptyState}>

            <div style={styles.emptyIcon}>

              👥

            </div>


            <h3 style={styles.emptyTitle}>

              No hay clientes registrados

            </h3>


            <p style={styles.emptyText}>

              Crea el primer cliente utilizando el botón

              Nuevo cliente.

            </p>

          </div>


        ) : (


          <div style={{ overflowX: 'auto' }}>


            <table style={styles.table}>


              <thead>

                <tr>

                  <th style={styles.th}>RUT</th>

                  <th style={styles.th}>RAZÓN SOCIAL</th>

                  <th style={styles.th}>GIRO</th>

                  <th style={styles.th}>CIUDAD</th>

                  <th style={styles.th}>ESTADO</th>

                </tr>

              </thead>


              <tbody>


                {clientes.map((cliente) => (

                  <tr key={cliente.id}>


                    <td style={styles.tdStrong}>

                      {cliente.rut}

                    </td>


                    <td style={styles.td}>

                      <div style={styles.clientName}>

                        {cliente.razon_social}

                      </div>


                      {cliente.nombre_fantasia && (

                        <div style={styles.clientFantasy}>

                          {cliente.nombre_fantasia}

                        </div>

                      )}

                    </td>


                    <td style={styles.td}>

                      {cliente.giro || '-'}

                    </td>


                    <td style={styles.td}>

                      {cliente.ciudad || '-'}

                    </td>


                    <td style={styles.td}>

                      <span style={styles.statusBadge}>

                        Activo

                      </span>

                    </td>


                  </tr>

                ))}


              </tbody>


            </table>


          </div>


        )}


      </div>


    </section>

  )

}


/* =========================================================*

*&#xA0;  FORMULARIO CLIENTE*

*========================================================= */


function ClienteForm({ onCancel, onSuccess }) {

  const [formulario, setFormulario] = useState(

    formularioInicial

  )


  const [guardando, setGuardando] = useState(false)

  const [error, setError] = useState('')


  function cambiarCampo(campo, valor) {

    setFormulario((actual) => ({

      ...actual,

      [campo]: valor,

    }))

  }


  async function guardarCliente(event) {

    event.preventDefault()


    setError('')


    if (!formulario.rut || !formulario.razon_social) {

      setError(

        'RUT y Razón social son campos obligatorios.'

      )

      return

    }


    setGuardando(true)


    try {

      const response = await fetch(

        `${API_URL}/api/clientes`,

        {

          method: 'POST',

          headers: {

            'Content-Type': 'application/json',

          },

          body: JSON.stringify(formulario),

        }

      )


      const data = await response.json()


      if (!response.ok || data.error) {

        setError(

          data.error ||

          'No fue posible crear el cliente.'

        )

        return

      }


      onSuccess()


    } catch (error) {

      console.error(error)


      setError(

        'No se pudo conectar con el servidor.'

      )


    } finally {

      setGuardando(false)

    }

  }


  return (

    <form

      style={styles.formCard}

      onSubmit={guardarCliente}

   >


      <div style={styles.formHeader}>


        <div>

          <h3 style={styles.formTitle}>

            Nuevo cliente

          </h3>


          <p style={styles.formDescription}>

            Ingresa los datos principales del cliente.

          </p>

        </div>


        <button

          type="button"

          style={styles.closeButton}

          onClick={onCancel}

       >

          ×

        </button>


      </div>


      {error && (

        <div style={styles.errorMessage}>

          {error}

        </div>

      )}


      <div style={styles.formGrid}>


        <FormField

          label="RUT *"

          value={formulario.rut}

          placeholder="Ej: 76123456-7"

          onChange={(value) =>

            cambiarCampo('rut', value)

          }

        />


        <FormField

          label="Razón social *"

          value={formulario.razon_social}

          placeholder="Ej: Empresa Servicios SpA"

          onChange={(value) =>

            cambiarCampo('razon_social', value)

          }

        />


        <FormField

          label="Nombre de fantasía"

          value={formulario.nombre_fantasia}

          placeholder="Nombre comercial"

          onChange={(value) =>

            cambiarCampo('nombre_fantasia', value)

          }

        />


        <FormField

          label="Giro"

          value={formulario.giro}

          placeholder="Actividad económica"

          onChange={(value) =>

            cambiarCampo('giro', value)

          }

        />


        <FormField

          label="Dirección"

          value={formulario.direccion}

          placeholder="Dirección"

          onChange={(value) =>

            cambiarCampo('direccion', value)

          }

        />


        <FormField

          label="Comuna"

          value={formulario.comuna}

          placeholder="Comuna"

          onChange={(value) =>

            cambiarCampo('comuna', value)

          }

        />


        <FormField

          label="Ciudad"

          value={formulario.ciudad}

          placeholder="Ciudad"

          onChange={(value) =>

            cambiarCampo('ciudad', value)

          }

        />


        <FormField

          label="Teléfono"

          value={formulario.telefono}

          placeholder="Teléfono"

          onChange={(value) =>

            cambiarCampo('telefono', value)

          }

        />


        <FormField

          label="Email"

          value={formulario.email}

          placeholder="correo@empresa.cl"

          onChange={(value) =>

            cambiarCampo('email', value)

          }

        />


      </div>


      <div style={styles.formFooter}>


        <button

          type="button"

          style={styles.cancelButton}

          onClick={onCancel}

          disabled={guardando}

       >

          Cancelar

        </button>


        <button

          type="submit"

          style={styles.primaryButton}

          disabled={guardando}

       >

          {guardando

            ? 'Guardando...'

            : 'Guardar cliente'}

        </button>


      </div>


    </form>

  )

}


/* =========================================================*

*&#xA0;  CAMPO FORMULARIO*

*========================================================= */


function FormField({

  label,

  value,

  placeholder,

  onChange,

}) {

  return (

    <div style={styles.formField}>


      <label style={styles.label}>

        {label}

      </label>


      <input

        style={styles.input}

        value={value}

        placeholder={placeholder}

        onChange={(event) =>

          onChange(event.target.value)

        }

      />


    </div>

  )

}


/* =========================================================*

*&#xA0;  MÓDULOS FUTUROS*

*========================================================= */


function ModuloProximamente({

  titulo,

  descripcion,

}) {

  return (

    <section style={styles.content}>


      <div style={styles.pageHeader}>


        <div>

          <div style={styles.breadcrumb}>

            Gestión

          </div>


          <h2 style={styles.pageTitle}>

            {titulo}

          </h2>


          <p style={styles.pageDescription}>

            {descripcion}

          </p>

        </div>


      </div>


      <div style={styles.emptyState}>


        <div style={styles.emptyIcon}>

          ⚙

        </div>


        <h3 style={styles.emptyTitle}>

          Módulo en construcción

        </h3>


        <p style={styles.emptyText}>

          Esta sección será desarrollada en los

          siguientes pasos del sistema.

        </p>


      </div>


    </section>

  )

}


/* =========================================================*

*&#xA0;  COMPONENTE TARJETA DASHBOARD*

*========================================================= */


function DashboardCard({

  title,

  value,

  description,

  icon,

}) {

  return (

    <div style={styles.card}>


      <div style={styles.cardTop}>


        <div style={styles.cardIcon}>

          {icon}

        </div>


        <span style={styles.cardArrow}>

          ↗

        </span>


      </div>


      <div style={styles.cardValue}>

        {value}

      </div>


      <div style={styles.cardTitle}>

        {title}

      </div>


      <div style={styles.cardDescription}>

        {description}

      </div>


    </div>

  )

}


/* =========================================================*

*&#xA0;  ESTILOS*

*========================================================= */


const styles = {


  app: {

    minHeight: '100vh',

    display: 'flex',

    background: '#f5f7fa',

    color: '#172033',

    fontFamily:

      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

  },


  sidebar: {

    width: '250px',

    minHeight: '100vh',

    background: '#111827',

    color: '#ffffff',

    display: 'flex',

    flexDirection: 'column',

    padding: '24px 16px',

    boxSizing: 'border-box',

    flexShrink: 0,

  },


  logo: {

    display: 'flex',

    alignItems: 'center',

    gap: '12px',

    padding: '4px 10px 28px',

    borderBottom: '1px solid #293244',

  },


  logoMark: {

    width: '42px',

    height: '42px',

    borderRadius: '10px',

    background: '#2563eb',

    display: 'flex',

    alignItems: 'center',

    justifyContent: 'center',

    fontWeight: '800',

    fontSize: '15px',

  },


  logoTitle: {

    fontSize: '14px',

    fontWeight: '800',

    letterSpacing: '0.5px',

  },


  logoSubtitle: {

    marginTop: '3px',

    color: '#9ca3af',

    fontSize: '11px',

  },


  nav: {

    marginTop: '28px',

    display: 'flex',

    flexDirection: 'column',

    gap: '6px',

  },


  navItem: {

    display: 'flex',

    alignItems: 'center',

    gap: '12px',

    padding: '12px 13px',

    borderRadius: '8px',

    color: '#cbd5e1',

    fontSize: '14px',

    fontWeight: '500',

    cursor: 'pointer',

  },


  navItemActive: {

    background: '#2563eb',

    color: '#ffffff',

  },


  sidebarBottom: {

    marginTop: 'auto',

  },


  systemLabel: {

    color: '#6b7280',

    fontSize: '10px',

    fontWeight: '700',

    letterSpacing: '1px',

    padding: '0 13px 8px',

  },


  main: {

    flex: 1,

    minWidth: 0,

  },


  header: {

    height: '82px',

    background: '#ffffff',

    borderBottom: '1px solid #e5e7eb',

    display: 'flex',

    alignItems: 'center',

    justifyContent: 'space-between',

    padding: '0 36px',

    boxSizing: 'border-box',

  },


  breadcrumb: {

    color: '#94a3b8',

    fontSize: '12px',

    marginBottom: '3px',

  },


  title: {

    margin: 0,

    fontSize: '24px',

    fontWeight: '700',

  },


  user: {

    display: 'flex',

    alignItems: 'center',

    gap: '10px',

  },


  avatar: {

    width: '38px',

    height: '38px',

    borderRadius: '50%',

    background: '#e0e7ff',

    color: '#3730a3',

    display: 'flex',

    alignItems: 'center',

    justifyContent: 'center',

    fontSize: '12px',

    fontWeight: '700',

  },


  userName: {

    fontSize: '13px',

    fontWeight: '600',

  },


  userRole: {

    fontSize: '11px',

    color: '#94a3b8',

    marginTop: '2px',

  },


  content: {

    padding: '30px 32px 50px',

    width: '100%',

    boxSizing: 'border-box',

  },


  welcome: {

    background: '#ffffff',

    border: '1px solid #e5e7eb',

    borderRadius: '12px',

    padding: '26px 28px',

    display: 'flex',

    alignItems: 'center',

    justifyContent: 'space-between',

    marginBottom: '24px',

  },


  welcomeTitle: {

    margin: 0,

    fontSize: '20px',

    fontWeight: '700',

  },


  welcomeText: {

    margin: '7px 0 0',

    color: '#64748b',

    fontSize: '13px',

  },


  dateBox: {

    paddingLeft: '30px',

    borderLeft: '1px solid #e5e7eb',

  },


  dateLabel: {

    color: '#94a3b8',

    fontSize: '10px',

    fontWeight: '700',

    letterSpacing: '0.8px',

    marginBottom: '7px',

  },


  status: {

    display: 'flex',

    alignItems: 'center',

    gap: '7px',

    fontSize: '13px',

    fontWeight: '600',

  },


  statusDot: {

    width: '8px',

    height: '8px',

    borderRadius: '50%',

    background: '#22c55e',

  },


  cards: {

    display: 'grid',

    gridTemplateColumns:

      'repeat(4, minmax(0, 1fr))',

    gap: '18px',

    marginBottom: '34px',

  },


  card: {

    background: '#ffffff',

    border: '1px solid #e5e7eb',

    borderRadius: '12px',

    padding: '20px',

  },


  cardTop: {

    display: 'flex',

    justifyContent: 'space-between',

    alignItems: 'center',

  },


  cardIcon: {

    width: '38px',

    height: '38px',

    borderRadius: '9px',

    background: '#eff6ff',

    display: 'flex',

    alignItems: 'center',

    justifyContent: 'center',

    fontSize: '17px',

  },


  cardArrow: {

    color: '#94a3b8',

    fontSize: '15px',

  },


  cardValue: {

    marginTop: '18px',

    fontSize: '28px',

    fontWeight: '750',

  },


  cardTitle: {

    marginTop: '4px',

    fontSize: '14px',

    fontWeight: '650',

  },


  cardDescription: {

    marginTop: '5px',

    color: '#94a3b8',

    fontSize: '11px',

  },


  sectionHeader: {

    display: 'flex',

    alignItems: 'center',

    justifyContent: 'space-between',

    marginBottom: '15px',

  },


  sectionTitle: {

    margin: 0,

    fontSize: '17px',

  },


  sectionDescription: {

    margin: '5px 0 0',

    color: '#94a3b8',

    fontSize: '12px',

  },


  pageHeader: {

    display: 'flex',

    justifyContent: 'space-between',

    alignItems: 'flex-end',

    marginBottom: '22px',

  },


  pageTitle: {

    margin: 0,

    fontSize: '25px',

    fontWeight: '750',

  },


  pageDescription: {

    margin: '7px 0 0',

    color: '#94a3b8',

    fontSize: '13px',

  },


  primaryButton: {

    border: 'none',

    borderRadius: '7px',

    background: '#2563eb',

    color: '#ffffff',

    padding: '11px 16px',

    fontSize: '12px',

    fontWeight: '650',

    cursor: 'pointer',

  },


  formCard: {

    background: '#ffffff',

    border: '1px solid #dce3ed',

    borderRadius: '12px',

    padding: '24px',

    marginBottom: '20px',

  },


  formHeader: {

    display: 'flex',

    justifyContent: 'space-between',

    alignItems: 'flex-start',

    marginBottom: '22px',

  },


  formTitle: {

    margin: 0,

    fontSize: '17px',

    fontWeight: '700',

  },


  formDescription: {

    margin: '6px 0 0',

    color: '#94a3b8',

    fontSize: '12px',

  },


  closeButton: {

    border: 'none',

    borderRadius: '7px',

    background: '#f1f5f9',

    color: '#64748b',

    width: '32px',

    height: '32px',

    cursor: 'pointer',

    fontSize: '20px',

  },


  formGrid: {

    display: 'grid',

    gridTemplateColumns:

      'repeat(3, minmax(0, 1fr))',

    gap: '18px',

  },


  formField: {

    display: 'flex',

    flexDirection: 'column',

    gap: '7px',

  },


  label: {

    fontSize: '11px',

    fontWeight: '650',

    color: '#475569',

  },


  input: {

    width: '100%',

    height: '40px',

    boxSizing: 'border-box',

    border: '1px solid #d7dee8',

    borderRadius: '7px',

    padding: '0 11px',

    background: '#ffffff',

    color: '#172033',

    fontSize: '12px',

    outline: 'none',

  },


  formFooter: {

    display: 'flex',

    justifyContent: 'flex-end',

    gap: '10px',

    marginTop: '22px',

    paddingTop: '20px',

    borderTop: '1px solid #e5e7eb',

  },


  cancelButton: {

    border: '1px solid #d7dee8',

    borderRadius: '7px',

    background: '#ffffff',

    color: '#172033',

    padding: '10px 16px',

    fontSize: '12px',

    fontWeight: '600',

    cursor: 'pointer',

  },


  errorMessage: {

    background: '#fef2f2',

    border: '1px solid #fecaca',

    color: '#b91c1c',

    borderRadius: '7px',

    padding: '11px 13px',

    marginBottom: '18px',

    fontSize: '12px',

  },


  tableCard: {

    background: '#ffffff',

    border: '1px solid #e5e7eb',

    borderRadius: '12px',

    overflow: 'hidden',

  },


  tableHeader: {

    display: 'flex',

    justifyContent: 'space-between',

    alignItems: 'center',

    padding: '20px 22px',

    borderBottom: '1px solid #e5e7eb',

  },


  tableTitle: {

    margin: 0,

    fontSize: '16px',

    fontWeight: '700',

  },


  tableDescription: {

    margin: '5px 0 0',

    color: '#94a3b8',

    fontSize: '12px',

  },


  counter: {

    color: '#64748b',

    fontSize: '12px',

    fontWeight: '600',

  },


  table: {

    width: '100%',

    borderCollapse: 'collapse',

  },


  th: {

    textAlign: 'left',

    padding: '13px 18px',

    background: '#f8fafc',

    color: '#64748b',

    fontSize: '10px',

    fontWeight: '700',

    letterSpacing: '0.5px',

    borderBottom: '1px solid #e5e7eb',

  },


  td: {

    padding: '17px 18px',

    fontSize: '12px',

    borderBottom: '1px solid #eef2f7',

  },


  tdStrong: {

    padding: '17px 18px',

    fontSize: '12px',

    fontWeight: '700',

    borderBottom: '1px solid #eef2f7',

  },


  clientName: {

    fontWeight: '650',

    color: '#172033',

  },


  clientFantasy: {

    marginTop: '3px',

    color: '#94a3b8',

    fontSize: '10px',

  },


  statusBadge: {

    display: 'inline-block',

    background: '#dcfce7',

    color: '#15803d',

    borderRadius: '999px',

    padding: '5px 10px',

    fontSize: '10px',

    fontWeight: '700',

  },


  emptyState: {

    background: '#ffffff',

    border: '1px dashed #cbd5e1',

    borderRadius: '12px',

    padding: '60px 30px',

    textAlign: 'center',

  },


  emptyIcon: {

    margin: '0 auto 15px',

    width: '48px',

    height: '48px',

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

    fontSize: '15px',

  },


  emptyText: {

    maxWidth: '500px',

    margin: '8px auto 0',

    color: '#94a3b8',

    fontSize: '12px',

    lineHeight: '1.6',

  },

}


export default App