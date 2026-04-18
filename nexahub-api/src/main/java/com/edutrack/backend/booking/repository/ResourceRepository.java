package com.edutrack.backend.booking.repository;

import com.edutrack.backend.booking.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    boolean existsByCodeIgnoreCase(String code);

    Optional<Resource> findByCodeIgnoreCase(String code);

    List<Resource> findAllByActiveTrueOrderByCategoryAscNameAsc();
}
