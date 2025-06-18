package com.ruleta.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouletteSpinRequest {
    @NotEmpty(message = "La lista de participantes no puede estar vacía")
    private List<String> participantNames;
} 