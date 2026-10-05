package com.mdindia.enrollment.master.repository;

import com.mdindia.enrollment.master.entity.InsurerOfficeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InsurerOfficeRepository extends JpaRepository<InsurerOfficeEntity, String> {
    List<InsurerOfficeEntity> findByInsurerId(String insurerId);
    List<InsurerOfficeEntity> findByInsurerIdAndOfficeType(String insurerId, String officeType);
}
