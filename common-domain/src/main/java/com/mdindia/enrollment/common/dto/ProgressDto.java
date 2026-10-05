package com.mdindia.enrollment.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressDto {
    private String status; // PROCESSING, COMPLETED, FAILED
    private Integer percentage;
    private Integer remainingTimeInSeconds;
}
