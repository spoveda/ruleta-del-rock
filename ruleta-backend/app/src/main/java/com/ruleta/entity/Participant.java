package com.ruleta.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "participants")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Participant {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String name;
    
    @Column(name = "times_selected", nullable = false)
    private Integer timesSelected = 0;
    
    @Column(name = "probability_weight", nullable = false)
    private Double probabilityWeight = 1.0;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "last_selected_at")
    private LocalDateTime lastSelectedAt;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    public Participant(String name) {
        this.name = name;
        this.timesSelected = 0;
        this.probabilityWeight = 1.0;
        this.createdAt = LocalDateTime.now();
        this.isActive = true;
    }
} 