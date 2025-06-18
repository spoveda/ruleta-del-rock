package com.ruleta.repository;

import com.ruleta.entity.Participant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ParticipantRepository extends JpaRepository<Participant, Long> {
    
    List<Participant> findByIsActiveTrue();
    
    Optional<Participant> findByNameAndIsActiveTrue(String name);
    
    boolean existsByNameAndIsActiveTrue(String name);
    
    Optional<Participant> findByName(String name);
    
    @Query("SELECT p FROM Participant p WHERE p.isActive = true ORDER BY p.probabilityWeight DESC")
    List<Participant> findActiveParticipantsOrderByWeight();
    
    @Query("SELECT COUNT(p) FROM Participant p WHERE p.isActive = true")
    long countActiveParticipants();
} 