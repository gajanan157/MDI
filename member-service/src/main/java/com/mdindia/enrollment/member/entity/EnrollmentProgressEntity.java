package com.mdindia.enrollment.member.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollment_progress")
public class EnrollmentProgressEntity {

    @Id
    private String id;

    private String policyId;
    private String inwardNo;
    private String endorsementId;
    private String status; // PROCESSING, COMPLETED, FAILED
    private Integer percentage;
    private Integer remainingTimeInSeconds;
    private LocalDateTime updatedAt;

    public EnrollmentProgressEntity() {}

    public EnrollmentProgressEntity(String id, String policyId, String inwardNo, String endorsementId,
                                    String status, Integer percentage, Integer remainingTimeInSeconds,
                                    LocalDateTime updatedAt) {
        this.id = id;
        this.policyId = policyId;
        this.inwardNo = inwardNo;
        this.endorsementId = endorsementId;
        this.status = status;
        this.percentage = percentage;
        this.remainingTimeInSeconds = remainingTimeInSeconds;
        this.updatedAt = updatedAt;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id;
        private String policyId;
        private String inwardNo;
        private String endorsementId;
        private String status;
        private Integer percentage;
        private Integer remainingTimeInSeconds;
        private LocalDateTime updatedAt;

        public Builder id(String id) { this.id = id; return this; }
        public Builder policyId(String pid) { this.policyId = pid; return this; }
        public Builder inwardNo(String in) { this.inwardNo = in; return this; }
        public Builder endorsementId(String eid) { this.endorsementId = eid; return this; }
        public Builder status(String s) { this.status = s; return this; }
        public Builder percentage(Integer p) { this.percentage = p; return this; }
        public Builder remainingTimeInSeconds(Integer r) { this.remainingTimeInSeconds = r; return this; }
        public Builder updatedAt(LocalDateTime t) { this.updatedAt = t; return this; }

        public EnrollmentProgressEntity build() {
            return new EnrollmentProgressEntity(id, policyId, inwardNo, endorsementId, status, percentage, remainingTimeInSeconds, updatedAt);
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getPolicyId() { return policyId; }
    public void setPolicyId(String policyId) { this.policyId = policyId; }
    public String getInwardNo() { return inwardNo; }
    public void setInwardNo(String inwardNo) { this.inwardNo = inwardNo; }
    public String getEndorsementId() { return endorsementId; }
    public void setEndorsementId(String endorsementId) { this.endorsementId = endorsementId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getPercentage() { return percentage; }
    public void setPercentage(Integer percentage) { this.percentage = percentage; }
    public Integer getRemainingTimeInSeconds() { return remainingTimeInSeconds; }
    public void setRemainingTimeInSeconds(Integer remainingTimeInSeconds) { this.remainingTimeInSeconds = remainingTimeInSeconds; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
