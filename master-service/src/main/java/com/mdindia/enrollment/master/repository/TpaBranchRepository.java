package com.mdindia.enrollment.master.repository;

import com.mdindia.enrollment.master.entity.TpaBranchEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TpaBranchRepository extends JpaRepository<TpaBranchEntity, String> {
}
