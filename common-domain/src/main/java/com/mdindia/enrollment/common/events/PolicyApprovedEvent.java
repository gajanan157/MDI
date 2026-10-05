package com.mdindia.enrollment.common.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PolicyApprovedEvent {
    private String eventId;
    private String inwardNo;
    private String policyId;
    private String policyNumber;
    private String dummyPolicyNumber;
    private String policyRecordType;
    private String corporateId;
    private String insurerId;
    private Instant approvedAt;
    private String approvedBy;
}
