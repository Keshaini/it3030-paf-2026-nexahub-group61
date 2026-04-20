package com.nexahub.service;

import com.nexahub.dto.request.ResourceRequest;
import com.nexahub.dto.response.ResourceResponse;
import com.nexahub.model.Resource;
import com.nexahub.model.enums.ResourceStatus;
import com.nexahub.model.enums.ResourceType;
import com.nexahub.repository.ResourceRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResourceServiceTest {

    @Mock
    private ResourceRepository resourceRepository;

    @InjectMocks
    private ResourceService resourceService;

    private Resource sampleResource;
    private UUID sampleId;

    @BeforeEach
    void setUp() {
        sampleId = UUID.randomUUID();
        sampleResource = Resource.builder()
                .id(sampleId)
                .name("Lab 301")
                .type(ResourceType.LAB)
                .location("Block A, Floor 3")
                .capacity(30)
                .status(ResourceStatus.ACTIVE)
                .availabilityStart("08:00")
                .availabilityEnd("18:00")
                .build();
    }

    @Test
    void getById_existingId_returnsResource() {
        when(resourceRepository.findById(sampleId))
                .thenReturn(Optional.of(sampleResource));

        ResourceResponse response = resourceService.getById(sampleId);

        assertEquals("Lab 301", response.getName());
        assertEquals("LAB", response.getType());
        assertEquals("ACTIVE", response.getStatus());
    }

    @Test
    void getById_nonExistingId_throwsEntityNotFoundException() {
        UUID fakeId = UUID.randomUUID();
        when(resourceRepository.findById(fakeId))
                .thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> resourceService.getById(fakeId));
    }

    @Test
    void create_validRequest_returnsCreatedResource() {
        ResourceRequest request = new ResourceRequest();
        request.setName("Meeting Room A");
        request.setType(ResourceType.MEETING_ROOM);
        request.setLocation("Block B");
        request.setCapacity(10);

        when(resourceRepository.save(any(Resource.class)))
                .thenReturn(sampleResource);

        ResourceResponse response = resourceService.create(request);

        assertNotNull(response);
        verify(resourceRepository, times(1))
                .save(any(Resource.class));
    }

    @Test
    void delete_existingId_deletesSuccessfully() {
        when(resourceRepository.existsById(sampleId))
                .thenReturn(true);
        doNothing().when(resourceRepository)
                .deleteById(sampleId);

        assertDoesNotThrow(() -> resourceService.delete(sampleId));
        verify(resourceRepository, times(1))
                .deleteById(sampleId);
    }

    @Test
    void delete_nonExistingId_throwsEntityNotFoundException() {
        UUID fakeId = UUID.randomUUID();
        when(resourceRepository.existsById(fakeId))
                .thenReturn(false);

        assertThrows(EntityNotFoundException.class,
                () -> resourceService.delete(fakeId));
    }

    @Test
    void search_returnsFilteredList() {
        when(resourceRepository.search(any(), any(), any(), any()))
                .thenReturn(List.of(sampleResource));

        List<ResourceResponse> results = resourceService.search(
                ResourceType.LAB,
                ResourceStatus.ACTIVE,
                "Block A",
                20);

        assertEquals(1, results.size());
        assertEquals("Lab 301", results.get(0).getName());
    }
}