package com.mdindia.enrollment.policy.repository;

import com.mdindia.enrollment.policy.entity.WorkItemEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkItemRepository extends JpaRepository<WorkItemEntity, String> {
    Page<WorkItemEntity> findByStatus(String status, Pageable pageable);
    Optional<WorkItemEntity> findByInwardNo(String inwardNo);
    List<WorkItemEntity> findByStatusAndOnboardingPendingForIsNotNull(String status);
    long countByStatus(String status);
    long countByEnrollmentType(String enrollmentType);
}
