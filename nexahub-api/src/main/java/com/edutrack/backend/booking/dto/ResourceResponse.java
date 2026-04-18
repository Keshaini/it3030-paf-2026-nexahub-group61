package com.edutrack.backend.booking.dto;

import com.edutrack.backend.booking.entity.Resource;

public record ResourceResponse(
        Long id,
        String code,
        String name,
        String category,
        String location,
        Integer capacity
) {

    public static ResourceResponse fromEntity(Resource resource) {
        return new ResourceResponse(
                resource.getId(),
                resource.getCode(),
                resource.getName(),
                resource.getCategory(),
                resource.getLocation(),
                resource.getCapacity()
        );
    }
}
