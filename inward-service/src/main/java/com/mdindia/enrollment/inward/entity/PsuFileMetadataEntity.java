package com.mdindia.enrollment.inward.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "psu_file_metadata")
public class PsuFileMetadataEntity {

    @Id
    private String id;
    private String fileName;
    private String insurerName;
    private Boolean policyScheduleFound;
    private Boolean memberDataFound;
    private String status; // PENDING, PROCESSED
    private LocalDateTime uploadedAt;

    public PsuFileMetadataEntity() {}

    public PsuFileMetadataEntity(String id, String fileName, String insurerName, Boolean policyScheduleFound, Boolean memberDataFound, String status, LocalDateTime uploadedAt) {
        this.id = id;
        this.fileName = fileName;
        this.insurerName = insurerName;
        this.policyScheduleFound = policyScheduleFound;
        this.memberDataFound = memberDataFound;
        this.status = status;
        this.uploadedAt = uploadedAt;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id;
        private String fileName;
        private String insurerName;
        private Boolean policyScheduleFound;
        private Boolean memberDataFound;
        private String status;
        private LocalDateTime uploadedAt;

        public Builder id(String id) { this.id = id; return this; }
        public Builder fileName(String fn) { this.fileName = fn; return this; }
        public Builder insurerName(String in) { this.insurerName = in; return this; }
        public Builder policyScheduleFound(Boolean psf) { this.policyScheduleFound = psf; return this; }
        public Builder memberDataFound(Boolean mdf) { this.memberDataFound = mdf; return this; }
        public Builder status(String s) { this.status = s; return this; }
        public Builder uploadedAt(LocalDateTime t) { this.uploadedAt = t; return this; }

        public PsuFileMetadataEntity build() {
            return new PsuFileMetadataEntity(id, fileName, insurerName, policyScheduleFound, memberDataFound, status, uploadedAt);
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getInsurerName() { return insurerName; }
    public void setInsurerName(String insurerName) { this.insurerName = insurerName; }
    public Boolean getPolicyScheduleFound() { return policyScheduleFound; }
    public void setPolicyScheduleFound(Boolean policyScheduleFound) { this.policyScheduleFound = policyScheduleFound; }
    public Boolean getMemberDataFound() { return memberDataFound; }
    public void setMemberDataFound(Boolean memberDataFound) { this.memberDataFound = memberDataFound; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
