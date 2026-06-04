package com.edutrack.backend.booking.dto;

import com.edutrack.backend.auth.entity.UserAccount;
import com.edutrack.backend.booking.entity.Booking;
import com.nexahub.model.Resource;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

public record BookingResponse(
        Long id,
        UUID resourceId,
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
        boolean requesterArchived,
        LocalDateTime reviewedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static BookingResponse fromEntity(Booking booking) {
        UserAccount reviewer = booking.getReviewedBy();
        Resource resource    = booking.getResource();

        return new BookingResponse(
                booking.getId(),
                resource != null ? resource.getId()              : null,
                resource != null ? resource.getId().toString()   : null,
                resource != null ? resource.getName()            : null,
                resource != null ? resource.getType().name()     : null,
                resource != null ? resource.getLocation()        : null,
                resource != null ? resource.getCapacity()        : null,
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getPurpose(),
                booking.getExpectedAttendees(),
                booking.getStatus().name(),
                booking.getRequestedBy().getEmail(),
                booking.getRequestedBy().getFullName(),
                booking.getRequestedBy().getItNumber(),
                reviewer != null ? reviewer.getEmail()    : null,
                reviewer != null ? reviewer.getFullName() : null,
                booking.getRejectionReason(),
                booking.getCancellationReason(),
                booking.isRequesterArchived(),
                booking.getReviewedAt(),
                booking.getCreatedAt(),
                booking.getUpdatedAt()
        );
    }
}