package com.mdindia.enrollment.master.repository;

import com.mdindia.enrollment.master.entity.CorporateGroupEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CorporateGroupRepository extends JpaRepository<CorporateGroupEntity, String> {
}
