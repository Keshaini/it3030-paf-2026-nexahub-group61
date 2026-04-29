package com.edutrack.backend.booking.controller;

import com.edutrack.backend.booking.dto.ResourceResponse;
import com.edutrack.backend.booking.service.ResourceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getResources() {
        return ResponseEntity.ok(resourceService.getActiveResources());
    }
}
