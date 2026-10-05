package com.mdindia.enrollment.policy.repository;

import com.mdindia.enrollment.policy.entity.PolicyEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PolicyRepository extends JpaRepository<PolicyEntity, String> {
    Optional<PolicyEntity> findByPolicyNumber(String policyNumber);
    List<PolicyEntity> findByPolicyRecordType(String policyRecordType);
    List<PolicyEntity> findByInsurerIdAndCorporateIdAndPolicyRecordType(String insurerId, String corporateId, String policyRecordType);
    Page<PolicyEntity> findByStatus(String status, Pageable pageable);
}
