package com.nexahub.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ResourceResponse {
    private UUID   id;
    private String name;
    private String type;
    private String location;
    private Integer capacity;
    private String availabilityStart;
    private String availabilityEnd;
    private String status;
    private String description;
    private LocalDateTime createdAt;
}