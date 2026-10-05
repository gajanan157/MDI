package com.mdindia.enrollment.master.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "agents")
public class AgentEntity {
    @Id
    private String agentId;
    private String agentName;
    private String policyAgentCode;
    private String licenseNumber;
    private String contactNumber;
    private String email;
    private String status;
    private LocalDateTime createdAt;

    // Stored columns (values used to be hardcoded in getters).
    private String agentType;
    private String agentCategory;

    public AgentEntity() {}

    public AgentEntity(String agentId, String agentName, String policyAgentCode, String licenseNumber, String contactNumber, String email, String status, LocalDateTime createdAt) {
        this.agentId = agentId;
        this.agentName = agentName;
        this.policyAgentCode = policyAgentCode;
        this.licenseNumber = licenseNumber;
        this.contactNumber = contactNumber;
        this.email = email;
        this.status = status;
        this.createdAt = createdAt;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String agentId;
        private String agentName;
        private String policyAgentCode;
        private String licenseNumber;
        private String contactNumber;
        private String email;
        private String status;
        private LocalDateTime createdAt;

        public Builder agentId(String id) { this.agentId = id; return this; }
        public Builder agentName(String name) { this.agentName = name; return this; }
        public Builder policyAgentCode(String code) { this.policyAgentCode = code; return this; }
        public Builder licenseNumber(String num) { this.licenseNumber = num; return this; }
        public Builder contactNumber(String num) { this.contactNumber = num; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder status(String s) { this.status = s; return this; }
        public Builder createdAt(LocalDateTime t) { this.createdAt = t; return this; }
        public AgentEntity build() { return new AgentEntity(agentId, agentName, policyAgentCode, licenseNumber, contactNumber, email, status, createdAt); }
    }

    public String getAgentId() { return agentId; }
    public void setAgentId(String agentId) { this.agentId = agentId; }
    public String getAgentName() { return agentName; }
    public void setAgentName(String agentName) { this.agentName = agentName; }
    public String getPolicyAgentCode() { return policyAgentCode; }
    public void setPolicyAgentCode(String policyAgentCode) { this.policyAgentCode = policyAgentCode; }
    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }
    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Frontend Compatibility Getters & Setters
    @JsonProperty("legalName")
    public String getLegalName() { return agentName; }
    public void setLegalName(String legalName) { if (this.agentName == null) this.agentName = legalName; }

    @JsonProperty("tradeName")
    public String getTradeName() { return agentName; }

    @JsonProperty("agentCode")
    public String getAgentCode() { return policyAgentCode != null ? policyAgentCode : agentId; }
    public void setAgentCode(String agentCode) { if (this.policyAgentCode == null) this.policyAgentCode = agentCode; }

    @JsonProperty("irdaAgentCode")
    public String getIrdaAgentCode() { return licenseNumber; }
    public void setIrdaAgentCode(String code) { if (this.licenseNumber == null) this.licenseNumber = code; }

    @JsonProperty("agentType")
    public String getAgentType() { return agentType; }
    public void setAgentType(String agentType) { this.agentType = agentType; }

    @JsonProperty("agentCategory")
    public String getAgentCategory() { return agentCategory; }
    public void setAgentCategory(String agentCategory) { this.agentCategory = agentCategory; }

    @JsonProperty("contactEmail")
    public List<String> getContactEmail() { return email != null ? List.of(email) : List.of(); }

    @JsonProperty("contactPhone")
    public List<String> getContactPhone() { return contactNumber != null ? List.of(contactNumber) : List.of(); }
}
