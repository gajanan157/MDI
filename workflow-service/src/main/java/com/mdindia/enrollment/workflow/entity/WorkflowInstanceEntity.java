package com.mdindia.enrollment.workflow.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "workflow_instances")
public class WorkflowInstanceEntity {

    @Id
    private String workflowInstanceId;

    private String workflowId;
    private String inwardNo;
    private String businessEntityId;
    private String businessReferenceNumber;
    private String businessEntityName; // POLICY
    private String priority;
    private String createdBy;
    private String currentStage;
    private String assignedUserId;
    private String assignedGroupName;
    private String status; // PENDING, COMPLETED, REJECTED
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public WorkflowInstanceEntity() {}

    public WorkflowInstanceEntity(String workflowInstanceId, String workflowId, String inwardNo,
                                  String businessEntityId, String businessReferenceNumber, String businessEntityName,
                                  String priority, String createdBy, String currentStage, String assignedUserId,
                                  String assignedGroupName, String status, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.workflowInstanceId = workflowInstanceId;
        this.workflowId = workflowId;
        this.inwardNo = inwardNo;
        this.businessEntityId = businessEntityId;
        this.businessReferenceNumber = businessReferenceNumber;
        this.businessEntityName = businessEntityName;
        this.priority = priority;
        this.createdBy = createdBy;
        this.currentStage = currentStage;
        this.assignedUserId = assignedUserId;
        this.assignedGroupName = assignedGroupName;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String workflowInstanceId;
        private String workflowId;
        private String inwardNo;
        private String businessEntityId;
        private String businessReferenceNumber;
        private String businessEntityName;
        private String priority;
        private String createdBy;
        private String currentStage;
        private String assignedUserId;
        private String assignedGroupName;
        private String status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Builder workflowInstanceId(String id) { this.workflowInstanceId = id; return this; }
        public Builder workflowId(String id) { this.workflowId = id; return this; }
        public Builder inwardNo(String in) { this.inwardNo = in; return this; }
        public Builder businessEntityId(String id) { this.businessEntityId = id; return this; }
        public Builder businessReferenceNumber(String ref) { this.businessReferenceNumber = ref; return this; }
        public Builder businessEntityName(String name) { this.businessEntityName = name; return this; }
        public Builder priority(String p) { this.priority = p; return this; }
        public Builder createdBy(String cb) { this.createdBy = cb; return this; }
        public Builder currentStage(String cs) { this.currentStage = cs; return this; }
        public Builder assignedUserId(String au) { this.assignedUserId = au; return this; }
        public Builder assignedGroupName(String ag) { this.assignedGroupName = ag; return this; }
        public Builder status(String s) { this.status = s; return this; }
        public Builder createdAt(LocalDateTime t) { this.createdAt = t; return this; }
        public Builder updatedAt(LocalDateTime t) { this.updatedAt = t; return this; }

        public WorkflowInstanceEntity build() {
            return new WorkflowInstanceEntity(workflowInstanceId, workflowId, inwardNo, businessEntityId, businessReferenceNumber, businessEntityName, priority, createdBy, currentStage, assignedUserId, assignedGroupName, status, createdAt, updatedAt);
        }
    }

    public String getWorkflowInstanceId() { return workflowInstanceId; }
    public void setWorkflowInstanceId(String workflowInstanceId) { this.workflowInstanceId = workflowInstanceId; }
    public String getWorkflowId() { return workflowId; }
    public void setWorkflowId(String workflowId) { this.workflowId = workflowId; }
    public String getInwardNo() { return inwardNo; }
    public void setInwardNo(String inwardNo) { this.inwardNo = inwardNo; }
    public String getBusinessEntityId() { return businessEntityId; }
    public void setBusinessEntityId(String businessEntityId) { this.businessEntityId = businessEntityId; }
    public String getBusinessReferenceNumber() { return businessReferenceNumber; }
    public void setBusinessReferenceNumber(String businessReferenceNumber) { this.businessReferenceNumber = businessReferenceNumber; }
    public String getBusinessEntityName() { return businessEntityName; }
    public void setBusinessEntityName(String businessEntityName) { this.businessEntityName = businessEntityName; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public String getCurrentStage() { return currentStage; }
    public void setCurrentStage(String currentStage) { this.currentStage = currentStage; }
    public String getAssignedUserId() { return assignedUserId; }
    public void setAssignedUserId(String assignedUserId) { this.assignedUserId = assignedUserId; }
    public String getAssignedGroupName() { return assignedGroupName; }
    public void setAssignedGroupName(String assignedGroupName) { this.assignedGroupName = assignedGroupName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
