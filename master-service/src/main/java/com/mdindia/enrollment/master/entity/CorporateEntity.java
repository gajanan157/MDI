package com.mdindia.enrollment.master.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "corporates")
public class CorporateEntity {
    @Id
    private String corporateId;
    private String corporateGroupId;
    private String corporateName;
    private String corporateIndustrySectorId;
    private String corporateHrId;
    private String corporatePan;
    private String corporateGstin;
    private String contactPerson;
    private String email;
    private String mobile;
    private String status;
    private LocalDateTime createdAt;

    // Stored columns (values used to be hardcoded in getters).
    private String cin;
    private String corporateType;
    private String sizeBand;
    private Integer employeeCount;
    private String billingCycle;
    private String riskTier;
    private String websiteUrl;

    /** Read from corporate_groups; not a column of this table. */
    @org.hibernate.annotations.Formula("(select g.group_name from corporate_groups g where g.corporate_group_id = corporate_group_id)")
    private String corporateGroupName;

    public CorporateEntity() {}

    public CorporateEntity(String corporateId, String corporateGroupId, String corporateName, String corporateIndustrySectorId,
                           String corporateHrId, String corporatePan, String corporateGstin, String contactPerson,
                           String email, String mobile, String status, LocalDateTime createdAt) {
        this.corporateId = corporateId;
        this.corporateGroupId = corporateGroupId;
        this.corporateName = corporateName;
        this.corporateIndustrySectorId = corporateIndustrySectorId;
        this.corporateHrId = corporateHrId;
        this.corporatePan = corporatePan;
        this.corporateGstin = corporateGstin;
        this.contactPerson = contactPerson;
        this.email = email;
        this.mobile = mobile;
        this.status = status;
        this.createdAt = createdAt;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String corporateId;
        private String corporateGroupId;
        private String corporateName;
        private String corporateIndustrySectorId;
        private String corporateHrId;
        private String corporatePan;
        private String corporateGstin;
        private String contactPerson;
        private String email;
        private String mobile;
        private String status;
        private LocalDateTime createdAt;

        public Builder corporateId(String id) { this.corporateId = id; return this; }
        public Builder corporateGroupId(String id) { this.corporateGroupId = id; return this; }
        public Builder corporateName(String name) { this.corporateName = name; return this; }
        public Builder corporateIndustrySectorId(String s) { this.corporateIndustrySectorId = s; return this; }
        public Builder corporateHrId(String id) { this.corporateHrId = id; return this; }
        public Builder corporatePan(String pan) { this.corporatePan = pan; return this; }
        public Builder corporateGstin(String gstin) { this.corporateGstin = gstin; return this; }
        public Builder contactPerson(String cp) { this.contactPerson = cp; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder mobile(String mobile) { this.mobile = mobile; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder createdAt(LocalDateTime t) { this.createdAt = t; return this; }

        public CorporateEntity build() {
            return new CorporateEntity(corporateId, corporateGroupId, corporateName, corporateIndustrySectorId, corporateHrId, corporatePan, corporateGstin, contactPerson, email, mobile, status, createdAt);
        }
    }

    public String getCorporateId() { return corporateId; }
    public void setCorporateId(String corporateId) { this.corporateId = corporateId; }
    public String getCorporateGroupId() { return corporateGroupId; }
    public void setCorporateGroupId(String corporateGroupId) { this.corporateGroupId = corporateGroupId; }
    public String getCorporateName() { return corporateName; }
    public void setCorporateName(String corporateName) { this.corporateName = corporateName; }
    public String getCorporateIndustrySectorId() { return corporateIndustrySectorId; }
    public void setCorporateIndustrySectorId(String corporateIndustrySectorId) { this.corporateIndustrySectorId = corporateIndustrySectorId; }
    public String getCorporateHrId() { return corporateHrId; }
    public void setCorporateHrId(String corporateHrId) { this.corporateHrId = corporateHrId; }
    public String getCorporatePan() { return corporatePan; }
    public void setCorporatePan(String corporatePan) { this.corporatePan = corporatePan; }
    public String getCorporateGstin() { return corporateGstin; }
    public void setCorporateGstin(String corporateGstin) { this.corporateGstin = corporateGstin; }
    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Frontend Compatibility Getters & Setters
    @JsonProperty("legalName")
    public String getLegalName() { return corporateName; }
    public void setLegalName(String legalName) { if (this.corporateName == null) this.corporateName = legalName; }

    @JsonProperty("tradeName")
    public String getTradeName() { return corporateName; }

    @JsonProperty("corporateCode")
    public String getCorporateCode() { return corporateId; }

    @JsonProperty(value = "corporateGroupName", access = JsonProperty.Access.READ_ONLY)
    public String getCorporateGroupName() { return corporateGroupName; }

    @JsonProperty("pan")
    public String getPan() { return corporatePan; }
    public void setPan(String pan) { if (this.corporatePan == null) this.corporatePan = pan; }

    @JsonProperty("gstin")
    public String getGstin() { return corporateGstin; }
    public void setGstin(String gstin) { if (this.corporateGstin == null) this.corporateGstin = gstin; }

    @JsonProperty("cin")
    public String getCin() { return cin; }
    public void setCin(String cin) { this.cin = cin; }

    @JsonProperty("corporateType")
    public String getCorporateType() { return corporateType; }
    public void setCorporateType(String corporateType) { this.corporateType = corporateType; }

    @JsonProperty("industrySectorCode")
    public String getIndustrySectorCode() { return corporateIndustrySectorId; }

    @JsonProperty("sizeBand")
    public String getSizeBand() { return sizeBand; }
    public void setSizeBand(String sizeBand) { this.sizeBand = sizeBand; }

    @JsonProperty("employeeCount")
    public Integer getEmployeeCount() { return employeeCount; }
    public void setEmployeeCount(Integer employeeCount) { this.employeeCount = employeeCount; }

    @JsonProperty("billingCycle")
    public String getBillingCycle() { return billingCycle; }
    public void setBillingCycle(String billingCycle) { this.billingCycle = billingCycle; }

    @JsonProperty("riskTier")
    public String getRiskTier() { return riskTier; }
    public void setRiskTier(String riskTier) { this.riskTier = riskTier; }

    @JsonProperty("websiteUrl")
    public String getWebsiteUrl() { return websiteUrl; }
    public void setWebsiteUrl(String websiteUrl) { this.websiteUrl = websiteUrl; }

    @JsonProperty("contactEmail")
    public List<String> getContactEmail() { return email != null ? List.of(email) : List.of(); }

    @JsonProperty("contactPhone")
    public List<String> getContactPhone() { return mobile != null ? List.of(mobile) : List.of(); }
}
