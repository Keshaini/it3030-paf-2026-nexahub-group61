package com.nexahub.service;

import com.nexahub.dto.request.ResourceRequest;
import com.nexahub.dto.response.ResourceResponse;
import com.nexahub.model.Resource;
import com.nexahub.model.enums.ResourceStatus;
import com.nexahub.model.enums.ResourceType;
import com.nexahub.repository.ResourceRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    // ── GET all with optional filters ──────────────────────────────────────
    public List<ResourceResponse> search(ResourceType type,
                                         ResourceStatus status,
                                         String location,
                                         Integer minCapacity) {
        return resourceRepository
                .search(type, status, location, minCapacity)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── GET single ─────────────────────────────────────────────────────────
    public ResourceResponse getById(UUID id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                    "Resource not found with id: " + id));
        return toResponse(resource);
    }

    // ── POST create ────────────────────────────────────────────────────────
    @Transactional
    public ResourceResponse create(ResourceRequest request) {
        Resource resource = Resource.builder()
                .name(request.getName())
                .type(request.getType())
                .location(request.getLocation())
                .capacity(request.getCapacity())
                .availabilityStart(request.getAvailabilityStart())
                .availabilityEnd(request.getAvailabilityEnd())
                .description(request.getDescription())
                .status(request.getStatus() != null
                        ? request.getStatus()
                        : ResourceStatus.ACTIVE)
                .build();
        return toResponse(resourceRepository.save(resource));
    }

    // ── PATCH update ───────────────────────────────────────────────────────
    @Transactional
    public ResourceResponse update(UUID id, ResourceRequest request) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                    "Resource not found with id: " + id));

        if (request.getName()              != null) resource.setName(request.getName());
        if (request.getType()              != null) resource.setType(request.getType());
        if (request.getLocation()          != null) resource.setLocation(request.getLocation());
        if (request.getCapacity()          != null) resource.setCapacity(request.getCapacity());
        if (request.getAvailabilityStart() != null) resource.setAvailabilityStart(request.getAvailabilityStart());
        if (request.getAvailabilityEnd()   != null) resource.setAvailabilityEnd(request.getAvailabilityEnd());
        if (request.getDescription()       != null) resource.setDescription(request.getDescription());
        if (request.getStatus()            != null) resource.setStatus(request.getStatus());

        return toResponse(resourceRepository.save(resource));
    }

    // ── DELETE ─────────────────────────────────────────────────────────────
    @Transactional
    public void delete(UUID id) {
        if (!resourceRepository.existsById(id)) {
            throw new EntityNotFoundException("Resource not found with id: " + id);
        }
        resourceRepository.deleteById(id);
    }

    // ── Entity → DTO mapper ────────────────────────────────────────────────
    public ResourceResponse toResponse(Resource r) {
        return ResourceResponse.builder()
                .id(r.getId())
                .name(r.getName())
                .type(r.getType().name())
                .location(r.getLocation())
                .capacity(r.getCapacity())
                .availabilityStart(r.getAvailabilityStart())
                .availabilityEnd(r.getAvailabilityEnd())
                .status(r.getStatus().name())
                .description(r.getDescription())
                .createdAt(r.getCreatedAt())
                .build();
    }
}