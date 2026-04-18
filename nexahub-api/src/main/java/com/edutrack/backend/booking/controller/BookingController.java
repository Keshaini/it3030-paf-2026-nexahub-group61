package com.edutrack.backend.booking.controller;

import com.edutrack.backend.booking.dto.BookingActionRequest;
import com.edutrack.backend.booking.dto.BookingResponse;
import com.edutrack.backend.booking.dto.CreateBookingRequest;
import com.edutrack.backend.booking.dto.UpdateBookingRequest;
import com.edutrack.backend.booking.service.BookingService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@Validated
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody CreateBookingRequest request) {
        BookingResponse response = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @RequestParam @NotBlank @Email String email,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(bookingService.getMyBookings(email, status));
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings(
            @RequestParam @NotBlank @Email String actorEmail,
            @RequestParam(required = false) Long resourceId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate bookingDate,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(bookingService.getAllBookings(actorEmail, resourceId, bookingDate, status));
    }

    @PutMapping("/{bookingId}")
    public ResponseEntity<BookingResponse> updateBooking(
            @PathVariable Long bookingId,
            @Valid @RequestBody UpdateBookingRequest request
    ) {
        return ResponseEntity.ok(bookingService.updateBooking(bookingId, request));
    }

    @PatchMapping("/{bookingId}/approve")
    public ResponseEntity<BookingResponse> approveBooking(
            @PathVariable Long bookingId,
            @Valid @RequestBody BookingActionRequest request
    ) {
        return ResponseEntity.ok(bookingService.approveBooking(bookingId, request));
    }

    @PatchMapping("/{bookingId}/reject")
    public ResponseEntity<BookingResponse> rejectBooking(
            @PathVariable Long bookingId,
            @Valid @RequestBody BookingActionRequest request
    ) {
        return ResponseEntity.ok(bookingService.rejectBooking(bookingId, request));
    }

    @PatchMapping("/{bookingId}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long bookingId,
            @Valid @RequestBody BookingActionRequest request
    ) {
        return ResponseEntity.ok(bookingService.cancelBooking(bookingId, request));
    }
}
