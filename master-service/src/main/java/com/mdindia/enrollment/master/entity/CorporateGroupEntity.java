package com.mdindia.enrollment.master.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "corporate_groups")
public class CorporateGroupEntity {
    @Id
    private String corporateGroupId;
    private String groupName;
    private String groupCode;
    private String status;
    private LocalDateTime createdAt;

    // Stored columns (values used to be hardcoded in getters).
    private String cin;
    private String pan;
    private String gstin;

    public CorporateGroupEntity() {}

    public CorporateGroupEntity(String corporateGroupId, String groupName, String groupCode, String status, LocalDateTime createdAt) {
        this.corporateGroupId = corporateGroupId;
        this.groupName = groupName;
        this.groupCode = groupCode;
        this.status = status;
        this.createdAt = createdAt;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String corporateGroupId;
        private String groupName;
        private String groupCode;
        private String status;
        private LocalDateTime createdAt;

        public Builder corporateGroupId(String id) { this.corporateGroupId = id; return this; }
        public Builder groupName(String name) { this.groupName = name; return this; }
        public Builder groupCode(String code) { this.groupCode = code; return this; }
        public Builder status(String s) { this.status = s; return this; }
        public Builder createdAt(LocalDateTime t) { this.createdAt = t; return this; }
        public CorporateGroupEntity build() { return new CorporateGroupEntity(corporateGroupId, groupName, groupCode, status, createdAt); }
    }

    public String getCorporateGroupId() { return corporateGroupId; }
    public void setCorporateGroupId(String corporateGroupId) { this.corporateGroupId = corporateGroupId; }
    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }
    public String getGroupCode() { return groupCode; }
    public void setGroupCode(String groupCode) { this.groupCode = groupCode; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Frontend Compatibility Getters & Setters
    @JsonProperty("legalName")
    public String getLegalName() { return groupName; }
    public void setLegalName(String legalName) { if (this.groupName == null) this.groupName = legalName; }

    @JsonProperty("cin")
    public String getCin() { return cin; }
    public void setCin(String cin) { this.cin = cin; }

    @JsonProperty("pan")
    public String getPan() { return pan; }
    public void setPan(String pan) { this.pan = pan; }

    @JsonProperty("gstin")
    public String getGstin() { return gstin; }
    public void setGstin(String gstin) { this.gstin = gstin; }
}
