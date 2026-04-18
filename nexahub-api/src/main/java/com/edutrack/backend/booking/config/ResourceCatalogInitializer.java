package com.edutrack.backend.booking.config;

import com.edutrack.backend.booking.entity.Resource;
import com.edutrack.backend.booking.repository.ResourceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ResourceCatalogInitializer implements CommandLineRunner {

    private final ResourceRepository resourceRepository;

    public ResourceCatalogInitializer(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    @Override
    public void run(String... args) {
        List<ResourceSeed> seeds = List.of(
                new ResourceSeed("ROOM-A101", "Lecture Room A101", "ROOM", "Academic Block A", 40),
                new ResourceSeed("ROOM-C204", "Seminar Room C204", "ROOM", "Conference Wing", 22),
                new ResourceSeed("LAB-B201", "Computer Lab B201", "LAB", "Engineering Block B", 32),
                new ResourceSeed("LAB-D105", "Electronics Lab D105", "LAB", "Technology Centre", 18),
                new ResourceSeed("EQ-PROJ-01", "Portable Projector Set", "EQUIPMENT", "Media Store", 8),
                new ResourceSeed("EQ-AUDIO-02", "Conference Audio Kit", "EQUIPMENT", "Media Store", 12)
        );

        for (ResourceSeed seed : seeds) {
            if (resourceRepository.existsByCodeIgnoreCase(seed.code())) {
                continue;
            }

            Resource resource = new Resource();
            resource.setCode(seed.code());
            resource.setName(seed.name());
            resource.setCategory(seed.category());
            resource.setLocation(seed.location());
            resource.setCapacity(seed.capacity());
            resource.setActive(true);

            resourceRepository.save(resource);
        }
    }

    private record ResourceSeed(
            String code,
            String name,
            String category,
            String location,
            int capacity
    ) {
    }
}
