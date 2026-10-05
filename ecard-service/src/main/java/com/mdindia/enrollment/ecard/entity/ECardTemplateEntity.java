package com.mdindia.enrollment.ecard.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ecard_templates")
public class ECardTemplateEntity {

    @Id
    private String templateConfigurationId;

    private String templateName;
    private String insurerId;
    private String corporateId;
    private Boolean active;
    private String eCardType; // PHOTO, NON_PHOTO

    @Column(columnDefinition = "TEXT")
    private String templateLabelsJson;

    private LocalDateTime createdAt;

    public ECardTemplateEntity() {}

    public ECardTemplateEntity(String templateConfigurationId, String templateName, String insurerId,
                               String corporateId, Boolean active, String eCardType,
                               String templateLabelsJson, LocalDateTime createdAt) {
        this.templateConfigurationId = templateConfigurationId;
        this.templateName = templateName;
        this.insurerId = insurerId;
        this.corporateId = corporateId;
        this.active = active;
        this.eCardType = eCardType;
        this.templateLabelsJson = templateLabelsJson;
        this.createdAt = createdAt;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String templateConfigurationId;
        private String templateName;
        private String insurerId;
        private String corporateId;
        private Boolean active;
        private String eCardType;
        private String templateLabelsJson;
        private LocalDateTime createdAt;

        public Builder templateConfigurationId(String id) { this.templateConfigurationId = id; return this; }
        public Builder templateName(String tn) { this.templateName = tn; return this; }
        public Builder insurerId(String iid) { this.insurerId = iid; return this; }
        public Builder corporateId(String cid) { this.corporateId = cid; return this; }
        public Builder active(Boolean a) { this.active = a; return this; }
        public Builder eCardType(String t) { this.eCardType = t; return this; }
        public Builder templateLabelsJson(String json) { this.templateLabelsJson = json; return this; }
        public Builder createdAt(LocalDateTime ca) { this.createdAt = ca; return this; }

        public ECardTemplateEntity build() {
            return new ECardTemplateEntity(templateConfigurationId, templateName, insurerId, corporateId, active, eCardType, templateLabelsJson, createdAt);
        }
    }

    public String getTemplateConfigurationId() { return templateConfigurationId; }
    public void setTemplateConfigurationId(String templateConfigurationId) { this.templateConfigurationId = templateConfigurationId; }
    public String getTemplateName() { return templateName; }
    public void setTemplateName(String templateName) { this.templateName = templateName; }
    public String getInsurerId() { return insurerId; }
    public void setInsurerId(String insurerId) { this.insurerId = insurerId; }
    public String getCorporateId() { return corporateId; }
    public void setCorporateId(String corporateId) { this.corporateId = corporateId; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public String getECardType() { return eCardType; }
    public void setECardType(String eCardType) { this.eCardType = eCardType; }
    public String getTemplateLabelsJson() { return templateLabelsJson; }
    public void setTemplateLabelsJson(String templateLabelsJson) { this.templateLabelsJson = templateLabelsJson; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
