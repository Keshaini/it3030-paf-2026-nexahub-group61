package com.edutrack.backend.booking.service;

import com.edutrack.backend.booking.dto.ResourceResponse;
import com.edutrack.backend.booking.entity.Resource;
import com.edutrack.backend.booking.exception.BookingException;
import com.edutrack.backend.booking.repository.ResourceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    @Transactional(readOnly = true)
    public List<ResourceResponse> getActiveResources() {
        return resourceRepository.findAllByActiveTrueOrderByCategoryAscNameAsc()
                .stream()
                .map(ResourceResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public Resource requireActiveResource(Long resourceId) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new BookingException("Resource not found"));

        if (!resource.isActive()) {
            throw new BookingException("Resource is not available for booking");
        }

        return resource;
    }
}
