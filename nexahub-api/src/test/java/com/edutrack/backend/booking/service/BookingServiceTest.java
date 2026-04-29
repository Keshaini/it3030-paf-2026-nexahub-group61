package com.edutrack.backend.booking.service;

import com.edutrack.backend.auth.entity.UserAccount;
import com.edutrack.backend.auth.repository.UserAccountRepository;
import com.edutrack.backend.booking.config.BookingStatus;
import com.edutrack.backend.booking.entity.Booking;
import com.edutrack.backend.booking.exception.BookingException;
import com.edutrack.backend.booking.repository.BookingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private UserAccountRepository userAccountRepository;

    private BookingService bookingService;

    @BeforeEach
    void setUp() {
        bookingService = new BookingService(bookingRepository, userAccountRepository, null);
    }

    @Test
    void deleteBooking_hidesCancelledBookingFromRequesterHistory() {
        UserAccount requester = createUser(10L, "student@nexahub.com");
        Booking booking = createBooking(99L, requester, BookingStatus.CANCELLED);

        when(bookingRepository.findDetailedById(99L)).thenReturn(Optional.of(booking));
        when(userAccountRepository.findByEmailIgnoreCase("student@nexahub.com")).thenReturn(Optional.of(requester));

        assertDoesNotThrow(() -> bookingService.deleteBooking(99L, "student@nexahub.com"));

        assertEquals(true, booking.isRequesterArchived());
        verify(bookingRepository).save(booking);
    }

    @Test
    void deleteBooking_rejectsApprovedBooking() {
        UserAccount requester = createUser(10L, "student@nexahub.com");
        Booking booking = createBooking(100L, requester, BookingStatus.APPROVED);

        when(bookingRepository.findDetailedById(100L)).thenReturn(Optional.of(booking));
        when(userAccountRepository.findByEmailIgnoreCase("student@nexahub.com")).thenReturn(Optional.of(requester));

        BookingException exception = assertThrows(
                BookingException.class,
                () -> bookingService.deleteBooking(100L, "student@nexahub.com")
        );

        assertEquals("Only pending, rejected, or cancelled bookings can be deleted", exception.getMessage());
        verify(bookingRepository, never()).save(booking);
    }

    @Test
    void deleteBookingAsAdmin_deletesCancelledBookingFromDatabase() {
        UserAccount requester = createUser(10L, "student@nexahub.com");
        UserAccount admin = createUser(1L, "admin@nexahub.com");
        admin.setRole("ADMIN");
        Booking booking = createBooking(101L, requester, BookingStatus.CANCELLED);

        when(bookingRepository.findDetailedById(101L)).thenReturn(Optional.of(booking));
        when(userAccountRepository.findByEmailIgnoreCase("admin@nexahub.com")).thenReturn(Optional.of(admin));

        assertDoesNotThrow(() -> bookingService.deleteBookingAsAdmin(101L, "admin@nexahub.com"));

        verify(bookingRepository).delete(booking);
    }

    private UserAccount createUser(Long id, String email) {
        UserAccount user = new UserAccount();
        ReflectionTestUtils.setField(user, "id", id);
        user.setEmail(email);
        user.setRole("USER");
        user.setFullName("Test User");
        user.setItNumber("IT123456");
        user.setPasswordHash("secret");
        return user;
    }

    private Booking createBooking(Long id, UserAccount requester, BookingStatus status) {
        Booking booking = new Booking();
        ReflectionTestUtils.setField(booking, "id", id);
        booking.setRequestedBy(requester);
        booking.setStatus(status);
        return booking;
    }
}
