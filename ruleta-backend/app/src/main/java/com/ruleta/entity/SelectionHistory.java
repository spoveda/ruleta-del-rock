package com.ruleta.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "selection_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SelectionHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_id", nullable = false)
    private Participant participant;
    
    @Column(name = "selected_at", nullable = false)
    private LocalDateTime selectedAt = LocalDateTime.now();
    
    @Column(name = "total_participants", nullable = false)
    private Integer totalParticipants;
    
    @Column(name = "probability_at_selection", nullable = false)
    private Double probabilityAtSelection;
    
    public SelectionHistory(Participant participant, Integer totalParticipants, Double probabilityAtSelection) {
        this.participant = participant;
        this.totalParticipants = totalParticipants;
        this.probabilityAtSelection = probabilityAtSelection;
        this.selectedAt = LocalDateTime.now();
    }
} 