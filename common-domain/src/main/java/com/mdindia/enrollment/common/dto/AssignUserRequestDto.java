package com.mdindia.enrollment.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignUserRequestDto {
    private String inwardNo;
    private String policyNo;
    private String toUserName;
}
