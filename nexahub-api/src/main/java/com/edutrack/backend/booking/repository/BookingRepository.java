package com.edutrack.backend.booking.repository;

import com.edutrack.backend.booking.config.BookingStatus;
import com.edutrack.backend.booking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("""
        select b from Booking b
        join fetch b.resource r
        join fetch b.requestedBy u
        left join fetch b.reviewedBy rv
        where b.id = :bookingId
        """)
    Optional<Booking> findDetailedById(@Param("bookingId") Long bookingId);

    @Query("""
        select b from Booking b
        join fetch b.resource r
        join fetch b.requestedBy u
        left join fetch b.reviewedBy rv
        where lower(u.email) = lower(:email)
          and (:status is null or b.status = :status)
        order by b.bookingDate desc, b.startTime desc, b.createdAt desc
        """)
    List<Booking> findAllByRequesterEmail(
            @Param("email") String email,
            @Param("status") BookingStatus status
    );

    @Query("""
        select b from Booking b
        join fetch b.resource r
        join fetch b.requestedBy u
        left join fetch b.reviewedBy rv
        where (:status is null or b.status = :status)
          and (:resourceId is null or r.id = :resourceId)
          and (:bookingDate is null or b.bookingDate = :bookingDate)
        order by b.bookingDate desc, b.startTime desc, b.createdAt desc
        """)
    List<Booking> findAllForAdmin(
            @Param("status") BookingStatus status,
            @Param("resourceId") Long resourceId,
            @Param("bookingDate") LocalDate bookingDate
    );

    @Query("""
        select b from Booking b
        join fetch b.resource r
        join fetch b.requestedBy u
        left join fetch b.reviewedBy rv
        where r.id = :resourceId
          and b.bookingDate = :bookingDate
          and b.status in :statuses
          and (:excludedBookingId is null or b.id <> :excludedBookingId)
          and b.startTime < :endTime
          and b.endTime > :startTime
        order by b.startTime asc
        """)
    List<Booking> findConflicts(
            @Param("resourceId") Long resourceId,
            @Param("bookingDate") LocalDate bookingDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("statuses") Collection<BookingStatus> statuses,
            @Param("excludedBookingId") Long excludedBookingId
    );
}
