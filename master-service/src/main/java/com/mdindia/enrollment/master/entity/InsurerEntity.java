package com.mdindia.enrollment.master.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@Table(name = "insurers")
public class InsurerEntity {
    @Id
    private String insurerId;
    private String insurerName;
    private String insurerType;
    private String status;

    public InsurerEntity() {}

    public InsurerEntity(String insurerId, String insurerName, String insurerType, String status) {
        this.insurerId = insurerId;
        this.insurerName = insurerName;
        this.insurerType = insurerType;
        this.status = status;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String insurerId;
        private String insurerName;
        private String insurerType;
        private String status;

        public Builder insurerId(String id) { this.insurerId = id; return this; }
        public Builder insurerName(String name) { this.insurerName = name; return this; }
        public Builder insurerType(String type) { this.insurerType = type; return this; }
        public Builder status(String s) { this.status = s; return this; }
        public InsurerEntity build() { return new InsurerEntity(insurerId, insurerName, insurerType, status); }
    }

    public String getInsurerId() { return insurerId; }
    public void setInsurerId(String insurerId) { this.insurerId = insurerId; }
    public String getInsurerName() { return insurerName; }
    public void setInsurerName(String insurerName) { this.insurerName = insurerName; }
    public String getInsurerType() { return insurerType; }
    public void setInsurerType(String insurerType) { this.insurerType = insurerType; }
    /** Aliases read by the UI dropdowns (id / name); same values as insurerId / insurerName. */
    @JsonProperty(value = "id", access = JsonProperty.Access.READ_ONLY)
    public String getId() { return insurerId; }
    @JsonProperty(value = "name", access = JsonProperty.Access.READ_ONLY)
    public String getName() { return insurerName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
