import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/roulette';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const rouletteAPI = {
  // Girar la ruleta con probabilidades ponderadas
  spin: async (participantNames) => {
    const response = await api.post('/spin', {
      participantNames: participantNames
    });
    return response.data;
  },

  // Obtener todos los participantes activos
  getParticipants: async () => {
    const response = await api.get('/participants');
    return response.data;
  },

  // Añadir un nuevo participante
  addParticipant: async (name) => {
    const response = await api.post('/participants', null, {
      params: { name }
    });
    return response.data;
  },

  // Eliminar un participante
  removeParticipant: async (name) => {
    await api.delete(`/participants/${encodeURIComponent(name)}`);
  },

  // Obtener historial reciente
  getHistory: async (days = 7) => {
    const response = await api.get('/history', {
      params: { days }
    });
    return response.data;
  },

  // Resetear estadísticas
  resetStats: async () => {
    await api.post('/reset');
  },

  // Registrar un ganador específico (para cuando la ruleta visual ya seleccionó)
  recordWinner: async (winnerName, allParticipants) => {
    const response = await api.post('/record-winner', {
      winner: winnerName,
      participants: allParticipants
    });
    return response.data;
  },

  // Health check
  health: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};

export default api; 