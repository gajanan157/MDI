package com.mdindia.enrollment.common.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IcObjectDto {
    @JsonProperty("insurer_id")
    private String insurerId;
    
    @JsonProperty("insurer_name")
    private String insurerName;
    
    @JsonProperty("insurer_type")
    private String insurerType;
    
    @JsonProperty("master_product_id")
    private String masterProductId;
    
    @JsonProperty("issuing_office_id")
    private String issuingOfficeId;
    
    @JsonProperty("regional_office_id")
    private String regionalOfficeId;
    
    @JsonProperty("divisional_office_id")
    private String divisionalOfficeId;
}
