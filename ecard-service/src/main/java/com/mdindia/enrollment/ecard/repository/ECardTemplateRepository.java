package com.mdindia.enrollment.ecard.repository;

import com.mdindia.enrollment.ecard.entity.ECardTemplateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ECardTemplateRepository extends JpaRepository<ECardTemplateEntity, String> {
    Optional<ECardTemplateEntity> findByInsurerIdAndCorporateId(String insurerId, String corporateId);
    List<ECardTemplateEntity> findByActive(Boolean active);
}
