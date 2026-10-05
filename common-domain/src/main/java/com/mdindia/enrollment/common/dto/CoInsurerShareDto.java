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
public class CoInsurerShareDto {
    @JsonProperty("co_insurer_name")
    private String coInsurerName;
    
    @JsonProperty("policy_co_insurer_share_percentage")
    private Double sharePercentage;
    
    @JsonProperty("policy_coinsurance_type")
    private String coinsuranceType;
}
