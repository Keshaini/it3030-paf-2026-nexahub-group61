package com.edutrack.backend.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateTicketRequest(
    @NotBlank @Size(max = 200) String title,
    @NotBlank @Size(max = 200) String resource,
    @NotBlank @Size(max = 50) String category,
    @NotBlank String description,
    @NotBlank @Size(max = 20) String priority,
    @Size(max = 300) String contactDetails,
    String imageBase64_1,
    String imageBase64_2,
    String imageBase64_3
) {}
