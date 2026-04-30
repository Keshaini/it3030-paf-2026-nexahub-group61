package com.edutrack.backend.ticket.dto;

import com.edutrack.backend.ticket.entity.TicketComment;
import java.time.LocalDateTime;

public record TicketCommentDto(
    Long id,
    Long ticketId,
    String authorEmail,
    String authorRole,
    String content,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static TicketCommentDto fromEntity(TicketComment c) {
        return new TicketCommentDto(
            c.getId(),
            c.getTicketId(),
            c.getAuthorEmail(),
            c.getAuthorRole(),
            c.getContent(),
            c.getCreatedAt(),
            c.getUpdatedAt()
        );
    }
}
