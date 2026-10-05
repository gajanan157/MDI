package com.mdindia.enrollment.master.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "insurer_offices")
public class InsurerOfficeEntity {
    @Id
    private String officeId;
    private String insurerId;
    private String officeName;
    private String officeType;
    private String officeCode;
    private String parentOfficeId;
    private String address;
    private String city;
    private String state;

    public InsurerOfficeEntity() {}

    public InsurerOfficeEntity(String officeId, String insurerId, String officeName, String officeType, String officeCode, String parentOfficeId, String address, String city, String state) {
        this.officeId = officeId;
        this.insurerId = insurerId;
        this.officeName = officeName;
        this.officeType = officeType;
        this.officeCode = officeCode;
        this.parentOfficeId = parentOfficeId;
        this.address = address;
        this.city = city;
        this.state = state;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String officeId;
        private String insurerId;
        private String officeName;
        private String officeType;
        private String officeCode;
        private String parentOfficeId;
        private String address;
        private String city;
        private String state;

        public Builder officeId(String id) { this.officeId = id; return this; }
        public Builder insurerId(String id) { this.insurerId = id; return this; }
        public Builder officeName(String name) { this.officeName = name; return this; }
        public Builder officeType(String type) { this.officeType = type; return this; }
        public Builder officeCode(String code) { this.officeCode = code; return this; }
        public Builder parentOfficeId(String id) { this.parentOfficeId = id; return this; }
        public Builder address(String addr) { this.address = addr; return this; }
        public Builder city(String city) { this.city = city; return this; }
        public Builder state(String state) { this.state = state; return this; }

        public InsurerOfficeEntity build() {
            return new InsurerOfficeEntity(officeId, insurerId, officeName, officeType, officeCode, parentOfficeId, address, city, state);
        }
    }

    public String getOfficeId() { return officeId; }
    public void setOfficeId(String officeId) { this.officeId = officeId; }
    public String getInsurerId() { return insurerId; }
    public void setInsurerId(String insurerId) { this.insurerId = insurerId; }
    public String getOfficeName() { return officeName; }
    public void setOfficeName(String officeName) { this.officeName = officeName; }
    public String getOfficeType() { return officeType; }
    public void setOfficeType(String officeType) { this.officeType = officeType; }
    public String getOfficeCode() { return officeCode; }
    public void setOfficeCode(String officeCode) { this.officeCode = officeCode; }
    public String getParentOfficeId() { return parentOfficeId; }
    public void setParentOfficeId(String parentOfficeId) { this.parentOfficeId = parentOfficeId; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
}
