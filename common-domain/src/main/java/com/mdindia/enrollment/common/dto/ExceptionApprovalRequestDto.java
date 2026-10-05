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
public class ExceptionApprovalRequestDto {
    private List<String> stagingMemberEnrollmentIds;
    private String exceptionApprovalRemark;
}
