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
public class BrokerAgentObjectDto {
    private String channelType;
    
    @JsonProperty("broker_id")
    private String brokerId;
    
    @JsonProperty("policy_broker_code")
    private String policyBrokerCode;
    
    @JsonProperty("agent_id")
    private String agentId;
    
    @JsonProperty("policy_agent_code")
    private String policyAgentCode;
}
