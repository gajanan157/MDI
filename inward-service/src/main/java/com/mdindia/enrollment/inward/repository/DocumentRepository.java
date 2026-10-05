package com.mdindia.enrollment.inward.repository;

import com.mdindia.enrollment.inward.entity.DocumentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<DocumentEntity, String> {
    List<DocumentEntity> findByInwardNo(String inwardNo);
    List<DocumentEntity> findByInwardNoAndDocumentType(String inwardNo, String documentType);
}
