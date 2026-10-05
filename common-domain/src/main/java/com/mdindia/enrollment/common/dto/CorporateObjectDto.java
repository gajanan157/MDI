package com.mdindia.enrollment.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CorporateObjectDto {
    private String corporateId;
    private String corporateGroupId;
    private String corporateName;
    private String corporateIndustrySectorId;
    private String corporateHrId;
    private String corporatePan;
    private String corporateGstin;
}
