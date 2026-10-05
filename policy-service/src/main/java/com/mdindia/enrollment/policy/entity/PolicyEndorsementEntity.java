package com.mdindia.enrollment.policy.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "policy_endorsements")
public class PolicyEndorsementEntity {

    @Id
    private String policyEndorsementId; // e.g. ABC_END_123_01

    private String policyId;
    private String policyNumber;
    private String inwardNo;
    private String policyEndorsementType;
    private String policyEndorsementNumber;
    private LocalDate policyEndorsementReceivedDate;
    private LocalDate policyEndorsementEffectiveDate;
    private LocalDate policyEndorsementRequestDate;
    private Integer membersAddedCount;
    private Integer membersDeletedCount;
    private Integer membersModifiedCount;
    private Double totalPremiumAmount;
    private Double netPremiumAmount;
    private Double premiumDeductedAmount;
    private String remark;
    private String status; // PROCESSOR_PENDING, QC_PENDING, COMPLETED, REASSIGNED, REJECTED_INWARD
    private LocalDateTime createdAt;

    public PolicyEndorsementEntity() {}

    public PolicyEndorsementEntity(String policyEndorsementId, String policyId, String policyNumber, String inwardNo,
                                  String policyEndorsementType, String policyEndorsementNumber,
                                  LocalDate policyEndorsementReceivedDate, LocalDate policyEndorsementEffectiveDate,
                                  LocalDate policyEndorsementRequestDate, Integer membersAddedCount,
                                  Integer membersDeletedCount, Integer membersModifiedCount, Double totalPremiumAmount,
                                  Double netPremiumAmount, Double premiumDeductedAmount, String remark, String status,
                                  LocalDateTime createdAt) {
        this.policyEndorsementId = policyEndorsementId;
        this.policyId = policyId;
        this.policyNumber = policyNumber;
        this.inwardNo = inwardNo;
        this.policyEndorsementType = policyEndorsementType;
        this.policyEndorsementNumber = policyEndorsementNumber;
        this.policyEndorsementReceivedDate = policyEndorsementReceivedDate;
        this.policyEndorsementEffectiveDate = policyEndorsementEffectiveDate;
        this.policyEndorsementRequestDate = policyEndorsementRequestDate;
        this.membersAddedCount = membersAddedCount;
        this.membersDeletedCount = membersDeletedCount;
        this.membersModifiedCount = membersModifiedCount;
        this.totalPremiumAmount = totalPremiumAmount;
        this.netPremiumAmount = netPremiumAmount;
        this.premiumDeductedAmount = premiumDeductedAmount;
        this.remark = remark;
        this.status = status;
        this.createdAt = createdAt;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String policyEndorsementId;
        private String policyId;
        private String policyNumber;
        private String inwardNo;
        private String policyEndorsementType;
        private String policyEndorsementNumber;
        private LocalDate policyEndorsementReceivedDate;
        private LocalDate policyEndorsementEffectiveDate;
        private LocalDate policyEndorsementRequestDate;
        private Integer membersAddedCount;
        private Integer membersDeletedCount;
        private Integer membersModifiedCount;
        private Double totalPremiumAmount;
        private Double netPremiumAmount;
        private Double premiumDeductedAmount;
        private String remark;
        private String status;
        private LocalDateTime createdAt;

        public Builder policyEndorsementId(String id) { this.policyEndorsementId = id; return this; }
        public Builder policyId(String pid) { this.policyId = pid; return this; }
        public Builder policyNumber(String pnum) { this.policyNumber = pnum; return this; }
        public Builder inwardNo(String in) { this.inwardNo = in; return this; }
        public Builder policyEndorsementType(String pet) { this.policyEndorsementType = pet; return this; }
        public Builder policyEndorsementNumber(String pen) { this.policyEndorsementNumber = pen; return this; }
        public Builder policyEndorsementReceivedDate(LocalDate rd) { this.policyEndorsementReceivedDate = rd; return this; }
        public Builder policyEndorsementEffectiveDate(LocalDate ed) { this.policyEndorsementEffectiveDate = ed; return this; }
        public Builder policyEndorsementRequestDate(LocalDate reqd) { this.policyEndorsementRequestDate = reqd; return this; }
        public Builder membersAddedCount(Integer ac) { this.membersAddedCount = ac; return this; }
        public Builder membersDeletedCount(Integer dc) { this.membersDeletedCount = dc; return this; }
        public Builder membersModifiedCount(Integer mc) { this.membersModifiedCount = mc; return this; }
        public Builder totalPremiumAmount(Double tpa) { this.totalPremiumAmount = tpa; return this; }
        public Builder netPremiumAmount(Double npa) { this.netPremiumAmount = npa; return this; }
        public Builder premiumDeductedAmount(Double pda) { this.premiumDeductedAmount = pda; return this; }
        public Builder remark(String r) { this.remark = r; return this; }
        public Builder status(String s) { this.status = s; return this; }
        public Builder createdAt(LocalDateTime t) { this.createdAt = t; return this; }

        public PolicyEndorsementEntity build() {
            return new PolicyEndorsementEntity(policyEndorsementId, policyId, policyNumber, inwardNo, policyEndorsementType, policyEndorsementNumber, policyEndorsementReceivedDate, policyEndorsementEffectiveDate, policyEndorsementRequestDate, membersAddedCount, membersDeletedCount, membersModifiedCount, totalPremiumAmount, netPremiumAmount, premiumDeductedAmount, remark, status, createdAt);
        }
    }

