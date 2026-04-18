package com.edutrack.backend.booking.dto;

import com.edutrack.backend.auth.entity.UserAccount;
import com.edutrack.backend.booking.entity.Booking;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record BookingResponse(
        Long id,
        Long resourceId,
        String resourceCode,
        String resourceName,
        String resourceCategory,
        String resourceLocation,
        Integer resourceCapacity,
        LocalDate bookingDate,
        LocalTime startTime,
        LocalTime endTime,
        String purpose,
        Integer expectedAttendees,
        String status,
        String requesterEmail,
        String requesterName,
        String requesterItNumber,
        String reviewedByEmail,
        String reviewedByName,
        String rejectionReason,
        String cancellationReason,
        LocalDateTime reviewedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static BookingResponse fromEntity(Booking booking) {
        UserAccount reviewer = booking.getReviewedBy();

        return new BookingResponse(
                booking.getId(),
                booking.getResource().getId(),
                booking.getResource().getCode(),
                booking.getResource().getName(),
                booking.getResource().getCategory(),
                booking.getResource().getLocation(),
                booking.getResource().getCapacity(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getPurpose(),
                booking.getExpectedAttendees(),
                booking.getStatus().name(),
                booking.getRequestedBy().getEmail(),
                booking.getRequestedBy().getFullName(),
                booking.getRequestedBy().getItNumber(),
                reviewer != null ? reviewer.getEmail() : null,
                reviewer != null ? reviewer.getFullName() : null,
                booking.getRejectionReason(),
                booking.getCancellationReason(),
                booking.getReviewedAt(),
                booking.getCreatedAt(),
                booking.getUpdatedAt()
        );
    }
}
