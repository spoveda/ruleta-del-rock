import React from "react";

function NameList({ names, onRemove }) {
  return (
    <ul className="name-list">
      {names.map((name, idx) => (
        <li key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <span style={{ flex: 1, textAlign: 'center' }}>{name}</span>
          <button 
            onClick={() => {
              if (window.confirm(`¿Eliminar "${name}"?`)) {
                onRemove(idx);
              }
            }} 
            aria-label={`Eliminar ${name}`}
            style={{ 
              backgroundColor: '#ff4444', 
              color: 'white', 
              border: 'none', 
              borderRadius: '3px', 
              padding: '2px 6px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            ❌
          </button>
        </li>
      ))}
    </ul>
  );
}

export default NameList; 