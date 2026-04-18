package com.nexahub.controller;

import com.nexahub.dto.request.ResourceRequest;
import com.nexahub.dto.response.ResourceResponse;
import com.nexahub.model.enums.ResourceStatus;
import com.nexahub.model.enums.ResourceType;
import com.nexahub.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    /**
     * GET /api/resources
     * Public — anyone can browse the catalogue.
     * Supports optional query params: ?type=LAB&status=ACTIVE&location=Block A&minCapacity=30
     */
    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getAll(
            @RequestParam(required = false) ResourceType   type,
            @RequestParam(required = false) ResourceStatus status,
            @RequestParam(required = false) String         location,
            @RequestParam(required = false) Integer        minCapacity) {

        return ResponseEntity.ok(resourceService.search(type, status, location, minCapacity));
    }

    /**
     * GET /api/resources/{id}
     * Public — view a single resource detail.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(resourceService.getById(id));
    }

    /**
     * POST /api/resources
     * ADMIN only — add a new resource to the catalogue.
     * Returns 201 Created.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceResponse> create(
            @Valid @RequestBody ResourceRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(resourceService.create(request));
    }

    /**
     * PATCH /api/resources/{id}
     * ADMIN only — update an existing resource.
     */
    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody ResourceRequest request) {
        return ResponseEntity.ok(resourceService.update(id, request));
    }

    /**
     * DELETE /api/resources/{id}
     * ADMIN only — remove a resource.
     * Returns 204 No Content.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        resourceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}