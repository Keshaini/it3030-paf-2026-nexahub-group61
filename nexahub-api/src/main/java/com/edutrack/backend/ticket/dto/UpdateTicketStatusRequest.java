package com.edutrack.backend.ticket.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateTicketStatusRequest(
    @NotBlank String status,
    String rejectionReason,
    String resolutionNotes,
    String assignedToEmail
) {}
