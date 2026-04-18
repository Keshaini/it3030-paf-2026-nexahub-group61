package com.edutrack.backend.booking.service;

import com.edutrack.backend.auth.config.RoleNames;
import com.edutrack.backend.auth.entity.UserAccount;
import com.edutrack.backend.auth.repository.UserAccountRepository;
import com.edutrack.backend.booking.config.BookingStatus;
import com.edutrack.backend.booking.dto.BookingActionRequest;
import com.edutrack.backend.booking.dto.BookingResponse;
import com.edutrack.backend.booking.dto.CreateBookingRequest;
import com.edutrack.backend.booking.dto.UpdateBookingRequest;
import com.edutrack.backend.booking.entity.Booking;
import com.edutrack.backend.booking.entity.Resource;
import com.edutrack.backend.booking.exception.BookingException;
import com.edutrack.backend.booking.repository.BookingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class BookingService {

    private static final Set<BookingStatus> ACTIVE_STATUSES = EnumSet.of(BookingStatus.PENDING, BookingStatus.APPROVED);

    private final BookingRepository bookingRepository;
    private final UserAccountRepository userAccountRepository;
    private final ResourceService resourceService;

    public BookingService(
            BookingRepository bookingRepository,
            UserAccountRepository userAccountRepository,
            ResourceService resourceService
    ) {
        this.bookingRepository = bookingRepository;
        this.userAccountRepository = userAccountRepository;
        this.resourceService = resourceService;
    }

    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request) {
        UserAccount requester = requireUser(request.requesterEmail());
        Resource resource = resourceService.requireActiveResource(request.resourceId());

        validateTimeWindow(request.startTime(), request.endTime());
        validateCapacity(resource, request.expectedAttendees());
        ensureNoConflict(resource.getId(), request.bookingDate(), request.startTime(), request.endTime(), null);

        Booking booking = new Booking();
        booking.setRequestedBy(requester);
        applyBookingDetails(
                booking,
                resource,
                request.bookingDate(),
                request.startTime(),
                request.endTime(),
                request.purpose(),
                request.expectedAttendees()
        );
        booking.setStatus(BookingStatus.PENDING);

        return BookingResponse.fromEntity(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse updateBooking(Long bookingId, UpdateBookingRequest request) {
        Booking booking = requireDetailedBooking(bookingId);
        UserAccount requester = requireUser(request.requesterEmail());
        Resource resource = resourceService.requireActiveResource(request.resourceId());

        if (!booking.getRequestedBy().getId().equals(requester.getId())) {
            throw new BookingException("Only the requester can edit this booking");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BookingException("Only pending bookings can be edited");
        }

        validateTimeWindow(request.startTime(), request.endTime());
        validateCapacity(resource, request.expectedAttendees());
        ensureNoConflict(resource.getId(), request.bookingDate(), request.startTime(), request.endTime(), booking.getId());

        applyBookingDetails(
                booking,
                resource,
                request.bookingDate(),
                request.startTime(),
                request.endTime(),
                request.purpose(),
                request.expectedAttendees()
        );

        return BookingResponse.fromEntity(bookingRepository.save(booking));
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(String email, String status) {
        requireUser(email);
        BookingStatus bookingStatus = parseStatus(status);

        return bookingRepository.findAllByRequesterEmail(email.trim(), bookingStatus)
                .stream()
                .map(BookingResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings(String actorEmail, Long resourceId, LocalDate bookingDate, String status) {
        requireAdmin(actorEmail);
        BookingStatus bookingStatus = parseStatus(status);

        return bookingRepository.findAllForAdmin(bookingStatus, resourceId, bookingDate)
                .stream()
                .map(BookingResponse::fromEntity)
                .toList();
    }

    @Transactional
    public BookingResponse approveBooking(Long bookingId, BookingActionRequest request) {
        Booking booking = requireDetailedBooking(bookingId);
        UserAccount admin = requireAdmin(request.actorEmail());

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BookingException("Only pending bookings can be approved");
        }

        ensureNoConflict(
                booking.getResource().getId(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getId()
        );

        booking.setStatus(BookingStatus.APPROVED);
        booking.setReviewedBy(admin);
        booking.setReviewedAt(LocalDateTime.now());
        booking.setRejectionReason(null);

        return BookingResponse.fromEntity(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse rejectBooking(Long bookingId, BookingActionRequest request) {
        Booking booking = requireDetailedBooking(bookingId);
        UserAccount admin = requireAdmin(request.actorEmail());
        String reason = normalizeReason(request.reason());

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BookingException("Only pending bookings can be rejected");
        }

        if (reason == null) {
            throw new BookingException("Rejection reason is required");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setReviewedBy(admin);
        booking.setReviewedAt(LocalDateTime.now());
        booking.setRejectionReason(reason);

        return BookingResponse.fromEntity(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse cancelBooking(Long bookingId, BookingActionRequest request) {
        Booking booking = requireDetailedBooking(bookingId);
        UserAccount actor = requireUser(request.actorEmail());
        boolean isOwner = booking.getRequestedBy().getId().equals(actor.getId());
        boolean isAdmin = RoleNames.ADMIN.equals(normalizeRole(actor.getRole()));

        if (!isOwner && !isAdmin) {
            throw new BookingException("Only the requester or an admin can cancel this booking");
        }

        if (!ACTIVE_STATUSES.contains(booking.getStatus())) {
            throw new BookingException("Only pending or approved bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(normalizeReason(request.reason()));

        if (isAdmin) {
            booking.setReviewedBy(actor);
            booking.setReviewedAt(LocalDateTime.now());
        }

        return BookingResponse.fromEntity(bookingRepository.save(booking));
    }

    @Transactional
    public void deleteBooking(Long bookingId, String requesterEmail) {
        Booking booking = requireDetailedBooking(bookingId);
        UserAccount requester = requireUser(requesterEmail);

        if (!booking.getRequestedBy().getId().equals(requester.getId())) {
            throw new BookingException("Only the requester can delete this booking");
        }

        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.REJECTED) {
            throw new BookingException("Only pending or rejected bookings can be deleted");
        }

        bookingRepository.delete(booking);
    }

    private Booking requireDetailedBooking(Long bookingId) {
        return bookingRepository.findDetailedById(bookingId)
                .orElseThrow(() -> new BookingException("Booking not found"));
    }

    private void applyBookingDetails(
            Booking booking,
            Resource resource,
            LocalDate bookingDate,
            java.time.LocalTime startTime,
            java.time.LocalTime endTime,
            String purpose,
            Integer expectedAttendees
    ) {
        booking.setResource(resource);
        booking.setBookingDate(bookingDate);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setPurpose(purpose.trim());
        booking.setExpectedAttendees(expectedAttendees);
    }

    private void ensureNoConflict(Long resourceId, LocalDate bookingDate, java.time.LocalTime startTime, java.time.LocalTime endTime, Long excludedBookingId) {
        boolean hasConflict = !bookingRepository.findConflicts(
                resourceId,
                bookingDate,
                startTime,
                endTime,
                ACTIVE_STATUSES,
                excludedBookingId
        ).isEmpty();

        if (hasConflict) {
            throw new BookingException("This resource already has a booking in the selected time slot");
        }
    }

    private void validateTimeWindow(java.time.LocalTime startTime, java.time.LocalTime endTime) {
        if (!startTime.isBefore(endTime)) {
            throw new BookingException("Start time must be earlier than end time");
        }
    }

    private void validateCapacity(Resource resource, Integer expectedAttendees) {
        if (expectedAttendees > resource.getCapacity()) {
            throw new BookingException("Expected attendees exceed the resource capacity");
        }
    }

    private BookingStatus parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }

        try {
            return BookingStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BookingException("Unsupported booking status");
        }
    }

    private UserAccount requireUser(String email) {
        return userAccountRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new BookingException("User account not found"));
    }

    private UserAccount requireAdmin(String email) {
        UserAccount user = requireUser(email);

        if (!RoleNames.ADMIN.equals(normalizeRole(user.getRole()))) {
            throw new BookingException("Only admins can perform this action");
        }

        return user;
    }

    private String normalizeRole(String role) {
        return role == null ? "" : role.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeReason(String reason) {
        if (reason == null || reason.isBlank()) {
            return null;
        }

        return reason.trim();
    }
}
