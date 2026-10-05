package com.mdindia.enrollment.common.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberRecordDto {
    private String id;
    private String stagingMemberEnrollmentId;
    private String memberEnrollmentId;
    private String policyId;
    private String policyNumber;
    private String inwardNo;
    
    @JsonProperty("insuredMemberUniqueHealthIdentificationNumber")
    private String uhid;
    
    private String healthCardNumber;
    private String corporateEmployeeCode;
    private String insuredMemberName;
    private LocalDate insuredMemberDob;
    private Integer insuredMemberAge;
    private String insuredMemberGender;
    
    @JsonProperty("insuredMemberRelationshipWithSubscriber")
    private String relationship;
    
    private Double sumInsured;
    private String recordStatus;
    private String enrollmentStatus;
    private String enrollmentStatusReason;
    
    // Discrepancy & Exception fields
    private String comment;
    private String exceptionCategory;
    private LocalDate dateOfJoining;
    private String email;
    private String mobile;
    
    // Reconciliation fields
    private String reconciliationStatus;
    private String reconciliationRemark;
    private String policyRecordType;
    
    // Endorsement fields
    private String enrollmentAction;
    private String policyEndorsementId;
}
