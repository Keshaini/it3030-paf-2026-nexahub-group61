package com.edutrack.backend.service;

import com.edutrack.backend.entity.Resource;
import com.edutrack.backend.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    public Resource saveResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public Resource getResourceById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
    }

    public Resource updateResource(Long id, Resource details) {
        Resource existing = getResourceById(id);
        existing.setName(details.getName());
        existing.setType(details.getType());
        existing.setCapacity(details.getCapacity());
        existing.setLocation(details.getLocation());
        existing.setStatus(details.getStatus());
        existing.setAvailability_Windows(details.getAvailability_Windows());
        return resourceRepository.save(existing);
    }

    public void deleteResource(Long id) {
        resourceRepository.deleteById(id);
    }

    // New Search Features
    public List<Resource> getByType(String type) {
        return resourceRepository.findByType(type);
    }

    public List<Resource> getByStatus(String status) {
        return resourceRepository.findByStatus(status);
    }

    public List<Resource> getByCapacity(Integer capacity) {
        return resourceRepository.findByCapacityGreaterThanEqual(capacity);
    }

    public List<Resource> getByLocation(String location) {
        return resourceRepository.findByLocationContainingIgnoreCase(location);
    }
}