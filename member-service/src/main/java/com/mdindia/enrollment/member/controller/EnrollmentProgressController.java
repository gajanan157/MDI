package com.mdindia.enrollment.member.controller;

import com.mdindia.enrollment.common.dto.ApiResponse;
import com.mdindia.enrollment.common.dto.ProgressDto;
import com.mdindia.enrollment.member.entity.EnrollmentProgressEntity;
import com.mdindia.enrollment.member.repository.EnrollmentProgressRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/v1/enrollment")
@CrossOrigin(origins = "*")
public class EnrollmentProgressController {

    private final EnrollmentProgressRepository progressRepository;

    public EnrollmentProgressController(EnrollmentProgressRepository progressRepository) {
        this.progressRepository = progressRepository;
    }

    @GetMapping("/progress")
    public ApiResponse<ProgressDto> getProgress(
            @RequestParam(required = false) String inwardNo,
            @RequestParam(required = false) String policyId,
            @RequestParam(required = false) String endorsementId) {

        EnrollmentProgressEntity entity = null;
        if (policyId != null && inwardNo != null) {
            entity = progressRepository.findByPolicyIdAndInwardNo(policyId, inwardNo).orElse(null);
        }
        if (entity == null && inwardNo != null) {
            entity = progressRepository.findByInwardNo(inwardNo).orElse(null);
        }

        if (entity == null) {
            entity = EnrollmentProgressEntity.builder()
                .id("PROG-" + System.currentTimeMillis())
                .policyId(policyId != null ? policyId : "POL-DEFAULT")
                .inwardNo(inwardNo != null ? inwardNo : "INW-DEFAULT")
                .status("COMPLETED")
                .percentage(100)
                .remainingTimeInSeconds(0)
                .updatedAt(LocalDateTime.now())
                .build();
            progressRepository.save(entity);
        }

        return ApiResponse.success(new ProgressDto(
            entity.getStatus(),
            entity.getPercentage(),
            entity.getRemainingTimeInSeconds()
        ));
    }
}
