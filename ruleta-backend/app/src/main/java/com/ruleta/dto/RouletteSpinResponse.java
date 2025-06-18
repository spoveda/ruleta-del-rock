package com.ruleta.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouletteSpinResponse {
    private String winner;
    private List<ParticipantWithProbability> participants;
    private Double winnerProbability;
    private LocalDateTime spinTime;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParticipantWithProbability {
        private String name;
        private Double probability;
        private Integer timesSelected;
    }
} 