package com.mdindia.enrollment.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowInstanceDto {
    private String workflowInstanceId;
    private String workflowId;
    private String inwardNo;
    private String businessEntityId;
    private String businessReferenceNumber;
    private String businessEntityName;
    private String priority;
    private String createdBy;
}
