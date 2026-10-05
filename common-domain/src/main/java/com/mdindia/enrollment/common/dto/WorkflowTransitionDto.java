package com.mdindia.enrollment.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowTransitionDto {
    private String actionCode; // MANUAL_ASSIGN_PROCESSOR, MANUAL_ASSIGN_QC
    private String priority;
    private String requestingUserId;
    private String requestingGroupName; // Corporate-Enrolment-Admin
    private String remarks;
}
