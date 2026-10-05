package com.mdindia.enrollment.policy.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "policies")
public class PolicyEntity {

    @Id
    private String policyId;

    private String policyNumber;
    private String policyRecordType; // LIVE, DUMMY
    private String policyPlan;       // INDIVIDUAL, FAMILY_FLOATER, GROUP
    private String policyRenewalType;// FRESH, RENEWAL
    private String previousPolicyNumber;
    private LocalDate policyStartDate;
    private LocalDate policyEndDate;
    private Double sumInsured;
    private Double netPremium;
    private Double grossPremium;
    private Boolean linkDummyNumber;
    private String dummyPolicyNumber;
    private String insurerId;
    private String corporateId;
    private String inwardNo;
    private String status; // ACTIVE, CANCELLED, EXPIRED
    private LocalDateTime createdAt;

    public PolicyEntity() {}

    public PolicyEntity(String policyId, String policyNumber, String policyRecordType, String policyPlan,
                        String policyRenewalType, String previousPolicyNumber, LocalDate policyStartDate,
                        LocalDate policyEndDate, Double sumInsured, Double netPremium, Double grossPremium,
                        Boolean linkDummyNumber, String dummyPolicyNumber, String insurerId, String corporateId,
                        String inwardNo, String status, LocalDateTime createdAt) {
        this.policyId = policyId;
        this.policyNumber = policyNumber;
        this.policyRecordType = policyRecordType;
        this.policyPlan = policyPlan;
        this.policyRenewalType = policyRenewalType;
        this.previousPolicyNumber = previousPolicyNumber;
        this.policyStartDate = policyStartDate;
        this.policyEndDate = policyEndDate;
        this.sumInsured = sumInsured;
        this.netPremium = netPremium;
        this.grossPremium = grossPremium;
        this.linkDummyNumber = linkDummyNumber;
        this.dummyPolicyNumber = dummyPolicyNumber;
        this.insurerId = insurerId;
        this.corporateId = corporateId;
        this.inwardNo = inwardNo;
        this.status = status;
        this.createdAt = createdAt;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String policyId;
        private String policyNumber;
        private String policyRecordType;
        private String policyPlan;
        private String policyRenewalType;
        private String previousPolicyNumber;
        private LocalDate policyStartDate;
        private LocalDate policyEndDate;
        private Double sumInsured;
        private Double netPremium;
        private Double grossPremium;
        private Boolean linkDummyNumber;
        private String dummyPolicyNumber;
        private String insurerId;
        private String corporateId;
        private String inwardNo;
        private String status;
        private LocalDateTime createdAt;

        public Builder policyId(String id) { this.policyId = id; return this; }
        public Builder policyNumber(String num) { this.policyNumber = num; return this; }
        public Builder policyRecordType(String prt) { this.policyRecordType = prt; return this; }
        public Builder policyPlan(String pp) { this.policyPlan = pp; return this; }
        public Builder policyRenewalType(String prt) { this.policyRenewalType = prt; return this; }
        public Builder previousPolicyNumber(String ppn) { this.previousPolicyNumber = ppn; return this; }
        public Builder policyStartDate(LocalDate sd) { this.policyStartDate = sd; return this; }
        public Builder policyEndDate(LocalDate ed) { this.policyEndDate = ed; return this; }
        public Builder sumInsured(Double si) { this.sumInsured = si; return this; }
        public Builder netPremium(Double np) { this.netPremium = np; return this; }
        public Builder grossPremium(Double gp) { this.grossPremium = gp; return this; }
        public Builder linkDummyNumber(Boolean ldn) { this.linkDummyNumber = ldn; return this; }
        public Builder dummyPolicyNumber(String dpn) { this.dummyPolicyNumber = dpn; return this; }
        public Builder insurerId(String iid) { this.insurerId = iid; return this; }
        public Builder corporateId(String cid) { this.corporateId = cid; return this; }
        public Builder inwardNo(String in) { this.inwardNo = in; return this; }
        public Builder status(String s) { this.status = s; return this; }
        public Builder createdAt(LocalDateTime t) { this.createdAt = t; return this; }

        public PolicyEntity build() {
            return new PolicyEntity(policyId, policyNumber, policyRecordType, policyPlan, policyRenewalType, previousPolicyNumber, policyStartDate, policyEndDate, sumInsured, netPremium, grossPremium, linkDummyNumber, dummyPolicyNumber, insurerId, corporateId, inwardNo, status, createdAt);
        }
    }

    public String getPolicyId() { return policyId; }
    public void setPolicyId(String policyId) { this.policyId = policyId; }
    public String getPolicyNumber() { return policyNumber; }
    public void setPolicyNumber(String policyNumber) { this.policyNumber = policyNumber; }
    public String getPolicyRecordType() { return policyRecordType; }
    public void setPolicyRecordType(String policyRecordType) { this.policyRecordType = policyRecordType; }
    public String getPolicyPlan() { return policyPlan; }
    public void setPolicyPlan(String policyPlan) { this.policyPlan = policyPlan; }
    public String getPolicyRenewalType() { return policyRenewalType; }
    public void setPolicyRenewalType(String policyRenewalType) { this.policyRenewalType = policyRenewalType; }
    public String getPreviousPolicyNumber() { return previousPolicyNumber; }
    public void setPreviousPolicyNumber(String previousPolicyNumber) { this.previousPolicyNumber = previousPolicyNumber; }
    public LocalDate getPolicyStartDate() { return policyStartDate; }
    public void setPolicyStartDate(LocalDate policyStartDate) { this.policyStartDate = policyStartDate; }
    public LocalDate getPolicyEndDate() { return policyEndDate; }
    public void setPolicyEndDate(LocalDate policyEndDate) { this.policyEndDate = policyEndDate; }
    public Double getSumInsured() { return sumInsured; }
    public void setSumInsured(Double sumInsured) { this.sumInsured = sumInsured; }
    public Double getNetPremium() { return netPremium; }
    public void setNetPremium(Double netPremium) { this.netPremium = netPremium; }
    public Double getGrossPremium() { return grossPremium; }
    public void setGrossPremium(Double grossPremium) { this.grossPremium = grossPremium; }
    public Boolean getLinkDummyNumber() { return linkDummyNumber; }
    public void setLinkDummyNumber(Boolean linkDummyNumber) { this.linkDummyNumber = linkDummyNumber; }
    public String getDummyPolicyNumber() { return dummyPolicyNumber; }
    public void setDummyPolicyNumber(String dummyPolicyNumber) { this.dummyPolicyNumber = dummyPolicyNumber; }
    public String getInsurerId() { return insurerId; }
    public void setInsurerId(String insurerId) { this.insurerId = insurerId; }
    public String getCorporateId() { return corporateId; }
    public void setCorporateId(String corporateId) { this.corporateId = corporateId; }
    public String getInwardNo() { return inwardNo; }
    public void setInwardNo(String inwardNo) { this.inwardNo = inwardNo; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
