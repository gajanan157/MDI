package com.mdindia.enrollment.policy.repository;

import com.mdindia.enrollment.policy.entity.PolicyEndorsementEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PolicyEndorsementRepository extends JpaRepository<PolicyEndorsementEntity, String> {
    List<PolicyEndorsementEntity> findByPolicyNumber(String policyNumber);
    List<PolicyEndorsementEntity> findByPolicyId(String policyId);
    long countByPolicyNumber(String policyNumber);
}
