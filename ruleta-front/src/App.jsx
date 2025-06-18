import React, { useState, useEffect } from "react";
import Roulette from "./components/Roulette";
import NameInput from "./components/NameInput";
import NameList from "./components/NameList";
import ParticipantStats from "./components/ParticipantStats";
import { rouletteAPI } from "./services/api";
import './App.css';

function App() {
  const [names, setNames] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [rouletteKey, setRouletteKey] = useState(0);
  const [backendConnected, setBackendConnected] = useState(false);
  const [spinResponse, setSpinResponse] = useState(null);

  // Verificar conexión con backend al cargar
  useEffect(() => {
    const initializeApp = async () => {
      await checkBackendConnection();
    };
    initializeApp();
  }, []);

  // Cargar participantes cuando se establece la conexión
  useEffect(() => {
    if (backendConnected) {
      loadParticipants();
    }
  }, [backendConnected]);

  // Refresh automático cada 10 segundos para mantener estadísticas sincronizadas
  useEffect(() => {
    if (!backendConnected) return;
    
    const interval = setInterval(() => {
      console.log("🔄 Auto-refresh ejecutándose...");
      loadParticipants();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [backendConnected]);

  const checkBackendConnection = async () => {
    try {
      await rouletteAPI.health();
      setBackendConnected(true);
      console.log("✅ Backend conectado");
    } catch (error) {
      setBackendConnected(false);
      console.warn("❌ Backend no disponible, usando modo local");
    }
  };

  const loadParticipants = async () => {
    if (!backendConnected) return;
    
    try {
      console.log("🔄 Cargando participantes del backend...");
      const participantData = await rouletteAPI.getParticipants();
      console.log("📊 Datos recibidos:", participantData);
      setParticipants(participantData);
      // Sincronizar nombres para la ruleta visual
      setNames(participantData.map(p => p.name));
    } catch (error) {
      console.error("Error cargando participantes:", error);
    }
  };

  const addName = async (name) => {
    if (backendConnected) {
      try {
        console.log("🔄 Agregando participante:", name);
        await rouletteAPI.addParticipant(name);
        console.log("✅ Participante agregado, recargando datos...");
        await loadParticipants(); // Recargar datos actualizados
      } catch (error) {
        console.error("Error añadiendo participante:", error);
        // Fallback a modo local
        setNames((prev) => [...prev, name]);
      }
    } else {
      // Modo local
      setNames((prev) => [...prev, name]);
    }
  };

  const removeName = async (index) => {
    const nameToRemove = names[index];
    
    if (backendConnected) {
      try {
        await rouletteAPI.removeParticipant(nameToRemove);
        await loadParticipants(); // Recargar datos actualizados
      } catch (error) {
        console.error("Error eliminando participante:", error);
        // Fallback a modo local
        setNames((prev) => prev.filter((_, i) => i !== index));
      }
    } else {
      // Modo local
      setNames((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSpin = async () => {
    // Obtener probabilidades del backend si está conectado
    let probabilities = null;
    if (backendConnected && names.length > 0) {
      try {
        const participants = await rouletteAPI.getParticipants();
        // Crear mapa de probabilidades basado en los pesos
        const totalWeight = participants.reduce((sum, p) => sum + p.probabilityWeight, 0);
        probabilities = {};
        participants.forEach(p => {
          probabilities[p.name] = p.probabilityWeight / totalWeight;
        });
        console.log("📊 Probabilidades obtenidas del backend:", probabilities);
      } catch (error) {
        console.error("Error obteniendo probabilidades:", error);
      }
    }
    
    // Pasar las probabilidades al frontend para que haga la selección
    window.rouletteProbabilities = probabilities;

    
    // Iniciar la animación visual
    setIsSpinning(true);
  };

  const handleSpinEnd = async (selectedName) => {
    console.log("🎯 Ruleta paró en:", selectedName);
    
    // Notificar al backend del ganador real para actualizar probabilidades
    if (backendConnected && names.length > 0) {
      try {
        const response = await rouletteAPI.recordWinner(selectedName, names);
        console.log("📊 Backend notificado del ganador:", selectedName);
        console.log(`🎲 Probabilidad que tenía: ${(response.winnerProbability * 100).toFixed(1)}%`);
        
        // Actualizar las estadísticas
        await loadParticipants();
      } catch (error) {
        console.error("Error notificando ganador al backend:", error);
      }
    }
    
    setTimeout(() => {
      setWinner(selectedName);
      setIsSpinning(false);
      window.rouletteProbabilities = null; // Limpiar probabilidades
      console.log("Winner set:", selectedName);
    }, 300);
  };

  const restartRoulette = () => {
    setWinner(null);
    setIsSpinning(false);
    setSpinResponse(null);
    setRouletteKey(prev => prev + 1);
  };

  const handleResetStats = async () => {
    if (!backendConnected) return;
    
    try {
      await rouletteAPI.resetStats();
      await loadParticipants();
      console.log("📊 Estadísticas reseteadas");
    } catch (error) {
      console.error("Error reseteando estadísticas:", error);
    }
  };

  return (
    <div className="app-container">
      <div className="header-section">
        <h1>🎸 Ruleta del Rock 🎸</h1>
        <div className="connection-status">
          {backendConnected ? (
            <span className="status-connected">🟢 Backend Conectado (Probabilidades Inteligentes)</span>
          ) : (
            <span className="status-local">🟡 Modo Local (Probabilidades Iguales)</span>
          )}
        </div>
      </div>
      
      <NameInput onAdd={addName} />
      
      {winner && (
        <div className="winner-banner">
          <span>🎉 Le cabe a: <b>{winner}</b> 🎉</span>
          {spinResponse && (
            <span className="winner-probability">
              (Probabilidad: {(spinResponse.winnerProbability * 100).toFixed(1)}%)
            </span>
          )}
          <button className="winner-restart-btn" onClick={restartRoulette}>
            Reiniciar
          </button>
        </div>
      )}
      
      <div className="main-layout">
        <div className="ruleta-section">
          <Roulette
            key={rouletteKey}
            names={names}
            isSpinning={isSpinning}
            onSpinEnd={handleSpinEnd}
          >
            {names.length >= 2 && !isSpinning && (
              <button
                className="spin-center"
                onClick={handleSpin}
              >
                Spin
              </button>
            )}
          </Roulette>
          <NameList names={names} onRemove={removeName} />
        </div>
        
        {backendConnected && participants.length > 0 && (
          <ParticipantStats 
            participants={participants} 
            onReset={handleResetStats}
          />
        )}
      </div>
    </div>
  );
}

export default App;
