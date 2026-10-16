export default function DocumentosView() {
    return (
      <section style={styles.content}>
        <div style={styles.pageHeader}>
          <div>
            <div style={styles.breadcrumb}>Gestión</div>
            <h2 style={styles.pageTitle}>Documentos</h2>
            <p style={styles.pageDescription}>
              Documentos tributarios registrados en GH Servicios.
            </p>
          </div>
  
          <button style={styles.primaryButton}>
            + Importar SII
          </button>
        </div>
  
        <div style={styles.filtersCard}>
          <div style={styles.filterGroup}>
            <label style={styles.label}>RUT cliente</label>
            <input
              style={styles.input}
              placeholder="Buscar por RUT"
            />
          </div>
  
          <div style={styles.filterGroup}>
            <label style={styles.label}>Razón social</label>
            <input
              style={styles.input}
              placeholder="Buscar empresa"
            />
          </div>
  
          <div style={styles.filterGroup}>
            <label style={styles.label}>Tipo documento</label>
            <select style={styles.input} defaultValue="">
              <option value="">Todos</option>
              <option value="33">Factura electrónica</option>
              <option value="34">Factura exenta</option>
              <option value="61">Nota de crédito</option>
              <option value="56">Nota de débito</option>
            </select>
          </div>
  
          <div style={styles.filterGroup}>
            <label style={styles.label}>Período</label>
            <input
              type="month"
              style={styles.input}
            />
          </div>
  
          <button style={styles.secondaryButton}>
            Buscar
          </button>
        </div>
  
        <div style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <div>
              <h3 style={styles.tableTitle}>Documentos tributarios</h3>
              <p style={styles.tableDescription}>
                Aquí aparecerán los documentos importados desde el SII.
              </p>
            </div>
  
            <div style={styles.counter}>
              0 documentos
            </div>
          </div>
  
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🧾</div>
  
            <h3 style={styles.emptyTitle}>
              No hay documentos registrados
            </h3>
  
            <p style={styles.emptyText}>
              Cuando importemos el archivo RCV del SII, los documentos
              tributarios aparecerán aquí para su revisión y posterior
              conciliación con los pagos bancarios.
            </p>
  
            <button style={styles.primaryButton}>
              Importar documentos SII
            </button>
          </div>
        </div>
      </section>
    )
  }
  
  const styles = {
    content: {
      padding: '30px 32px 50px',
      width: '100%',
      boxSizing: 'border-box',
    },
  
    pageHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginBottom: '22px',
    },
  
    breadcrumb: {
      color: '#94a3b8',
      fontSize: '12px',
      marginBottom: '5px',
    },
  
    pageTitle: {
      margin: 0,
      fontSize: '25px',
      fontWeight: '750',
      color: '#172033',
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
  
    secondaryButton: {
      border: '1px solid #d7dee8',
      borderRadius: '7px',
      background: '#ffffff',
      color: '#172033',
      padding: '10px 16px',
      fontSize: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      alignSelf: 'end',
    },
  
    filtersCard: {
      display: 'grid',
      gridTemplateColumns: '1.1fr 1.5fr 1.2fr 1fr auto',
      gap: '14px',
      alignItems: 'end',
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
    },
  
    filterGroup: {
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
      height: '39px',
      boxSizing: 'border-box',
      border: '1px solid #d7dee8',
      borderRadius: '7px',
      padding: '0 11px',
      background: '#ffffff',
      color: '#172033',
      fontSize: '12px',
      outline: 'none',
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
  
    emptyState: {
      padding: '70px 30px',
      textAlign: 'center',
    },
  
    emptyIcon: {
      width: '58px',
      height: '58px',
      margin: '0 auto 17px',
      borderRadius: '50%',
      background: '#eff6ff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '25px',
    },
  
    emptyTitle: {
      margin: 0,
      fontSize: '16px',
      fontWeight: '700',
      color: '#172033',
    },
  
    emptyText: {
      maxWidth: '560px',
      margin: '9px auto 20px',
      color: '#94a3b8',
      fontSize: '12px',
      lineHeight: '1.6',
    },
  }