package com.mdindia.enrollment.common.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PolicyObjectDto {
    private String policyNumber;
    private String policyRecordType;
    private String policyPlan;
    private String policyRenewalType;
    private String previousPolicyNumber;
    private LocalDate policyStartDate;
    private LocalDate policyEndDate;
    private Double sumInsured;
    private Double netPremium;
    private Double grossPremium;
    private Boolean linkDummyNumber;
    private String dummyPolicyNumber;
    private Boolean corporateBufferFlag;
    private Double corporateBufferAmount;
    private Double coPaymentPercentage;
    private Double coPaymentAmount;
    
    @JsonProperty("policy_co_insurer_Flag")
    private Boolean policyCoInsurerFlag;
    
    @JsonProperty("co_insurers")
    private List<CoInsurerShareDto> coInsurers;
    
    @JsonProperty("physical_cards_required")
    private Boolean physicalCardsRequired;
    
    @JsonProperty("vip_tagging")
    private Boolean vipTagging;
    
    @JsonProperty("welcome_mailer")
    private Boolean welcomeMailer;
    
    @JsonProperty("corporate_payee")
    private Boolean corporatePayee;
    
    @JsonProperty("insured_payee")
    private Boolean insuredPayee;
    
    @JsonProperty("e_card_type")
    private String eCardType;
}
