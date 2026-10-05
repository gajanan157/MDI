package com.mdindia.enrollment.member.repository;

import com.mdindia.enrollment.member.entity.EnrollmentProgressEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EnrollmentProgressRepository extends JpaRepository<EnrollmentProgressEntity, String> {
    Optional<EnrollmentProgressEntity> findByPolicyIdAndInwardNo(String policyId, String inwardNo);
    Optional<EnrollmentProgressEntity> findByInwardNo(String inwardNo);
}
