package com.edutrack.backend.ticket.dto;

import com.edutrack.backend.ticket.entity.Ticket;
import java.time.LocalDateTime;

public record TicketDto(
    Long id,
    String title,
    String resource,
    String category,
    String description,
    String priority,
    String status,
    String contactDetails,
    String reporterEmail,
    String assignedToEmail,
    String imageUrl1,
    String imageUrl2,
    String imageUrl3,
    String rejectionReason,
    String resolutionNotes,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static TicketDto fromEntity(Ticket t) {
        return new TicketDto(
            t.getId(),
            t.getTitle(),
            t.getResource(),
            t.getCategory(),
            t.getDescription(),
            t.getPriority(),
            t.getStatus(),
            t.getContactDetails(),
            t.getReporterEmail(),
            t.getAssignedToEmail(),
            t.getImageUrl1(),
            t.getImageUrl2(),
            t.getImageUrl3(),
            t.getRejectionReason(),
            t.getResolutionNotes(),
            t.getCreatedAt(),
            t.getUpdatedAt()
        );
    }
}
