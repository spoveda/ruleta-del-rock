package com.ruleta.repository;

import com.ruleta.entity.SelectionHistory;
import com.ruleta.entity.Participant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SelectionHistoryRepository extends JpaRepository<SelectionHistory, Long> {
    
    List<SelectionHistory> findByParticipantOrderBySelectedAtDesc(Participant participant);
    
    @Query("SELECT sh FROM SelectionHistory sh ORDER BY sh.selectedAt DESC")
    List<SelectionHistory> findAllOrderBySelectedAtDesc();
    
    @Query("SELECT sh FROM SelectionHistory sh WHERE sh.selectedAt >= :since ORDER BY sh.selectedAt DESC")
    List<SelectionHistory> findRecentSelections(@Param("since") LocalDateTime since);
    
    @Query("SELECT COUNT(sh) FROM SelectionHistory sh WHERE sh.participant = :participant")
    long countByParticipant(@Param("participant") Participant participant);
} 