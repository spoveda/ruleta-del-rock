import React, { useEffect } from "react";

function WinnerModal({ winner, onClose, onRestart }) {
  useEffect(() => {
    if (winner) {
      console.log("WinnerModal rendered with winner:", winner);
    }
  }, [winner]);

  if (!winner) return null;
  return (
    <div className="winner-modal-overlay confetti-active" onClick={onClose} style={{ zIndex: 3000, position: 'fixed', inset: 0 }}>
      <div className="winner-modal" onClick={e => e.stopPropagation()} style={{ zIndex: 4000 }}>
        <h2>¡Ganador!</h2>
        <p style={{ fontSize: '2rem', fontWeight: 700 }}>{winner}</p>
        <button onClick={onClose} style={{ marginRight: 8 }}>Cerrar</button>
        <button onClick={onRestart}>Reiniciar Ruleta</button>
      </div>
    </div>
  );
}

export default WinnerModal; 