    public String getPolicyEndorsementId() { return policyEndorsementId; }
    public void setPolicyEndorsementId(String policyEndorsementId) { this.policyEndorsementId = policyEndorsementId; }
    public String getPolicyId() { return policyId; }
    public void setPolicyId(String policyId) { this.policyId = policyId; }
    public String getPolicyNumber() { return policyNumber; }
    public void setPolicyNumber(String policyNumber) { this.policyNumber = policyNumber; }
    public String getInwardNo() { return inwardNo; }
    public void setInwardNo(String inwardNo) { this.inwardNo = inwardNo; }
    public String getPolicyEndorsementType() { return policyEndorsementType; }
    public void setPolicyEndorsementType(String policyEndorsementType) { this.policyEndorsementType = policyEndorsementType; }
    public String getPolicyEndorsementNumber() { return policyEndorsementNumber; }
    public void setPolicyEndorsementNumber(String policyEndorsementNumber) { this.policyEndorsementNumber = policyEndorsementNumber; }
    public LocalDate getPolicyEndorsementReceivedDate() { return policyEndorsementReceivedDate; }
    public void setPolicyEndorsementReceivedDate(LocalDate policyEndorsementReceivedDate) { this.policyEndorsementReceivedDate = policyEndorsementReceivedDate; }
    public LocalDate getPolicyEndorsementEffectiveDate() { return policyEndorsementEffectiveDate; }
    public void setPolicyEndorsementEffectiveDate(LocalDate policyEndorsementEffectiveDate) { this.policyEndorsementEffectiveDate = policyEndorsementEffectiveDate; }
    public LocalDate getPolicyEndorsementRequestDate() { return policyEndorsementRequestDate; }
    public void setPolicyEndorsementRequestDate(LocalDate policyEndorsementRequestDate) { this.policyEndorsementRequestDate = policyEndorsementRequestDate; }
    public Integer getMembersAddedCount() { return membersAddedCount; }
    public void setMembersAddedCount(Integer membersAddedCount) { this.membersAddedCount = membersAddedCount; }
    public Integer getMembersDeletedCount() { return membersDeletedCount; }
    public void setMembersDeletedCount(Integer membersDeletedCount) { this.membersDeletedCount = membersDeletedCount; }
    public Integer getMembersModifiedCount() { return membersModifiedCount; }
    public void setMembersModifiedCount(Integer membersModifiedCount) { this.membersModifiedCount = membersModifiedCount; }
    public Double getTotalPremiumAmount() { return totalPremiumAmount; }
    public void setTotalPremiumAmount(Double totalPremiumAmount) { this.totalPremiumAmount = totalPremiumAmount; }
    public Double getNetPremiumAmount() { return netPremiumAmount; }
    public void setNetPremiumAmount(Double netPremiumAmount) { this.netPremiumAmount = netPremiumAmount; }
    public Double getPremiumDeductedAmount() { return premiumDeductedAmount; }
    public void setPremiumDeductedAmount(Double premiumDeductedAmount) { this.premiumDeductedAmount = premiumDeductedAmount; }
    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
