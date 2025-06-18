package com.ruleta.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecordWinnerRequest {
    @NotBlank(message = "El ganador no puede estar vacío")
    private String winner;
    
    @NotEmpty(message = "La lista de participantes no puede estar vacía")
    private List<String> participants;
} 