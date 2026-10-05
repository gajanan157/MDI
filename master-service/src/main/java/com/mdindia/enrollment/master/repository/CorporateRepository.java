package com.mdindia.enrollment.master.repository;

import com.mdindia.enrollment.master.entity.CorporateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CorporateRepository extends JpaRepository<CorporateEntity, String> {
    List<CorporateEntity> findByCorporateGroupId(String corporateGroupId);
}
