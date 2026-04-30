package com.edutrack.backend.ticket.repository;

import com.edutrack.backend.ticket.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findAllByOrderByCreatedAtDesc();
    List<Ticket> findByReporterEmailIgnoreCaseOrderByCreatedAtDesc(String reporterEmail);
    List<Ticket> findByAssignedToEmailIgnoreCaseOrderByCreatedAtDesc(String assignedToEmail);
}
