package com.mdindia.enrollment.member.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "members")
public class MemberEntity {

    @Id
    private String id;

    private String stagingMemberEnrollmentId;
    private String memberEnrollmentId;
    private String policyId;
    private String policyNumber;
    private String inwardNo;
    private String uhid; // insuredMemberUniqueHealthIdentificationNumber
    private String healthCardNumber;
    private String corporateEmployeeCode;
    private String insuredMemberName;
    private LocalDate insuredMemberDob;
    private Integer insuredMemberAge;
    private String insuredMemberGender;
    private String relationship; // insuredMemberRelationshipWithSubscriber
    private Double sumInsured;
    private String recordStatus;
    private String enrollmentStatus; // ENROLLED, VALIDATION_FAILED, DISCREPANCY, EXCEPTION
    private String enrollmentStatusReason;
    private String comment;
    private String exceptionCategory;
    private LocalDate dateOfJoining;
    private String email;
    private String mobile;
    private String reconciliationStatus; // EXISTING_MEMBER_MATCHED, NEW_ENROLLED, MEMBER_DELETED, PARTIAL_MISMATCH
    private String reconciliationRemark;
    private String policyRecordType;
    private String enrollmentAction; // ADDITION, MODIFICATION, DELETION
    private String policyEndorsementId;
    private LocalDateTime createdAt;

    public MemberEntity() {}

