package com.mdindia.enrollment.policy.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "work_items")
public class WorkItemEntity {

    @Id
    private String id; // "ocrId"

    private String inwardNo;
    private String policyNo;
    private String status; // ONBOARDING_PENDING, PROCESSOR_PENDING, QC_PENDING, REASSIGNED, COMPLETED, REJECTED_INWARD
    private String enrollmentType; // ENROLLMENT, ENDORSEMENT
    private String documentType; // POLICY_SCHEDULE, MEMBER_DATA, etc.
    private String policyRecordType; // LIVE, DUMMY
    private String assignedTo;
    private String onboardingPendingFor; // CORPORATE, BROKER, AGENT, IC, PRODUCT
    private String remark;

    @Column(columnDefinition = "TEXT")
    private String policyScheduleJsonb;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Stored columns (values used to be hardcoded in getters).
    private String insurerName;
    private String corporateName;

    /** Display name of {@link #assignedTo}; filled in per response, never stored. */
    @Transient
    private String assignedToName;

    public WorkItemEntity() {}

    public WorkItemEntity(String id, String inwardNo, String policyNo, String status, String enrollmentType,
                          String documentType, String policyRecordType, String assignedTo, String onboardingPendingFor,
                          String remark, String policyScheduleJsonb, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.inwardNo = inwardNo;
        this.policyNo = policyNo;
        this.status = status;
        this.enrollmentType = enrollmentType;
        this.documentType = documentType;
        this.policyRecordType = policyRecordType;
        this.assignedTo = assignedTo;
        this.onboardingPendingFor = onboardingPendingFor;
        this.remark = remark;
        this.policyScheduleJsonb = policyScheduleJsonb;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id;
        private String inwardNo;
        private String policyNo;
        private String status;
        private String enrollmentType;
        private String documentType;
        private String policyRecordType;
        private String assignedTo;
        private String onboardingPendingFor;
        private String remark;
        private String policyScheduleJsonb;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Builder id(String id) { this.id = id; return this; }
        public Builder inwardNo(String in) { this.inwardNo = in; return this; }
        public Builder policyNo(String pn) { this.policyNo = pn; return this; }
        public Builder status(String s) { this.status = s; return this; }
        public Builder enrollmentType(String et) { this.enrollmentType = et; return this; }
        public Builder documentType(String dt) { this.documentType = dt; return this; }
        public Builder policyRecordType(String prt) { this.policyRecordType = prt; return this; }
        public Builder assignedTo(String at) { this.assignedTo = at; return this; }
        public Builder onboardingPendingFor(String opf) { this.onboardingPendingFor = opf; return this; }
        public Builder remark(String r) { this.remark = r; return this; }
        public Builder policyScheduleJsonb(String psj) { this.policyScheduleJsonb = psj; return this; }
        public Builder createdAt(LocalDateTime t) { this.createdAt = t; return this; }
        public Builder updatedAt(LocalDateTime t) { this.updatedAt = t; return this; }

        public WorkItemEntity build() {
            return new WorkItemEntity(id, inwardNo, policyNo, status, enrollmentType, documentType, policyRecordType, assignedTo, onboardingPendingFor, remark, policyScheduleJsonb, createdAt, updatedAt);
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getInwardNo() { return inwardNo; }
    public void setInwardNo(String inwardNo) { this.inwardNo = inwardNo; }
    public String getPolicyNo() { return policyNo; }
    public void setPolicyNo(String policyNo) { this.policyNo = policyNo; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getEnrollmentType() { return enrollmentType; }
    public void setEnrollmentType(String enrollmentType) { this.enrollmentType = enrollmentType; }
    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }
    public String getPolicyRecordType() { return policyRecordType; }
    public void setPolicyRecordType(String policyRecordType) { this.policyRecordType = policyRecordType; }
    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }
    public String getOnboardingPendingFor() { return onboardingPendingFor; }
    public void setOnboardingPendingFor(String onboardingPendingFor) { this.onboardingPendingFor = onboardingPendingFor; }
    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }
    public String getPolicyScheduleJsonb() { return policyScheduleJsonb; }
    public void setPolicyScheduleJsonb(String policyScheduleJsonb) { this.policyScheduleJsonb = policyScheduleJsonb; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Frontend Compatibility Getters
    public void setAssignedToName(String assignedToName) { this.assignedToName = assignedToName; }

    /**
     * The admin grid displays toUserName, so it carries the user's display name.
     * The username stays available as "assignedTo".
     */
    @com.fasterxml.jackson.annotation.JsonProperty("toUserName")
    public String getToUserName() {
        return assignedToName != null && !assignedToName.isBlank() ? assignedToName : assignedTo;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("latestRemark")
    public String getLatestRemark() { return remark; }

    @com.fasterxml.jackson.annotation.JsonProperty("insurerName")
    public String getInsurerName() { return insurerName; }
    public void setInsurerName(String insurerName) { this.insurerName = insurerName; }

    @com.fasterxml.jackson.annotation.JsonProperty("corporateName")
    public String getCorporateName() { return corporateName; }
    public void setCorporateName(String corporateName) { this.corporateName = corporateName; }
}
