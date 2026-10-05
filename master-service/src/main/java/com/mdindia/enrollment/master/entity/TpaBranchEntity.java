package com.mdindia.enrollment.master.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tpa_branches")
public class TpaBranchEntity {
    @Id
    private String branchId;
    private String branchName;
    private String branchCode;
    private String city;
    private String state;
    private String pinCode;
    private String contactPerson;
    private String email;
    private String phone;

    public TpaBranchEntity() {}

    public TpaBranchEntity(String branchId, String branchName, String branchCode, String city, String state, String pinCode, String contactPerson, String email, String phone) {
        this.branchId = branchId;
        this.branchName = branchName;
        this.branchCode = branchCode;
        this.city = city;
        this.state = state;
        this.pinCode = pinCode;
        this.contactPerson = contactPerson;
        this.email = email;
        this.phone = phone;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String branchId;
        private String branchName;
        private String branchCode;
        private String city;
        private String state;
        private String pinCode;
        private String contactPerson;
        private String email;
        private String phone;

        public Builder branchId(String id) { this.branchId = id; return this; }
        public Builder branchName(String name) { this.branchName = name; return this; }
        public Builder branchCode(String code) { this.branchCode = code; return this; }
        public Builder city(String city) { this.city = city; return this; }
        public Builder state(String state) { this.state = state; return this; }
        public Builder pinCode(String pin) { this.pinCode = pin; return this; }
        public Builder contactPerson(String cp) { this.contactPerson = cp; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder phone(String phone) { this.phone = phone; return this; }

        public TpaBranchEntity build() {
            return new TpaBranchEntity(branchId, branchName, branchCode, city, state, pinCode, contactPerson, email, phone);
        }
    }

    public String getBranchId() { return branchId; }
    public void setBranchId(String branchId) { this.branchId = branchId; }
    public String getBranchName() { return branchName; }
    public void setBranchName(String branchName) { this.branchName = branchName; }
    public String getBranchCode() { return branchCode; }
    public void setBranchCode(String branchCode) { this.branchCode = branchCode; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getPinCode() { return pinCode; }
    public void setPinCode(String pinCode) { this.pinCode = pinCode; }
    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
