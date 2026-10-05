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
public class TpaSpocObjectDto {
    @JsonProperty("tpa_servicing_branch")
    private String tpaServicingBranch;
    
    @JsonProperty("tpa_spoc_id")
    private String tpaSpocId;
    
    @JsonProperty("tpa_spoc_name")
    private String tpaSpocName;
    
    @JsonProperty("tpa_spoc_email")
    private String tpaSpocEmail;
    
    @JsonProperty("tpa_spoc_mobile")
    private String tpaSpocMobile;
    
    private String clientHrName;
    private String clientContactNo;
    private String clientEmailId;
}
