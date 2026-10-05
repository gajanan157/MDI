package com.mdindia.enrollment.master.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "brokers")
public class BrokerEntity {
    @Id
    private String brokerId;
    private String brokerName;
    private String policyBrokerCode;
    private String licenseNumber;
    private String contactNumber;
    private String email;
    private String status;
    private LocalDateTime createdAt;

    // Stored columns (values used to be hardcoded in getters).
    private String brokerType;
    private String pan;
    private String gstin;
    private String cin;
    private String headOfficeCity;
    private String websiteUrl;

    public BrokerEntity() {}

    public BrokerEntity(String brokerId, String brokerName, String policyBrokerCode, String licenseNumber, String contactNumber, String email, String status, LocalDateTime createdAt) {
        this.brokerId = brokerId;
        this.brokerName = brokerName;
        this.policyBrokerCode = policyBrokerCode;
        this.licenseNumber = licenseNumber;
        this.contactNumber = contactNumber;
        this.email = email;
        this.status = status;
        this.createdAt = createdAt;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String brokerId;
        private String brokerName;
        private String policyBrokerCode;
        private String licenseNumber;
        private String contactNumber;
        private String email;
        private String status;
        private LocalDateTime createdAt;

        public Builder brokerId(String id) { this.brokerId = id; return this; }
        public Builder brokerName(String name) { this.brokerName = name; return this; }
        public Builder policyBrokerCode(String code) { this.policyBrokerCode = code; return this; }
        public Builder licenseNumber(String num) { this.licenseNumber = num; return this; }
        public Builder contactNumber(String num) { this.contactNumber = num; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder status(String s) { this.status = s; return this; }
        public Builder createdAt(LocalDateTime t) { this.createdAt = t; return this; }
        public BrokerEntity build() { return new BrokerEntity(brokerId, brokerName, policyBrokerCode, licenseNumber, contactNumber, email, status, createdAt); }
    }

    public String getBrokerId() { return brokerId; }
    public void setBrokerId(String brokerId) { this.brokerId = brokerId; }
    public String getBrokerName() { return brokerName; }
    public void setBrokerName(String brokerName) { this.brokerName = brokerName; }
    public String getPolicyBrokerCode() { return policyBrokerCode; }
    public void setPolicyBrokerCode(String policyBrokerCode) { this.policyBrokerCode = policyBrokerCode; }
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
    public String getLegalName() { return brokerName; }
    public void setLegalName(String legalName) { if (this.brokerName == null) this.brokerName = legalName; }

    @JsonProperty("brokerCode")
    public String getBrokerCode() { return policyBrokerCode != null ? policyBrokerCode : brokerId; }
    public void setBrokerCode(String brokerCode) { if (this.policyBrokerCode == null) this.policyBrokerCode = brokerCode; }

    @JsonProperty("tradeName")
    public String getTradeName() { return brokerName; }

    @JsonProperty("irdaBrokerCode")
    public String getIrdaBrokerCode() { return licenseNumber; }
    public void setIrdaBrokerCode(String code) { if (this.licenseNumber == null) this.licenseNumber = code; }

    @JsonProperty("brokerType")
    public String getBrokerType() { return brokerType; }
    public void setBrokerType(String brokerType) { this.brokerType = brokerType; }

    @JsonProperty("pan")
    public String getPan() { return pan; }
    public void setPan(String pan) { this.pan = pan; }

    @JsonProperty("gstin")
    public String getGstin() { return gstin; }
    public void setGstin(String gstin) { this.gstin = gstin; }

    @JsonProperty("cin")
    public String getCin() { return cin; }
    public void setCin(String cin) { this.cin = cin; }

    @JsonProperty("headOfficeCity")
    public String getHeadOfficeCity() { return headOfficeCity; }
    public void setHeadOfficeCity(String headOfficeCity) { this.headOfficeCity = headOfficeCity; }

    @JsonProperty("websiteUrl")
    public String getWebsiteUrl() { return websiteUrl; }
    public void setWebsiteUrl(String websiteUrl) { this.websiteUrl = websiteUrl; }

    @JsonProperty("contactEmail")
    public List<String> getContactEmail() { return email != null ? List.of(email) : List.of(); }

    @JsonProperty("contactPhone")
    public List<String> getContactPhone() { return contactNumber != null ? List.of(contactNumber) : List.of(); }
}
