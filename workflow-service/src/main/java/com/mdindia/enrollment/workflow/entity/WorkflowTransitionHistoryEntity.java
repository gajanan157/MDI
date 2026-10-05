package com.mdindia.enrollment.workflow.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "workflow_transitions")
public class WorkflowTransitionHistoryEntity {

    @Id
    private String transitionId;

    private String workflowInstanceId;
    private String actionCode;
    private String fromStage;
    private String toStage;
    private String performedBy;
    private String requestingGroupName;
    private String remarks;
    private LocalDateTime transitionedAt;

    public WorkflowTransitionHistoryEntity() {}

    public WorkflowTransitionHistoryEntity(String transitionId, String workflowInstanceId, String actionCode,
                                           String fromStage, String toStage, String performedBy,
                                           String requestingGroupName, String remarks, LocalDateTime transitionedAt) {
        this.transitionId = transitionId;
        this.workflowInstanceId = workflowInstanceId;
        this.actionCode = actionCode;
        this.fromStage = fromStage;
        this.toStage = toStage;
        this.performedBy = performedBy;
        this.requestingGroupName = requestingGroupName;
        this.remarks = remarks;
        this.transitionedAt = transitionedAt;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String transitionId;
        private String workflowInstanceId;
        private String actionCode;
        private String fromStage;
        private String toStage;
        private String performedBy;
        private String requestingGroupName;
        private String remarks;
        private LocalDateTime transitionedAt;

        public Builder transitionId(String id) { this.transitionId = id; return this; }
        public Builder workflowInstanceId(String wfiId) { this.workflowInstanceId = wfiId; return this; }
        public Builder actionCode(String ac) { this.actionCode = ac; return this; }
        public Builder fromStage(String fs) { this.fromStage = fs; return this; }
        public Builder toStage(String ts) { this.toStage = ts; return this; }
        public Builder performedBy(String pb) { this.performedBy = pb; return this; }
        public Builder requestingGroupName(String rgn) { this.requestingGroupName = rgn; return this; }
        public Builder remarks(String r) { this.remarks = r; return this; }
        public Builder transitionedAt(LocalDateTime t) { this.transitionedAt = t; return this; }

        public WorkflowTransitionHistoryEntity build() {
            return new WorkflowTransitionHistoryEntity(transitionId, workflowInstanceId, actionCode, fromStage, toStage, performedBy, requestingGroupName, remarks, transitionedAt);
        }
    }

    public String getTransitionId() { return transitionId; }
    public void setTransitionId(String transitionId) { this.transitionId = transitionId; }
    public String getWorkflowInstanceId() { return workflowInstanceId; }
    public void setWorkflowInstanceId(String workflowInstanceId) { this.workflowInstanceId = workflowInstanceId; }
    public String getActionCode() { return actionCode; }
    public void setActionCode(String actionCode) { this.actionCode = actionCode; }
    public String getFromStage() { return fromStage; }
    public void setFromStage(String fromStage) { this.fromStage = fromStage; }
    public String getToStage() { return toStage; }
    public void setToStage(String toStage) { this.toStage = toStage; }
    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }
    public String getRequestingGroupName() { return requestingGroupName; }
    public void setRequestingGroupName(String requestingGroupName) { this.requestingGroupName = requestingGroupName; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public LocalDateTime getTransitionedAt() { return transitionedAt; }
    public void setTransitionedAt(LocalDateTime transitionedAt) { this.transitionedAt = transitionedAt; }
}
