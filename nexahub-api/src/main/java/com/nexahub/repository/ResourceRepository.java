package com.nexahub.repository;

import com.nexahub.model.Resource;
import com.nexahub.model.enums.ResourceStatus;
import com.nexahub.model.enums.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, UUID> {

    // Filter by type
    List<Resource> findByType(ResourceType type);

    // Filter by status
    List<Resource> findByStatus(ResourceStatus status);

    // Filter by type AND status
    List<Resource> findByTypeAndStatus(ResourceType type, ResourceStatus status);

    // Search by name or location (case-insensitive)
    @Query("SELECT r FROM Resource r WHERE " +
       "(:type IS NULL OR r.type = :type) AND " +
       "(:status IS NULL OR r.status = :status) AND " +
       "(:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%', CAST(:location AS string), '%'))) AND " +
       "(:minCapacity IS NULL OR r.capacity >= :minCapacity)")
List<Resource> search(
    @Param("type")        ResourceType   type,
    @Param("status")      ResourceStatus status,
    @Param("location")    String         location,
    @Param("minCapacity") Integer        minCapacity
);
}