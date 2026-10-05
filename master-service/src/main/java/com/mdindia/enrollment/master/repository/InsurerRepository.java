package com.mdindia.enrollment.master.repository;

import com.mdindia.enrollment.master.entity.InsurerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InsurerRepository extends JpaRepository<InsurerEntity, String> {
}
