package com.mdindia.enrollment.inward.repository;

import com.mdindia.enrollment.inward.entity.InwardEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InwardRepository extends JpaRepository<InwardEntity, String>, JpaSpecificationExecutor<InwardEntity> {
    Page<InwardEntity> findByStatus(String status, Pageable pageable);
    Optional<InwardEntity> findTopByOrderByCreatedAtDesc();
}
