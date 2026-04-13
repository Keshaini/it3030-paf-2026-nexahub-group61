package com.edutrack.backend.controller;

import com.edutrack.backend.entity.Resource;
import com.edutrack.backend.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "*")
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    @PostMapping("/add")
    public Resource addResource(@Valid @RequestBody Resource resource) {
        return resourceService.saveResource(resource);
    }

    @GetMapping("/all")
    public List<Resource> getAll() {
        return resourceService.getAllResources();
    }

    @GetMapping("/{id}")
    public Resource getById(@PathVariable Long id) {
        return resourceService.getResourceById(id);
    }

    @PutMapping("/{id}")
    public Resource updateResource(@PathVariable Long id, @Valid @RequestBody Resource details) {
        return resourceService.updateResource(id, details);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return "Deleted successfully";
    }

    // --- NEW MASTER SEARCH ENDPOINT ---
    // This fulfills: Search and filter resources by type, capacity, location, status
    @GetMapping("/search")
    public List<Resource> searchResources(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String status) {

        if (type != null) return resourceService.getByType(type);
        if (minCapacity != null) return resourceService.getByCapacity(minCapacity);
        if (location != null) return resourceService.getByLocation(location);
        if (status != null) return resourceService.getByStatus(status);

        return resourceService.getAllResources();
    }
}