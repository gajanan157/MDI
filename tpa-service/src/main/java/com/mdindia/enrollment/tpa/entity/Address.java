package com.mdindia.enrollment.tpa.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

/** Address columns shared by the tpa and tpa_branches tables. */
@Embeddable
public class Address {
    @Column(name = "address_id")
    private String addressId;
    @Column(name = "address_type")
    private String addressType;
    @Column(name = "address")
    private String line;
    private String city;
    @Column(name = "state_name")
    private String stateName;
    @Column(name = "postal_code")
    private String postalCode;
    @Column(name = "address_status")
    private String addressStatus;

    public String getAddressId() { return addressId; }
    public void setAddressId(String addressId) { this.addressId = addressId; }
    public String getAddressType() { return addressType; }
    public void setAddressType(String addressType) { this.addressType = addressType; }
    public String getLine() { return line; }
    public void setLine(String line) { this.line = line; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getStateName() { return stateName; }
    public void setStateName(String stateName) { this.stateName = stateName; }
    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
    public String getAddressStatus() { return addressStatus; }
    public void setAddressStatus(String addressStatus) { this.addressStatus = addressStatus; }
}
