package com.edutrack.backend.ticket.service;

import com.edutrack.backend.ticket.dto.*;
import com.edutrack.backend.ticket.entity.Ticket;
import com.edutrack.backend.ticket.entity.TicketComment;
import com.edutrack.backend.ticket.repository.TicketCommentRepository;
import com.edutrack.backend.ticket.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class TicketService {

    private static final Set<String> VALID_STATUSES = Set.of(
        "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"
    );

    private static final Set<String> ADMIN_ONLY_STATUSES = Set.of("REJECTED", "CLOSED");

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;

    public TicketService(TicketRepository ticketRepository, TicketCommentRepository commentRepository) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
    }

    // ── Create ──────────────────────────────────────────────────────────────

    @Transactional
    public TicketDto createTicket(CreateTicketRequest request, String reporterEmail) {
        Ticket ticket = new Ticket();
        ticket.setTitle(request.title().trim());
        ticket.setResource(request.resource().trim());
        ticket.setCategory(request.category().trim().toUpperCase(Locale.ROOT));
        ticket.setDescription(request.description().trim());
        ticket.setPriority(request.priority().trim().toUpperCase(Locale.ROOT));
        ticket.setStatus("OPEN");
        ticket.setContactDetails(request.contactDetails() != null ? request.contactDetails().trim() : null);
        ticket.setReporterEmail(reporterEmail.trim().toLowerCase(Locale.ROOT));
        ticket.setImageUrl1(request.imageBase64_1());
        ticket.setImageUrl2(request.imageBase64_2());
        ticket.setImageUrl3(request.imageBase64_3());

        return TicketDto.fromEntity(ticketRepository.save(ticket));
    }

    // ── Read ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<TicketDto> getAllTickets() {
        return ticketRepository.findAllByOrderByCreatedAtDesc()
            .stream().map(TicketDto::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public List<TicketDto> getMyTickets(String email) {
        return ticketRepository.findByReporterEmailIgnoreCaseOrderByCreatedAtDesc(email)
            .stream().map(TicketDto::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public List<TicketDto> getAssignedTickets(String email) {
        return ticketRepository.findByAssignedToEmailIgnoreCaseOrderByCreatedAtDesc(email)
            .stream().map(TicketDto::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public TicketDto getTicketById(Long id) {
        return TicketDto.fromEntity(findTicketOrThrow(id));
    }

    // ── Update Status ─────────────────────────────────────────────────────────

    @Transactional
    public TicketDto updateTicketStatus(Long id, UpdateTicketStatusRequest request,
                                       String callerEmail, String callerRole) {
        Ticket ticket = findTicketOrThrow(id);
        String newStatus = request.status().trim().toUpperCase(Locale.ROOT);

        if (!VALID_STATUSES.contains(newStatus)) {
            throw new IllegalArgumentException("Invalid status: " + newStatus);
        }

        boolean isAdmin = "ADMIN".equalsIgnoreCase(callerRole) || "MANAGER".equalsIgnoreCase(callerRole);
        if (ADMIN_ONLY_STATUSES.contains(newStatus) && !isAdmin) {
            throw new SecurityException("Only Admin/Manager can set status to " + newStatus);
        }

        if ("REJECTED".equals(newStatus) && (request.rejectionReason() == null || request.rejectionReason().isBlank())) {
            throw new IllegalArgumentException("Rejection reason is required when rejecting a ticket");
        }

        ticket.setStatus(newStatus);
        if (request.rejectionReason() != null && !request.rejectionReason().isBlank()) {
            ticket.setRejectionReason(request.rejectionReason().trim());
        }
        if (request.resolutionNotes() != null && !request.resolutionNotes().isBlank()) {
            ticket.setResolutionNotes(request.resolutionNotes().trim());
        }
        if (request.assignedToEmail() != null && !request.assignedToEmail().isBlank()) {
            ticket.setAssignedToEmail(request.assignedToEmail().trim().toLowerCase(Locale.ROOT));
        }

        return TicketDto.fromEntity(ticketRepository.save(ticket));
    }

    // ── Delete ───────────────────────────────────────────────────────────────

    @Transactional
    public void deleteTicket(Long id, String callerEmail, String callerRole) {
        Ticket ticket = findTicketOrThrow(id);
        boolean isAdmin = "ADMIN".equalsIgnoreCase(callerRole) || "MANAGER".equalsIgnoreCase(callerRole);
        if (!isAdmin && !ticket.getReporterEmail().equalsIgnoreCase(callerEmail)) {
            throw new SecurityException("You can only delete your own tickets");
        }
        commentRepository.deleteByTicketId(id);
        ticketRepository.delete(ticket);
    }

    // ── Comments ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<TicketCommentDto> getComments(Long ticketId) {
        findTicketOrThrow(ticketId);
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
            .stream().map(TicketCommentDto::fromEntity).toList();
    }

    @Transactional
    public TicketCommentDto addComment(Long ticketId, AddCommentRequest request,
                                      String authorEmail, String authorRole) {
        findTicketOrThrow(ticketId);
        TicketComment comment = new TicketComment();
        comment.setTicketId(ticketId);
        comment.setAuthorEmail(authorEmail.toLowerCase(Locale.ROOT));
        comment.setAuthorRole(authorRole.toUpperCase(Locale.ROOT));
        comment.setContent(request.content().trim());
        return TicketCommentDto.fromEntity(commentRepository.save(comment));
    }

    @Transactional
    public TicketCommentDto updateComment(Long commentId, AddCommentRequest request,
                                         String callerEmail, String callerRole) {
        TicketComment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new IllegalArgumentException("Comment not found"));
        boolean isAdmin = "ADMIN".equalsIgnoreCase(callerRole);
        if (!isAdmin && !comment.getAuthorEmail().equalsIgnoreCase(callerEmail)) {
            throw new SecurityException("You can only edit your own comments");
        }
        comment.setContent(request.content().trim());
        return TicketCommentDto.fromEntity(commentRepository.save(comment));
    }

    @Transactional
    public void deleteComment(Long commentId, String callerEmail, String callerRole) {
        TicketComment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new IllegalArgumentException("Comment not found"));
        boolean isAdmin = "ADMIN".equalsIgnoreCase(callerRole);
        if (!isAdmin && !comment.getAuthorEmail().equalsIgnoreCase(callerEmail)) {
            throw new SecurityException("You can only delete your own comments");
        }
        commentRepository.delete(comment);
    }

    // ── Helper ───────────────────────────────────────────────────────────────

    private Ticket findTicketOrThrow(Long id) {
        return ticketRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + id));
    }
}
