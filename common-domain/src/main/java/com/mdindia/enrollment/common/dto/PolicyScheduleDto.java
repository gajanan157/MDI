package com.mdindia.enrollment.common.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PolicyScheduleDto {
    private IcObjectDto icObject;
    private CorporateObjectDto corporateObject;
    private PolicyObjectDto policyObject;
    private List<FamilyRuleDto> policyFamilyDefinitionRules;
    private BrokerAgentObjectDto brokerAgentObject;
    private TpaSpocObjectDto tpaSpocObject;
    
    @JsonProperty("endorsement_identifiers")
    private Map<String, Object> endorsementIdentifiers;
    
    @JsonProperty("linked_policy_reference")
    private Map<String, Object> linkedPolicyReference;
    
    @JsonProperty("endorsement_change_details")
    private Map<String, Object> endorsementChangeDetails;
    
    @JsonProperty("endorsement_financial_impact")
    private Map<String, Object> endorsementFinancialImpact;
    
    @JsonProperty("policy_endorsement_remark")
    private String policyEndorsementRemark;
}
