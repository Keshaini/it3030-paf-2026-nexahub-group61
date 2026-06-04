package com.edutrack.backend.booking.dto;

import com.nexahub.model.Resource;
import java.util.UUID;

public record ResourceResponse(
        UUID   id,
        String code,
        String name,
        String category,
        String location,
        Integer capacity
) {
    public static ResourceResponse fromEntity(Resource resource) {
        return new ResourceResponse(
                resource.getId(),
                resource.getId().toString(),
                resource.getName(),
                resource.getType().name(),
                resource.getLocation(),
                resource.getCapacity()
        );
    }
}