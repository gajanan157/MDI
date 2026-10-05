package com.mdindia.enrollment.inward.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inwards")
public class InwardEntity {

    @Id
    private String inwardNo;

    private String inwardReceivedTpaBranchId;
    private String inwardReceivedChannel;
    private String departmentId;
    private String entityType;
    private String entityId;
    private String inwardSourceReferenceNo;
    private String inwardPriority;
    private String s3BucketName;
    private String s3SubBucketName;
    private String status; // RECEIVED, UNDER_PROCESS, COMPLETED, REJECTED_INWARD
    private LocalDateTime createdAt;

    // Stored columns (values used to be hardcoded in getters).
    private String category;
    private String subCategory;
    private String appName;
    private String corporateName;
    private String insurerName;

    // Provider Management fields.
    private String createdBy;
    private String assignedTo;
    private String documentType;
    private String sourceEntityName;

    public InwardEntity() {}

    public InwardEntity(String inwardNo, String inwardReceivedTpaBranchId, String inwardReceivedChannel,
                       String departmentId, String entityType, String entityId, String inwardSourceReferenceNo,
                       String inwardPriority, String s3BucketName, String s3SubBucketName, String status,
                       LocalDateTime createdAt) {
        this.inwardNo = inwardNo;
        this.inwardReceivedTpaBranchId = inwardReceivedTpaBranchId;
        this.inwardReceivedChannel = inwardReceivedChannel;
        this.departmentId = departmentId;
        this.entityType = entityType;
        this.entityId = entityId;
        this.inwardSourceReferenceNo = inwardSourceReferenceNo;
        this.inwardPriority = inwardPriority;
        this.s3BucketName = s3BucketName;
        this.s3SubBucketName = s3SubBucketName;
        this.status = status;
        this.createdAt = createdAt;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String inwardNo;
        private String inwardReceivedTpaBranchId;
        private String inwardReceivedChannel;
        private String departmentId;
        private String entityType;
        private String entityId;
        private String inwardSourceReferenceNo;
        private String inwardPriority;
        private String s3BucketName;
        private String s3SubBucketName;
        private String status;
        private LocalDateTime createdAt;

        public Builder inwardNo(String in) { this.inwardNo = in; return this; }
        public Builder inwardReceivedTpaBranchId(String b) { this.inwardReceivedTpaBranchId = b; return this; }
        public Builder inwardReceivedChannel(String c) { this.inwardReceivedChannel = c; return this; }
        public Builder departmentId(String d) { this.departmentId = d; return this; }
        public Builder entityType(String et) { this.entityType = et; return this; }
        public Builder entityId(String ei) { this.entityId = ei; return this; }
        public Builder inwardSourceReferenceNo(String ref) { this.inwardSourceReferenceNo = ref; return this; }
        public Builder inwardPriority(String p) { this.inwardPriority = p; return this; }
        public Builder s3BucketName(String b) { this.s3BucketName = b; return this; }
        public Builder s3SubBucketName(String sb) { this.s3SubBucketName = sb; return this; }
        public Builder status(String s) { this.status = s; return this; }
        public Builder createdAt(LocalDateTime t) { this.createdAt = t; return this; }

        public InwardEntity build() {
            return new InwardEntity(inwardNo, inwardReceivedTpaBranchId, inwardReceivedChannel, departmentId, entityType, entityId, inwardSourceReferenceNo, inwardPriority, s3BucketName, s3SubBucketName, status, createdAt);
        }
    }

    public String getInwardNo() { return inwardNo; }
    public void setInwardNo(String inwardNo) { this.inwardNo = inwardNo; }
    public String getInwardReceivedTpaBranchId() { return inwardReceivedTpaBranchId; }
    public void setInwardReceivedTpaBranchId(String inwardReceivedTpaBranchId) { this.inwardReceivedTpaBranchId = inwardReceivedTpaBranchId; }
    public String getInwardReceivedChannel() { return inwardReceivedChannel; }
    public void setInwardReceivedChannel(String inwardReceivedChannel) { this.inwardReceivedChannel = inwardReceivedChannel; }
    public String getDepartmentId() { return departmentId; }
    public void setDepartmentId(String departmentId) { this.departmentId = departmentId; }
    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }
    public String getEntityId() { return entityId; }
    public void setEntityId(String entityId) { this.entityId = entityId; }
    public String getInwardSourceReferenceNo() { return inwardSourceReferenceNo; }
    public void setInwardSourceReferenceNo(String inwardSourceReferenceNo) { this.inwardSourceReferenceNo = inwardSourceReferenceNo; }
    public String getInwardPriority() { return inwardPriority; }
    public void setInwardPriority(String inwardPriority) { this.inwardPriority = inwardPriority; }
    public String getS3BucketName() { return s3BucketName; }
    public void setS3BucketName(String s3BucketName) { this.s3BucketName = s3BucketName; }
    public String getS3SubBucketName() { return s3SubBucketName; }
    public void setS3SubBucketName(String s3SubBucketName) { this.s3SubBucketName = s3SubBucketName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Frontend Compatibility Getters
    @com.fasterxml.jackson.annotation.JsonProperty("receivedChannel")
    public String getReceivedChannel() { return inwardReceivedChannel; }

    @com.fasterxml.jackson.annotation.JsonProperty("recordStatus")
    public String getRecordStatus() { return status; }

    @com.fasterxml.jackson.annotation.JsonProperty("receivedAt")
    public LocalDateTime getReceivedAt() { return createdAt; }

    @com.fasterxml.jackson.annotation.JsonProperty("category")
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    @com.fasterxml.jackson.annotation.JsonProperty("subCategory")
    public String getSubCategory() { return subCategory; }
    public void setSubCategory(String subCategory) { this.subCategory = subCategory; }

    @com.fasterxml.jackson.annotation.JsonProperty("appName")
    public String getAppName() { return appName; }
    public void setAppName(String appName) { this.appName = appName; }

    @com.fasterxml.jackson.annotation.JsonProperty("corporateName")
    public String getCorporateName() { return corporateName; }
    public void setCorporateName(String corporateName) { this.corporateName = corporateName; }

    @com.fasterxml.jackson.annotation.JsonProperty("insurerName")
    public String getInsurerName() { return insurerName; }
    public void setInsurerName(String insurerName) { this.insurerName = insurerName; }

    @com.fasterxml.jackson.annotation.JsonProperty("createdBy")
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    @com.fasterxml.jackson.annotation.JsonProperty("assignedTo")
    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }

    @com.fasterxml.jackson.annotation.JsonProperty("documentType")
    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }

    /** Who sent the document: the stored name, else the insurer or corporate name. */
    @com.fasterxml.jackson.annotation.JsonProperty("sourceEntityName")
    public String getSourceEntityName() {
        if (sourceEntityName != null && !sourceEntityName.isBlank()) return sourceEntityName;
        if (insurerName != null && !insurerName.isBlank()) return insurerName;
        return corporateName;
    }
    public void setSourceEntityName(String sourceEntityName) { this.sourceEntityName = sourceEntityName; }

    // Names the provider screens read for the same values.
    @com.fasterxml.jackson.annotation.JsonProperty("inwardReceivedAt")
    public LocalDateTime getInwardReceivedAt() { return createdAt; }

    @com.fasterxml.jackson.annotation.JsonProperty("inwardSourceEntityId")
    public String getInwardSourceEntityId() { return entityId; }

    @com.fasterxml.jackson.annotation.JsonProperty("inwardSourceEntityType")
    public String getInwardSourceEntityType() { return entityType; }
}
