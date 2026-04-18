package com.nexahub.model;

import com.nexahub.model.enums.ResourceStatus;
import com.nexahub.model.enums.ResourceType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "resources")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceType type;

    @Column(nullable = false)
    private String location;

    // Capacity is nullable for equipment like projectors
    private Integer capacity;

    @Column(name = "availability_start")
    private String availabilityStart; // e.g. "08:00"

    @Column(name = "availability_end")
    private String availabilityEnd;   // e.g. "18:00"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ResourceStatus status = ResourceStatus.ACTIVE;

    // Optional extra info — e.g. "Has projector, AC, 40 seats"
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}