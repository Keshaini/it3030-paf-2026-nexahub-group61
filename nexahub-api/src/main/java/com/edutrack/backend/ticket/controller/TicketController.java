package com.edutrack.backend.ticket.controller;

import com.edutrack.backend.ticket.dto.*;
import com.edutrack.backend.ticket.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    // ── Tickets ──────────────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<TicketDto> createTicket(
        @Valid @RequestBody CreateTicketRequest request,
        @RequestHeader("X-User-Email") String email
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createTicket(request, email));
    }

    @GetMapping
    public ResponseEntity<List<TicketDto>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/mine")
    public ResponseEntity<List<TicketDto>> getMyTickets(
        @RequestHeader("X-User-Email") String email
    ) {
        return ResponseEntity.ok(ticketService.getMyTickets(email));
    }

    @GetMapping("/assigned")
    public ResponseEntity<List<TicketDto>> getAssignedTickets(
        @RequestHeader("X-User-Email") String email
    ) {
        return ResponseEntity.ok(ticketService.getAssignedTickets(email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketDto> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TicketDto> updateStatus(
        @PathVariable Long id,
        @Valid @RequestBody UpdateTicketStatusRequest request,
        @RequestHeader("X-User-Email") String email,
        @RequestHeader("X-User-Role") String role
    ) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, request, email, role));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(
        @PathVariable Long id,
        @RequestHeader("X-User-Email") String email,
        @RequestHeader("X-User-Role") String role
    ) {
        ticketService.deleteTicket(id, email, role);
        return ResponseEntity.noContent().build();
    }

    // ── Comments ─────────────────────────────────────────────────────────────

    @GetMapping("/{ticketId}/comments")
    public ResponseEntity<List<TicketCommentDto>> getComments(@PathVariable Long ticketId) {
        return ResponseEntity.ok(ticketService.getComments(ticketId));
    }

    @PostMapping("/{ticketId}/comments")
    public ResponseEntity<TicketCommentDto> addComment(
        @PathVariable Long ticketId,
        @Valid @RequestBody AddCommentRequest request,
        @RequestHeader("X-User-Email") String email,
        @RequestHeader("X-User-Role") String role
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ticketService.addComment(ticketId, request, email, role));
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<TicketCommentDto> updateComment(
        @PathVariable Long commentId,
        @Valid @RequestBody AddCommentRequest request,
        @RequestHeader("X-User-Email") String email,
        @RequestHeader("X-User-Role") String role
    ) {
        return ResponseEntity.ok(ticketService.updateComment(commentId, request, email, role));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
        @PathVariable Long commentId,
        @RequestHeader("X-User-Email") String email,
        @RequestHeader("X-User-Role") String role
    ) {
        ticketService.deleteComment(commentId, email, role);
        return ResponseEntity.noContent().build();
    }

    // ── Global exception handling ──────────────────────────────────────────

    @ExceptionHandler({IllegalArgumentException.class, SecurityException.class})
    public ResponseEntity<Map<String, String>> handleError(RuntimeException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }
}
