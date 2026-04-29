package com.edutrack.backend.booking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BookingActionRequest(
        @NotBlank(message = "Actor email is required")
        @Email(message = "Actor email must be valid")
        String actorEmail,

        @Size(max = 255, message = "Reason must be 255 characters or fewer")
        String reason
) {
}
