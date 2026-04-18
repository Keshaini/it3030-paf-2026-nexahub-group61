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
                new ResourceSeed("ROOM-B115", "Tutorial Room B115", "ROOM", "Academic Block B", 24),
                new ResourceSeed("ROOM-C204", "Seminar Room C204", "ROOM", "Conference Wing", 22),
                new ResourceSeed("ROOM-E301", "Lecture Room E301", "ROOM", "Faculty Block E", 36),
                new ResourceSeed("ROOM-F402", "Board Room F402", "ROOM", "Administration Tower", 16),
                new ResourceSeed("LAB-B201", "Computer Lab B201", "LAB", "Engineering Block B", 32),
                new ResourceSeed("LAB-C110", "Language Lab C110", "LAB", "Learning Centre", 26),
                new ResourceSeed("LAB-D105", "Electronics Lab D105", "LAB", "Technology Centre", 18),
                new ResourceSeed("LAB-F110", "Networking Lab F110", "LAB", "Faculty Block F", 28),
                new ResourceSeed("LAB-H205", "Innovation Lab H205", "LAB", "Research Hub", 20),
                new ResourceSeed("EQ-PROJ-01", "Portable Projector Set", "EQUIPMENT", "Media Store", 8),
                new ResourceSeed("EQ-AUDIO-02", "Conference Audio Kit", "EQUIPMENT", "Media Store", 12),
                new ResourceSeed("EQ-CAM-01", "DSLR Camera Kit", "EQUIPMENT", "Media Store", 4),
                new ResourceSeed("EQ-LAPTOP-05", "Laptop Pool Set", "EQUIPMENT", "IT Service Desk", 15),
                new ResourceSeed("EQ-MIC-03", "Wireless Microphone Pack", "EQUIPMENT", "Media Store", 6)
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
