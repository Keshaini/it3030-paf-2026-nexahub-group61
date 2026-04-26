package com.nexahub.dto.request;

import com.nexahub.model.enums.ResourceStatus;
import com.nexahub.model.enums.ResourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class ResourceRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Type is required")
    private ResourceType type;

    @NotBlank(message = "Location is required")
    private String location;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    private String availabilityStart;
    private String availabilityEnd;
    private String description;

    // Status is optional on create — defaults to ACTIVE in entity
    private ResourceStatus status;
}