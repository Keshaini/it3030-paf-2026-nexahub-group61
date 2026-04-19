package com.edutrack.backend.ticket.dto;

import jakarta.validation.constraints.NotBlank;

public record AddCommentRequest(@NotBlank String content) {}
