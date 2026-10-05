package com.mdindia.enrollment.inward.repository;

import com.mdindia.enrollment.inward.entity.PsuFileMetadataEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PsuFileMetadataRepository extends JpaRepository<PsuFileMetadataEntity, String> {
    List<PsuFileMetadataEntity> findByStatus(String status);
}
