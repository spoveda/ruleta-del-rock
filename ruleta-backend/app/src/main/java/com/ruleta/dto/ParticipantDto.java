package com.ruleta.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantDto {
    private Long id;
    private String name;
    private Integer timesSelected;
    private Double probabilityWeight;
    private LocalDateTime createdAt;
    private LocalDateTime lastSelectedAt;
    private Boolean isActive;
} 