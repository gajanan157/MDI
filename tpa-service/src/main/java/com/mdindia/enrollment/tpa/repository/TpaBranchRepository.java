package com.mdindia.enrollment.tpa.repository;

import com.mdindia.enrollment.tpa.entity.TpaBranchEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface TpaBranchRepository extends JpaRepository<TpaBranchEntity, String>, JpaSpecificationExecutor<TpaBranchEntity> {
    boolean existsByTpaIdAndBranchNameIgnoreCase(String tpaId, String branchName);

    long countByTpaId(String tpaId);

    List<TpaBranchEntity> findByTpaIdOrderByBranchCode(String tpaId);
}