    public MemberEntity(String id, String stagingMemberEnrollmentId, String memberEnrollmentId, String policyId,
                        String policyNumber, String inwardNo, String uhid, String healthCardNumber,
                        String corporateEmployeeCode, String insuredMemberName, LocalDate insuredMemberDob,
                        Integer insuredMemberAge, String insuredMemberGender, String relationship, Double sumInsured,
                        String recordStatus, String enrollmentStatus, String enrollmentStatusReason, String comment,
                        String exceptionCategory, LocalDate dateOfJoining, String email, String mobile,
                        String reconciliationStatus, String reconciliationRemark, String policyRecordType,
                        String enrollmentAction, String policyEndorsementId, LocalDateTime createdAt) {
        this.id = id;
        this.stagingMemberEnrollmentId = stagingMemberEnrollmentId;
        this.memberEnrollmentId = memberEnrollmentId;
        this.policyId = policyId;
        this.policyNumber = policyNumber;
        this.inwardNo = inwardNo;
        this.uhid = uhid;
        this.healthCardNumber = healthCardNumber;
        this.corporateEmployeeCode = corporateEmployeeCode;
        this.insuredMemberName = insuredMemberName;
        this.insuredMemberDob = insuredMemberDob;
        this.insuredMemberAge = insuredMemberAge;
        this.insuredMemberGender = insuredMemberGender;
        this.relationship = relationship;
        this.sumInsured = sumInsured;
        this.recordStatus = recordStatus;
        this.enrollmentStatus = enrollmentStatus;
        this.enrollmentStatusReason = enrollmentStatusReason;
        this.comment = comment;
        this.exceptionCategory = exceptionCategory;
        this.dateOfJoining = dateOfJoining;
        this.email = email;
        this.mobile = mobile;
        this.reconciliationStatus = reconciliationStatus;
        this.reconciliationRemark = reconciliationRemark;
        this.policyRecordType = policyRecordType;
        this.enrollmentAction = enrollmentAction;
        this.policyEndorsementId = policyEndorsementId;
        this.createdAt = createdAt;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id;
        private String stagingMemberEnrollmentId;
        private String memberEnrollmentId;
        private String policyId;
        private String policyNumber;
        private String inwardNo;
        private String uhid;
        private String healthCardNumber;
        private String corporateEmployeeCode;
        private String insuredMemberName;
        private LocalDate insuredMemberDob;
        private Integer insuredMemberAge;
        private String insuredMemberGender;
        private String relationship;
        private Double sumInsured;
        private String recordStatus;
        private String enrollmentStatus;
        private String enrollmentStatusReason;
        private String comment;
        private String exceptionCategory;
        private LocalDate dateOfJoining;
        private String email;
        private String mobile;
        private String reconciliationStatus;
        private String reconciliationRemark;
        private String policyRecordType;
        private String enrollmentAction;
        private String policyEndorsementId;
        private LocalDateTime createdAt;

        public Builder id(String id) { this.id = id; return this; }
        public Builder stagingMemberEnrollmentId(String sid) { this.stagingMemberEnrollmentId = sid; return this; }
        public Builder memberEnrollmentId(String mid) { this.memberEnrollmentId = mid; return this; }
        public Builder policyId(String pid) { this.policyId = pid; return this; }
        public Builder policyNumber(String pnum) { this.policyNumber = pnum; return this; }
        public Builder inwardNo(String in) { this.inwardNo = in; return this; }
        public Builder uhid(String u) { this.uhid = u; return this; }
        public Builder healthCardNumber(String hcn) { this.healthCardNumber = hcn; return this; }
        public Builder corporateEmployeeCode(String cec) { this.corporateEmployeeCode = cec; return this; }
        public Builder insuredMemberName(String imn) { this.insuredMemberName = imn; return this; }
        public Builder insuredMemberDob(LocalDate dob) { this.insuredMemberDob = dob; return this; }
        public Builder insuredMemberAge(Integer a) { this.insuredMemberAge = a; return this; }
        public Builder insuredMemberGender(String g) { this.insuredMemberGender = g; return this; }
        public Builder relationship(String r) { this.relationship = r; return this; }
        public Builder sumInsured(Double si) { this.sumInsured = si; return this; }
        public Builder recordStatus(String rs) { this.recordStatus = rs; return this; }
        public Builder enrollmentStatus(String es) { this.enrollmentStatus = es; return this; }
        public Builder enrollmentStatusReason(String esr) { this.enrollmentStatusReason = esr; return this; }
        public Builder comment(String c) { this.comment = c; return this; }
        public Builder exceptionCategory(String ec) { this.exceptionCategory = ec; return this; }
        public Builder dateOfJoining(LocalDate doj) { this.dateOfJoining = doj; return this; }
        public Builder email(String e) { this.email = e; return this; }
        public Builder mobile(String m) { this.mobile = m; return this; }
        public Builder reconciliationStatus(String rs) { this.reconciliationStatus = rs; return this; }
        public Builder reconciliationRemark(String rr) { this.reconciliationRemark = rr; return this; }
        public Builder policyRecordType(String prt) { this.policyRecordType = prt; return this; }
        public Builder enrollmentAction(String ea) { this.enrollmentAction = ea; return this; }
        public Builder policyEndorsementId(String peid) { this.policyEndorsementId = peid; return this; }
        public Builder createdAt(LocalDateTime t) { this.createdAt = t; return this; }

        public MemberEntity build() {
            return new MemberEntity(id, stagingMemberEnrollmentId, memberEnrollmentId, policyId, policyNumber, inwardNo, uhid, healthCardNumber, corporateEmployeeCode, insuredMemberName, insuredMemberDob, insuredMemberAge, insuredMemberGender, relationship, sumInsured, recordStatus, enrollmentStatus, enrollmentStatusReason, comment, exceptionCategory, dateOfJoining, email, mobile, reconciliationStatus, reconciliationRemark, policyRecordType, enrollmentAction, policyEndorsementId, createdAt);
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getStagingMemberEnrollmentId() { return stagingMemberEnrollmentId; }
    public void setStagingMemberEnrollmentId(String stagingMemberEnrollmentId) { this.stagingMemberEnrollmentId = stagingMemberEnrollmentId; }
    public String getMemberEnrollmentId() { return memberEnrollmentId; }
    public void setMemberEnrollmentId(String memberEnrollmentId) { this.memberEnrollmentId = memberEnrollmentId; }
    public String getPolicyId() { return policyId; }
    public void setPolicyId(String policyId) { this.policyId = policyId; }
    public String getPolicyNumber() { return policyNumber; }
    public void setPolicyNumber(String policyNumber) { this.policyNumber = policyNumber; }
    public String getInwardNo() { return inwardNo; }
    public void setInwardNo(String inwardNo) { this.inwardNo = inwardNo; }
    public String getUhid() { return uhid; }
    public void setUhid(String uhid) { this.uhid = uhid; }
    public String getHealthCardNumber() { return healthCardNumber; }
    public void setHealthCardNumber(String healthCardNumber) { this.healthCardNumber = healthCardNumber; }
    public String getCorporateEmployeeCode() { return corporateEmployeeCode; }
    public void setCorporateEmployeeCode(String corporateEmployeeCode) { this.corporateEmployeeCode = corporateEmployeeCode; }
    public String getInsuredMemberName() { return insuredMemberName; }
    public void setInsuredMemberName(String insuredMemberName) { this.insuredMemberName = insuredMemberName; }
    public LocalDate getInsuredMemberDob() { return insuredMemberDob; }
    public void setInsuredMemberDob(LocalDate insuredMemberDob) { this.insuredMemberDob = insuredMemberDob; }
    public Integer getInsuredMemberAge() { return insuredMemberAge; }
    public void setInsuredMemberAge(Integer insuredMemberAge) { this.insuredMemberAge = insuredMemberAge; }
    public String getInsuredMemberGender() { return insuredMemberGender; }
    public void setInsuredMemberGender(String insuredMemberGender) { this.insuredMemberGender = insuredMemberGender; }
    public String getRelationship() { return relationship; }
    public void setRelationship(String relationship) { this.relationship = relationship; }
    public Double getSumInsured() { return sumInsured; }
    public void setSumInsured(Double sumInsured) { this.sumInsured = sumInsured; }
    public String getRecordStatus() { return recordStatus; }
    public void setRecordStatus(String recordStatus) { this.recordStatus = recordStatus; }
    public String getEnrollmentStatus() { return enrollmentStatus; }
    public void setEnrollmentStatus(String enrollmentStatus) { this.enrollmentStatus = enrollmentStatus; }
    public String getEnrollmentStatusReason() { return enrollmentStatusReason; }
    public void setEnrollmentStatusReason(String enrollmentStatusReason) { this.enrollmentStatusReason = enrollmentStatusReason; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public String getExceptionCategory() { return exceptionCategory; }
    public void setExceptionCategory(String exceptionCategory) { this.exceptionCategory = exceptionCategory; }
    public LocalDate getDateOfJoining() { return dateOfJoining; }
    public void setDateOfJoining(LocalDate dateOfJoining) { this.dateOfJoining = dateOfJoining; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }
    public String getReconciliationStatus() { return reconciliationStatus; }
    public void setReconciliationStatus(String reconciliationStatus) { this.reconciliationStatus = reconciliationStatus; }
    public String getReconciliationRemark() { return reconciliationRemark; }
    public void setReconciliationRemark(String reconciliationRemark) { this.reconciliationRemark = reconciliationRemark; }
    public String getPolicyRecordType() { return policyRecordType; }
    public void setPolicyRecordType(String policyRecordType) { this.policyRecordType = policyRecordType; }
    public String getEnrollmentAction() { return enrollmentAction; }
    public void setEnrollmentAction(String enrollmentAction) { this.enrollmentAction = enrollmentAction; }
    public String getPolicyEndorsementId() { return policyEndorsementId; }
    public void setPolicyEndorsementId(String policyEndorsementId) { this.policyEndorsementId = policyEndorsementId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
