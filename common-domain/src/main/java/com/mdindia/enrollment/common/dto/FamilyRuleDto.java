package com.mdindia.enrollment.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FamilyRuleDto {
    private String ruleCode;
    private Integer countMin;
    private Integer countMax;
    private Integer ageMin;
    private Integer ageMax;
    private List<String> allowedRelationships;
}
