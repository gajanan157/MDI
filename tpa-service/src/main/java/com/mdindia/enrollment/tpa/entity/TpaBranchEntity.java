package com.mdindia.enrollment.tpa.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tpa_branches")
public class TpaBranchEntity {
    public static final String ACTIVE = "Active";
    public static final String INACTIVE = "Inactive";

    @Id
    private String tpaBranchId;
    private String tpaId;
    private String tenantId;
    private String parentBranchId;
    private String branchCode;
    private String branchName;
    /** Comma separated; the API exposes these as arrays. */
    private String contactEmail;
    private String contactPhone;
    private String serviceTypes;
    private String tags;
    private String recordStatus = ACTIVE;
    @Embedded
    private Address address = new Address();
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public String getTpaBranchId() { return tpaBranchId; }
    public void setTpaBranchId(String tpaBranchId) { this.tpaBranchId = tpaBranchId; }
    public String getTpaId() { return tpaId; }
    public void setTpaId(String tpaId) { this.tpaId = tpaId; }
    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }
    public String getParentBranchId() { return parentBranchId; }
    public void setParentBranchId(String parentBranchId) { this.parentBranchId = parentBranchId; }
    public String getBranchCode() { return branchCode; }
    public void setBranchCode(String branchCode) { this.branchCode = branchCode; }
    public String getBranchName() { return branchName; }
    public void setBranchName(String branchName) { this.branchName = branchName; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public String getServiceTypes() { return serviceTypes; }
    public void setServiceTypes(String serviceTypes) { this.serviceTypes = serviceTypes; }
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
    public String getRecordStatus() { return recordStatus; }
    public void setRecordStatus(String recordStatus) { this.recordStatus = recordStatus; }
    public Address getAddress() { return address; }
    public void setAddress(Address address) { this.address = address; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
