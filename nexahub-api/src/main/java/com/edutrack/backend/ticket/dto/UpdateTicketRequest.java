package com.edutrack.backend.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateTicketRequest(
    @NotBlank(message = "Title is required")
    @Size(max = 30, message = "Title cannot exceed 30 characters")
    String title,

    @NotBlank(message = "Resource location is required")
    String resource,

    @NotBlank(message = "Category is required")
    String category,

    @NotBlank(message = "Priority is required")
    String priority,

    @NotBlank(message = "Description is required")
    @Size(max = 150, message = "Description cannot exceed 150 characters")
    String description,

    @Size(max = 10, message = "Contact must be up to 10 digits")
    String contactDetails,

    String imageBase64_1,
    String imageBase64_2,
    String imageBase64_3
) {}
