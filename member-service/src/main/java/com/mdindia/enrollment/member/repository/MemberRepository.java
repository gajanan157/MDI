package com.mdindia.enrollment.member.repository;

import com.mdindia.enrollment.member.entity.MemberEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<MemberEntity, String> {
    Page<MemberEntity> findByPolicyIdAndEnrollmentStatus(String policyId, String enrollmentStatus, Pageable pageable);
    List<MemberEntity> findByPolicyIdAndEnrollmentStatus(String policyId, String enrollmentStatus);
    Page<MemberEntity> findByPolicyIdAndExceptionCategory(String policyId, String exceptionCategory, Pageable pageable);
    List<MemberEntity> findByPolicyIdAndExceptionCategory(String policyId, String exceptionCategory);
    List<MemberEntity> findByPolicyId(String policyId);

    @Query("SELECT m FROM MemberEntity m WHERE m.policyId = :policyId AND m.reconciliationStatus IN :statuses")
    Page<MemberEntity> findByPolicyIdAndReconciliationStatusIn(String policyId, List<String> statuses, Pageable pageable);

    @Query("SELECT m FROM MemberEntity m WHERE m.policyId = :policyId AND m.comment IS NOT NULL AND m.comment != ''")
    Page<MemberEntity> findDiscrepancies(String policyId, Pageable pageable);

    long countByPolicyIdAndEnrollmentStatus(String policyId, String enrollmentStatus);
    long countByPolicyIdAndRelationship(String policyId, String relationship);
    long countByPolicyId(String policyId);

    List<MemberEntity> findByPolicyEndorsementId(String policyEndorsementId);
    Page<MemberEntity> findByPolicyEndorsementId(String policyEndorsementId, Pageable pageable);

    Optional<MemberEntity> findByStagingMemberEnrollmentId(String stagingMemberEnrollmentId);
    Optional<MemberEntity> findByHealthCardNumber(String healthCardNumber);
}
