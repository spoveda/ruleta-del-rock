import React from "react";

function ParticipantStats({ participants, onReset }) {
  if (!participants || participants.length === 0) {
    return null;
  }

  const totalWeight = participants.reduce((sum, p) => sum + (p.probabilityWeight || 1), 0);

  return (
    <div className="participant-stats">
      <div className="stats-header">
        <h3>Estadísticas & Probabilidades</h3>
        <button className="reset-btn" onClick={onReset} title="Resetear todas las estadísticas">
          🔄 Reset
        </button>
      </div>
      
      <div className="stats-list">
        {participants.map((participant, idx) => {
          const probability = ((participant.probabilityWeight || 1) / totalWeight) * 100;
          const timesSelected = participant.timesSelected || 0;
          
          return (
            <div key={idx} className="stat-item">
              <div className="stat-name">{participant.name}</div>
              <div className="stat-details">
                <div className="stat-probability">
                  <span className="stat-label">Prob:</span>
                  <span className="stat-value">{probability.toFixed(1)}%</span>
                </div>
                <div className="stat-selections">
                  <span className="stat-label">Veces:</span>
                  <span className="stat-value">{timesSelected}</span>
                </div>
                <div className="stat-weight">
                  <span className="stat-label">Peso:</span>
                  <span className="stat-value">{(participant.probabilityWeight || 1).toFixed(2)}</span>
                </div>
              </div>
              <div className="probability-bar">
                <div 
                  className="probability-fill" 
                  style={{ width: `${probability}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ParticipantStats; 