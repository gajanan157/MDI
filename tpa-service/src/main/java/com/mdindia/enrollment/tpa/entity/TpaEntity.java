package com.mdindia.enrollment.tpa.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tpa")
public class TpaEntity {
    @Id
    private String tpaId;
    private String tenantId;
    private String tpaCode;
    private String legalName;
    private String cin;
    private String contactEmail;
    private String contactPhone;
    @Embedded
    private Address address = new Address();
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public String getTpaId() { return tpaId; }
    public void setTpaId(String tpaId) { this.tpaId = tpaId; }
    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }
    public String getTpaCode() { return tpaCode; }
    public void setTpaCode(String tpaCode) { this.tpaCode = tpaCode; }
    public String getLegalName() { return legalName; }
    public void setLegalName(String legalName) { this.legalName = legalName; }
    public String getCin() { return cin; }
    public void setCin(String cin) { this.cin = cin; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public Address getAddress() { return address; }
    public void setAddress(Address address) { this.address = address; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
