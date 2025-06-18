package com.ruleta.service;

import com.ruleta.dto.ParticipantDto;
import com.ruleta.dto.RouletteSpinResponse;
import com.ruleta.entity.Participant;
import com.ruleta.entity.SelectionHistory;
import com.ruleta.repository.ParticipantRepository;
import com.ruleta.repository.SelectionHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RouletteService {
    
    private final ParticipantRepository participantRepository;
    private final SelectionHistoryRepository selectionHistoryRepository;
    private final Random random = new Random();
    
    /**
     * Realiza el spin de la ruleta con probabilidades ponderadas
     */
    @Transactional
    public RouletteSpinResponse spinRoulette(List<String> participantNames) {
        log.info("Iniciando spin con participantes: {}", participantNames);
        
        // Obtener o crear participantes
        List<Participant> participants = getOrCreateParticipants(participantNames);
        
        // Calcular probabilidades ponderadas
        Map<Participant, Double> probabilities = calculateWeightedProbabilities(participants);
        
        // Seleccionar ganador usando probabilidades ponderadas
        Participant winner = selectWinnerByProbability(probabilities);
        
        // Actualizar estadísticas del ganador
        updateWinnerStats(winner);
        
        // Registrar en historial
        Double winnerProbability = probabilities.get(winner);
        if (winnerProbability == null) {
            winnerProbability = 1.0 / participants.size(); // Fallback probability
        }
        
        SelectionHistory history = new SelectionHistory();
        history.setParticipant(winner);
        history.setTotalParticipants(participants.size());
        history.setProbabilityAtSelection(winnerProbability);
        history.setSelectedAt(LocalDateTime.now());
        
        selectionHistoryRepository.save(history);
        
        // Recalcular pesos para futuros spins
        recalculateWeights(participants, winner);
        
        // Construir respuesta
        return buildSpinResponse(winner, participants, probabilities);
    }
    
    /**
     * Obtiene todos los participantes activos
     */
    public List<ParticipantDto> getAllActiveParticipants() {
        return participantRepository.findByIsActiveTrue()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Añade un nuevo participante o reactiva uno existente
     */
    @Transactional
    public ParticipantDto addParticipant(String name) {
        // Verificar si ya existe un participante activo
        if (participantRepository.existsByNameAndIsActiveTrue(name)) {
            throw new IllegalArgumentException("El participante ya existe: " + name);
        }
        
        // Buscar si existe un participante inactivo con ese nombre
        Optional<Participant> existingParticipant = participantRepository.findByName(name);
        
        if (existingParticipant.isPresent()) {
            // Reactivar participante existente
            Participant participant = existingParticipant.get();
            participant.setIsActive(true);
            participant = participantRepository.save(participant);
            log.info("Participante reactivado: {}", name);
            return convertToDto(participant);
        } else {
            // Crear nuevo participante
            Participant participant = new Participant(name);
            participant = participantRepository.save(participant);
            log.info("Nuevo participante añadido: {}", name);
            return convertToDto(participant);
        }
    }
    
    /**
     * Elimina un participante (soft delete)
     */
    @Transactional
    public void removeParticipant(String name) {
        Participant participant = participantRepository.findByNameAndIsActiveTrue(name)
                .orElseThrow(() -> new IllegalArgumentException("Participante no encontrado: " + name));
        
        participant.setIsActive(false);
        participantRepository.save(participant);
        log.info("Participante desactivado: {}", name);
    }
    
    /**
     * Obtiene el historial de selecciones recientes
     */
    public List<SelectionHistory> getRecentHistory(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return selectionHistoryRepository.findRecentSelections(since);
    }
    
    /**
     * Registra un ganador específico (cuando la ruleta frontend ya seleccionó)
     */
    @Transactional
    public RouletteSpinResponse recordSpecificWinner(String winnerName, List<String> participantNames) {
        log.info("Registrando ganador específico: {} de {}", winnerName, participantNames);
        
        // Obtener o crear participantes
        List<Participant> participants = getOrCreateParticipants(participantNames);
        
        // Buscar el ganador específico
        Participant winner = participants.stream()
                .filter(p -> p.getName().equals(winnerName))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Ganador no encontrado: " + winnerName));
        
        // Calcular probabilidades ANTES de actualizar (para el historial)
        Map<Participant, Double> probabilities = calculateWeightedProbabilities(participants);
        
        // Actualizar estadísticas del ganador
        updateWinnerStats(winner);
        
        // Registrar en historial
        Double winnerProbability = probabilities.get(winner);
        if (winnerProbability == null) {
            winnerProbability = 1.0 / participants.size();
        }
        
        SelectionHistory history = new SelectionHistory();
        history.setParticipant(winner);
        history.setTotalParticipants(participants.size());
        history.setProbabilityAtSelection(winnerProbability);
        history.setSelectedAt(LocalDateTime.now());
        selectionHistoryRepository.save(history);
        
        // Recalcular pesos para futuros spins
        recalculateWeights(participants, winner);
        
        // Construir respuesta
        return buildSpinResponse(winner, participants, probabilities);
    }

    /**
     * Resetea las estadísticas de todos los participantes
     */
    @Transactional
    public void resetAllStats() {
        List<Participant> participants = participantRepository.findByIsActiveTrue();
        participants.forEach(p -> {
            p.setTimesSelected(0);
            p.setProbabilityWeight(1.0);
            p.setLastSelectedAt(null);
        });
        participantRepository.saveAll(participants);
        log.info("Estadísticas reseteadas para {} participantes", participants.size());
    }
    
    // Métodos privados de lógica interna
    
    private List<Participant> getOrCreateParticipants(List<String> names) {
        List<Participant> participants = new ArrayList<>();
        
        for (String name : names) {
            Optional<Participant> existing = participantRepository.findByNameAndIsActiveTrue(name);
            if (existing.isPresent()) {
                participants.add(existing.get());
            } else {
                Participant newParticipant = new Participant(name);
                participants.add(participantRepository.save(newParticipant));
                log.info("Nuevo participante creado automáticamente: {}", name);
            }
        }
        
        return participants;
    }
    
    private Map<Participant, Double> calculateWeightedProbabilities(List<Participant> participants) {
        Map<Participant, Double> probabilities = new HashMap<>();
        
        // Calcular peso total
        double totalWeight = participants.stream()
                .mapToDouble(Participant::getProbabilityWeight)
                .sum();
        
        // Calcular probabilidad individual
        for (Participant participant : participants) {
            double probability = participant.getProbabilityWeight() / totalWeight;
            probabilities.put(participant, probability);
        }
        
        log.info("Probabilidades calculadas: {}", 
                probabilities.entrySet().stream()
                        .collect(Collectors.toMap(
                                e -> e.getKey().getName(),
                                e -> String.format("%.2f%%", e.getValue() * 100)
                        )));
        
        return probabilities;
    }
    
    private Participant selectWinnerByProbability(Map<Participant, Double> probabilities) {
        double randomValue = random.nextDouble();
        double cumulativeProbability = 0.0;
        
        for (Map.Entry<Participant, Double> entry : probabilities.entrySet()) {
            cumulativeProbability += entry.getValue();
            if (randomValue <= cumulativeProbability) {
                log.info("Ganador seleccionado: {} (random: {:.4f}, cumulative: {:.4f})", 
                        entry.getKey().getName(), randomValue, cumulativeProbability);
                return entry.getKey();
            }
        }
        
        // Fallback (no debería llegar aquí)
        List<Participant> participantList = new ArrayList<>(probabilities.keySet());
        return participantList.get(participantList.size() - 1);
    }
    
    private void updateWinnerStats(Participant winner) {
        winner.setTimesSelected(winner.getTimesSelected() + 1);
        winner.setLastSelectedAt(LocalDateTime.now());
        participantRepository.save(winner);
    }
    
    private void recalculateWeights(List<Participant> participants, Participant winner) {
        // Estrategia: Reducir el peso del ganador y aumentar el de los demás
        final double WINNER_REDUCTION_FACTOR = 0.5; // El ganador reduce su peso a la mitad
        final double OTHERS_BOOST_FACTOR = 1.1; // Los demás aumentan su peso 10%
        final double MIN_WEIGHT = 0.1; // Peso mínimo para evitar que alguien nunca salga
        final double MAX_WEIGHT = 3.0; // Peso máximo para evitar dominancia extrema
        
        for (Participant participant : participants) {
            if (participant.equals(winner)) {
                // Reducir peso del ganador
                double newWeight = Math.max(MIN_WEIGHT, 
                        participant.getProbabilityWeight() * WINNER_REDUCTION_FACTOR);
                participant.setProbabilityWeight(newWeight);
                log.info("Peso reducido para {}: {:.2f}", participant.getName(), newWeight);
            } else {
                // Aumentar peso de los demás
                double newWeight = Math.min(MAX_WEIGHT, 
                        participant.getProbabilityWeight() * OTHERS_BOOST_FACTOR);
                participant.setProbabilityWeight(newWeight);
            }
        }
        
        participantRepository.saveAll(participants);
    }
    
    private RouletteSpinResponse buildSpinResponse(Participant winner, 
                                                   List<Participant> participants, 
                                                   Map<Participant, Double> probabilities) {
        List<RouletteSpinResponse.ParticipantWithProbability> participantData = 
                participants.stream()
                        .map(p -> new RouletteSpinResponse.ParticipantWithProbability(
                                p.getName(),
                                probabilities.get(p),
                                p.getTimesSelected()
                        ))
                        .collect(Collectors.toList());
        
        return new RouletteSpinResponse(
                winner.getName(),
                participantData,
                probabilities.get(winner),
                LocalDateTime.now()
        );
    }
    
    private ParticipantDto convertToDto(Participant participant) {
        return new ParticipantDto(
                participant.getId(),
                participant.getName(),
                participant.getTimesSelected(),
                participant.getProbabilityWeight(),
                participant.getCreatedAt(),
                participant.getLastSelectedAt(),
                participant.getIsActive()
        );
    }
} 