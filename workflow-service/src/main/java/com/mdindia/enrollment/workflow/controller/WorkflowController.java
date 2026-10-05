package com.mdindia.enrollment.workflow.controller;

import com.mdindia.enrollment.common.dto.ApiResponse;
import com.mdindia.enrollment.common.dto.PageResponse;
import com.mdindia.enrollment.common.dto.WorkflowTransitionDto;
import com.mdindia.enrollment.workflow.entity.WorkflowInstanceEntity;
import com.mdindia.enrollment.workflow.entity.WorkflowTransitionHistoryEntity;
import com.mdindia.enrollment.workflow.repository.WorkflowInstanceRepository;
import com.mdindia.enrollment.workflow.repository.WorkflowTransitionHistoryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping("/api/v1/workflow")
@CrossOrigin(origins = "*")
public class WorkflowController {

    private final WorkflowInstanceRepository instanceRepository;
    private final WorkflowTransitionHistoryRepository historyRepository;
    private final AtomicInteger seq = new AtomicInteger(103);

    public WorkflowController(WorkflowInstanceRepository instanceRepository,
                              WorkflowTransitionHistoryRepository historyRepository) {
        this.instanceRepository = instanceRepository;
        this.historyRepository = historyRepository;
    }

    @PostMapping("/instances")
    public ApiResponse<Map<String, String>> createInstance(@RequestBody Map<String, Object> body) {
        String instanceId = "WFI-2026-" + seq.getAndIncrement();
        String workflowId = (String) body.getOrDefault("workflowId", "WF-CORP-ENROLL-01");
        String inwardNo = (String) body.get("inwardNo");
        String businessEntityId = (String) body.get("businessEntityId");
        String businessReferenceNumber = (String) body.get("businessReferenceNumber");
        String businessEntityName = (String) body.getOrDefault("businessEntityName", "POLICY");
        String priority = (String) body.getOrDefault("priority", "LOW");
        String createdBy = (String) body.getOrDefault("createdBy", "admin1");

        WorkflowInstanceEntity entity = WorkflowInstanceEntity.builder()
            .workflowInstanceId(instanceId)
            .workflowId(workflowId)
            .inwardNo(inwardNo)
            .businessEntityId(businessEntityId)
            .businessReferenceNumber(businessReferenceNumber)
            .businessEntityName(businessEntityName)
            .priority(priority)
            .createdBy(createdBy)
            .currentStage("NEW")
            .status("PENDING")
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();

        instanceRepository.save(entity);

        return ApiResponse.success("Workflow instance created", Map.of(
            "workflowInstanceId", instanceId
        ));
    }

    @PostMapping("/instances/{id}/transition")
    public ResponseEntity<ApiResponse<String>> transition(
            @PathVariable String id,
            @RequestBody WorkflowTransitionDto request) {

        return instanceRepository.findById(id)
            .map(instance -> {
                String fromStage = instance.getCurrentStage();
                String toStage = "MANUAL_ASSIGN_QC".equalsIgnoreCase(request.getActionCode()) ? "QC_REVIEW" : "PROCESSOR_ENTRY";

                instance.setCurrentStage(toStage);
                instance.setAssignedUserId(request.getRequestingUserId());
                instance.setAssignedGroupName(request.getRequestingGroupName());
                instance.setUpdatedAt(LocalDateTime.now());
                instanceRepository.save(instance);

                WorkflowTransitionHistoryEntity history = WorkflowTransitionHistoryEntity.builder()
                    .transitionId("TR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                    .workflowInstanceId(id)
                    .actionCode(request.getActionCode())
                    .fromStage(fromStage)
                    .toStage(toStage)
                    .performedBy(request.getRequestingUserId())
                    .requestingGroupName(request.getRequestingGroupName())
                    .remarks(request.getRemarks())
                    .transitionedAt(LocalDateTime.now())
                    .build();
                historyRepository.save(history);

                return ResponseEntity.ok(ApiResponse.success("Transition successful", "SUCCESS"));
            })
            .orElseGet(() -> ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.error("Workflow instance not found or transition conflict", 409)));
    }

    @GetMapping("/enrollment")
    public ApiResponse<PageResponse<WorkflowInstanceEntity>> getEnrollmentWorkList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String assignedUserId) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("updatedAt").descending());
        Page<WorkflowInstanceEntity> result;
        if (assignedUserId != null && !assignedUserId.isBlank()) {
            result = instanceRepository.findByAssignedUserId(assignedUserId, pageable);
        } else if (status != null && !status.isBlank()) {
            result = instanceRepository.findByStatus(status, pageable);
        } else {
            result = instanceRepository.findAll(pageable);
        }

        return ApiResponse.success(PageResponse.of(
            result.getContent(),
            result.getTotalElements(),
            result.getNumber(),
            result.getSize()
        ));
    }

    @GetMapping("/instances/stage-counts")
    public ApiResponse<Map<String, Long>> getStageCounts() {
        Map<String, Long> counts = new HashMap<>();
        counts.put("total", instanceRepository.count());
        counts.put("pending", instanceRepository.countByStatus("PENDING"));
        counts.put("completed", instanceRepository.countByStatus("COMPLETED"));
        counts.put("rejected", instanceRepository.countByStatus("REJECTED"));
        return ApiResponse.success(counts);
    }
}
