export default function ZoneCard({ 
  zone, 
  onNameChange, 
  onDelete,
  onComplete,
  onStartPointSet
}) {
  const styles = {
    card: {
      padding: '16px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      marginBottom: '16px'
    },
    inputContainer: {
      display: 'flex',
      gap: '16px',
      marginBottom: '16px',
      alignItems: 'center'
    },
    textInput: {
      flex: 1,
      padding: '8px',
      border: '1px solid #e5e7eb',
      borderRadius: '4px'
    },
    metricsContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginBottom: '16px',
      backgroundColor: '#f9fafb',
      padding: '12px',
      borderRadius: '4px'
    },
    button: {
      width: '100%',
      padding: '8px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      marginBottom: '8px'
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.inputContainer}>
        <input
          type="text"
          value={zone.name}
          onChange={(e) => onNameChange(zone.id, e.target.value)}
          style={styles.textInput}
        />
      </div>

      <div style={styles.metricsContainer}>
        <div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Surface:</div>
          <div style={{ fontWeight: 500 }}>{zone.area} hectares</div>
        </div>
        <div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Périmètre:</div>
          <div style={{ fontWeight: 500 }}>{zone.perimeter || '0'} km</div>
        </div>
      </div>

      <div>
        <button
          onClick={() => onStartPointSet(zone.id)}
          style={{ ...styles.button, backgroundColor: '#1a2742', color: 'white' }}
        >
          Définir point de départ
        </button>

        {!zone.completed ? (
          <button
            onClick={() => onComplete(zone.id)}
            style={{ ...styles.button, backgroundColor: '#22c55e', color: 'white' }}
          >
            Marquer comme terminée
          </button>
        ) : (
          <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '4px', fontSize: '14px', color: '#6b7280' }}>
            Terminée le {new Date(zone.completedAt).toLocaleString()}
          </div>
        )}

        <button
          onClick={() => onDelete(zone.id)}
          style={{ ...styles.button, color: '#dc2626', backgroundColor: 'transparent' }}
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}