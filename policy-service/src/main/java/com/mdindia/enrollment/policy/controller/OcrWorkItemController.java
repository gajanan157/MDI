package com.mdindia.enrollment.policy.controller;

import com.mdindia.enrollment.common.dto.ApiResponse;
import com.mdindia.enrollment.common.dto.AssignUserRequestDto;
import com.mdindia.enrollment.common.dto.PageResponse;
import com.mdindia.enrollment.policy.client.NotificationPublisher;
import com.mdindia.enrollment.policy.client.UserDirectoryClient;
import com.mdindia.enrollment.policy.entity.WorkItemEntity;
import com.mdindia.enrollment.policy.repository.WorkItemRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/ocr")
@CrossOrigin(origins = "*")
public class OcrWorkItemController {

    private final WorkItemRepository repository;
    private final UserDirectoryClient userDirectory;
    private final NotificationPublisher notifications;

    public OcrWorkItemController(WorkItemRepository repository, UserDirectoryClient userDirectory,
                                 NotificationPublisher notifications) {
        this.repository = repository;
        this.userDirectory = userDirectory;
        this.notifications = notifications;
    }

    private WorkItemEntity withAssigneeName(WorkItemEntity item) {
        item.setAssignedToName(userDirectory.displayNameOf(item.getAssignedTo()));
        return item;
    }

    @GetMapping
    public ApiResponse<List<WorkItemEntity>> getWorkItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("updatedAt").descending());
        Page<WorkItemEntity> pageResult;
        if (status != null && !status.isBlank()) {
            pageResult = repository.findByStatus(status, pageable);
        } else {
            pageResult = repository.findAll(pageable);
        }

        pageResult.getContent().forEach(this::withAssigneeName);
        return ApiResponse.ofPage(PageResponse.of(
            pageResult.getContent(),
            pageResult.getTotalElements(),
            pageResult.getNumber(),
            pageResult.getSize()
        ));
    }

    @GetMapping("/{id}")
    public ApiResponse<WorkItemEntity> getById(@PathVariable String id) {
        return repository.findById(id)
            .map(this::withAssigneeName)
            .map(ApiResponse::success)
            .orElseGet(() -> ApiResponse.error("Work item not found", 404));
    }

    @GetMapping("/status-count")
    public ApiResponse<Map<String, Long>> getStatusCounts(
            @RequestParam(defaultValue = "false") boolean isProcessor,
            @RequestParam(defaultValue = "false") boolean isQc) {

        Map<String, Long> counts = new HashMap<>();
        counts.put("TOTAL", repository.count());
        counts.put("TOTAL_ENROLLMENT", repository.countByEnrollmentType("ENROLLMENT"));
        counts.put("TOTAL_ENDORSEMENT", repository.countByEnrollmentType("ENDORSEMENT"));
        counts.put("COMPLETED", repository.countByStatus("COMPLETED"));
        counts.put("REJECTED_INWARD", repository.countByStatus("REJECTED_INWARD"));
        counts.put("PROCESSOR_PENDING", repository.countByStatus("PROCESSOR_PENDING"));
        counts.put("QC_PENDING", repository.countByStatus("QC_PENDING"));
        counts.put("ONBOARDING_PENDING", repository.countByStatus("ONBOARDING_PENDING"));

        return ApiResponse.success(counts);
    }

    @GetMapping("/onboarding-pending")
    public ApiResponse<List<WorkItemEntity>> getOnboardingPending(
            @RequestParam(required = false) String inwardNo,
            @RequestParam(required = false) String policyNo) {

        List<WorkItemEntity> items = repository.findByStatusAndOnboardingPendingForIsNotNull("ONBOARDING_PENDING");
        items.forEach(this::withAssigneeName);
        return ApiResponse.success(items);
    }

    @PostMapping("/resolve-onboarding")
    public ApiResponse<Map<String, String>> resolveOnboarding(
            @RequestParam String inwardNo,
            @RequestParam String type,
            @RequestParam String masterId,
            @RequestParam(required = false) String policyNo) {

        repository.findByInwardNo(inwardNo).ifPresent(item -> {
            item.setStatus("PROCESSOR_PENDING");
            item.setOnboardingPendingFor(null);
            item.setUpdatedAt(LocalDateTime.now());
            repository.save(item);
        });

        return ApiResponse.success("Master onboarding resolved successfully", Map.of(
            "inwardNo", inwardNo,
            "type", type,
            "masterId", masterId,
            "status", "PROCESSOR_PENDING"
        ));
    }

    @PatchMapping("/assign-user")
    public ApiResponse<String> assignUser(@RequestBody AssignUserRequestDto request) {
        return repository.findByInwardNo(request.getInwardNo())
            .map(item -> {
                item.setAssignedTo(request.getToUserName());
                item.setUpdatedAt(LocalDateTime.now());
                repository.save(item);
                String displayName = userDirectory.displayNameOf(request.getToUserName());
                notifications.workItemAssigned(item.getInwardNo(), item.getPolicyNo(), request.getToUserName(), displayName);
                return ApiResponse.success("Work item assigned to " + displayName, "SUCCESS");
            })
            .orElseGet(() -> ApiResponse.error("Work item not found for inward: " + request.getInwardNo(), 404));
    }

    @PatchMapping("/{ocrId}/status")
    public ApiResponse<String> updateStatus(
            @PathVariable String ocrId,
            @RequestBody Map<String, String> body) {

        String newStatus = body.getOrDefault("status", "REJECTED_INWARD");
        String remark = body.getOrDefault("remark", "Rejected by user");

        return repository.findById(ocrId)
            .map(item -> {
                item.setStatus(newStatus);
                item.setRemark(remark);
                item.setUpdatedAt(LocalDateTime.now());
                repository.save(item);
                return ApiResponse.success("Status updated to " + newStatus, "SUCCESS");
            })
            .orElseGet(() -> ApiResponse.error("Work item not found: " + ocrId, 404));
    }
}
