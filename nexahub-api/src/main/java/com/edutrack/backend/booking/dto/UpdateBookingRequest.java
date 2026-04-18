package com.edutrack.backend.booking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public record UpdateBookingRequest(
        @NotBlank(message = "Requester email is required")
        @Email(message = "Requester email must be valid")
        String requesterEmail,

        @NotNull(message = "Resource is required")
        Long resourceId,

        @NotNull(message = "Booking date is required")
        @FutureOrPresent(message = "Booking date cannot be in the past")
        LocalDate bookingDate,

        @NotNull(message = "Start time is required")
        LocalTime startTime,

        @NotNull(message = "End time is required")
        LocalTime endTime,

        @NotBlank(message = "Purpose is required")
        @Size(max = 240, message = "Purpose must be 240 characters or fewer")
        String purpose,

        @NotNull(message = "Expected attendees is required")
        @Min(value = 1, message = "Expected attendees must be at least 1")
        Integer expectedAttendees
) {
}
