package com.ruleta.controller;

import com.ruleta.dto.ParticipantDto;
import com.ruleta.dto.RouletteSpinRequest;
import com.ruleta.dto.RouletteSpinResponse;
import com.ruleta.dto.RecordWinnerRequest;
import com.ruleta.entity.SelectionHistory;
import com.ruleta.service.RouletteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roulette")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}) // Para el frontend React
@RequiredArgsConstructor
@Slf4j
public class RouletteController {
    
    private final RouletteService rouletteService;
    
    /**
     * Endpoint principal: girar la ruleta
     */
    @PostMapping("/spin")
    public ResponseEntity<RouletteSpinResponse> spin(@Valid @RequestBody RouletteSpinRequest request) {
        log.info("Solicitud de spin recibida con {} participantes", request.getParticipantNames().size());
        
        try {
            RouletteSpinResponse response = rouletteService.spinRoulette(request.getParticipantNames());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error durante el spin: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Obtener todos los participantes activos
     */
    @GetMapping("/participants")
    public ResponseEntity<List<ParticipantDto>> getAllParticipants() {
        List<ParticipantDto> participants = rouletteService.getAllActiveParticipants();
        return ResponseEntity.ok(participants);
    }
    
    /**
     * Añadir un nuevo participante
     */
    @PostMapping("/participants")
    public ResponseEntity<ParticipantDto> addParticipant(@RequestParam String name) {
        try {
            ParticipantDto participant = rouletteService.addParticipant(name.trim());
            return ResponseEntity.ok(participant);
        } catch (IllegalArgumentException e) {
            log.warn("Error al añadir participante: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Eliminar un participante
     */
    @DeleteMapping("/participants/{name}")
    public ResponseEntity<Void> removeParticipant(@PathVariable String name) {
        try {
            rouletteService.removeParticipant(name);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.warn("Error al eliminar participante: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Obtener historial reciente
     */
    @GetMapping("/history")
    public ResponseEntity<List<SelectionHistory>> getHistory(@RequestParam(defaultValue = "7") int days) {
        List<SelectionHistory> history = rouletteService.getRecentHistory(days);
        return ResponseEntity.ok(history);
    }
    
    /**
     * Resetear todas las estadísticas
     */
    @PostMapping("/reset")
    public ResponseEntity<Void> resetStats() {
        rouletteService.resetAllStats();
        return ResponseEntity.ok().build();
    }
    
    /**
     * Health check
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Ruleta Backend is running!");
    }
    
    /**
     * Registrar un ganador específico (cuando la ruleta frontend ya seleccionó)
     */
    @PostMapping("/record-winner")
    public ResponseEntity<RouletteSpinResponse> recordWinner(@RequestBody RecordWinnerRequest request) {
        log.info("Registrando ganador específico: {} de {} participantes", 
                request.getWinner(), request.getParticipants().size());
        try {
            RouletteSpinResponse response = rouletteService.recordSpecificWinner(
                    request.getWinner(), request.getParticipants());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error registrando ganador específico: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }
} 