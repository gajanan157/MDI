package com.mdindia.enrollment.policy.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mdindia.enrollment.common.dto.ApiResponse;
import com.mdindia.enrollment.policy.entity.PolicyEntity;
import com.mdindia.enrollment.policy.entity.WorkItemEntity;
import com.mdindia.enrollment.policy.repository.PolicyRepository;
import com.mdindia.enrollment.policy.repository.WorkItemRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping
@CrossOrigin(origins = "*")
public class PolicyProcessController {

    private final WorkItemRepository workItemRepository;
    private final PolicyRepository policyRepository;
    private final ObjectMapper objectMapper;
    private final AtomicInteger policySeq = new AtomicInteger(10001);

    public PolicyProcessController(WorkItemRepository workItemRepository,
                                   PolicyRepository policyRepository,
                                   ObjectMapper objectMapper) {
        this.workItemRepository = workItemRepository;
        this.policyRepository = policyRepository;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/v1/policy-endorsements/process")
    public ApiResponse<Map<String, Object>> processDraft(@RequestBody Map<String, Object> body) {
        String inwardNo = (String) body.get("inwardNo");
        String policyNumber = (String) body.get("policyNumber");
        String status = (String) body.getOrDefault("status", "PROCESSOR_PENDING");
        String policyRecordType = (String) body.getOrDefault("policyRecordType", "LIVE");
        Object scheduleJson = body.get("policyScheduleJson");

        String jsonString = "{}";
        try {
            if (scheduleJson instanceof String s) {
                jsonString = s;
            } else if (scheduleJson != null) {
                jsonString = objectMapper.writeValueAsString(scheduleJson);
            }
        } catch (Exception ignored) {}

        final String finalJson = jsonString;

        WorkItemEntity workItem = workItemRepository.findByInwardNo(inwardNo)
            .orElseGet(() -> WorkItemEntity.builder()
                .id("OCR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .inwardNo(inwardNo)
                .policyNo(policyNumber != null ? policyNumber : "DRAFT-" + System.currentTimeMillis())
                .enrollmentType("ENROLLMENT")
                .documentType("POLICY_SCHEDULE")
                .createdAt(LocalDateTime.now())
                .build());

        workItem.setStatus(status);
        workItem.setPolicyRecordType(policyRecordType);
        if (policyNumber != null) workItem.setPolicyNo(policyNumber);
        workItem.setPolicyScheduleJsonb(finalJson);
        applyScheduleNames(workItem, finalJson);
        workItem.setUpdatedAt(LocalDateTime.now());
        workItemRepository.save(workItem);

        Map<String, Object> data = new HashMap<>();
        data.put("inwardNo", inwardNo);
        data.put("status", status);
        data.put("policyNo", workItem.getPolicyNo());
        data.put("policyEndorsementId", body.get("policyEndorsementId"));

        return ApiResponse.success("Policy draft processed successfully", data);
    }

    /** Stores the insurer and corporate names given in the policy schedule, when present. */
    private void applyScheduleNames(WorkItemEntity workItem, String scheduleJson) {
        try {
            JsonNode root = objectMapper.readTree(scheduleJson);
            String insurerName = root.path("icObject").path("insurer_name").asText("");
            String corporateName = root.path("corporateObject").path("corporateName").asText("");
            if (!insurerName.isBlank()) workItem.setInsurerName(insurerName);
            if (!corporateName.isBlank()) workItem.setCorporateName(corporateName);
        } catch (Exception ignored) {
            // Not valid JSON: keep whatever names the work item already has.
        }
    }

    @PostMapping("/v1/enroll/policy/QC")
    public ApiResponse<Object> processQc(@RequestBody Map<String, Object> body) {
        String inwardNo = (String) body.get("inwardNo");
        String status = (String) body.getOrDefault("status", "COMPLETED");
        String policyNo = (String) body.get("policyNo");
        String policyRecordType = (String) body.getOrDefault("policyRecordType", "LIVE");
        Object scheduleJson = body.get("policyScheduleJson");

        if ("REASSIGNED".equalsIgnoreCase(status)) {
            workItemRepository.findByInwardNo(inwardNo).ifPresent(item -> {
                item.setStatus("REASSIGNED");
                item.setUpdatedAt(LocalDateTime.now());
                workItemRepository.save(item);
            });
            return ApiResponse.success("Policy reassigned back to processor", "REASSIGNED");
        }

        // Status is COMPLETED: QC approved! Create the Policy Record!
        String newPolicyId = "POL-" + policySeq.getAndIncrement();
        String corporateId = "CORP-201";
        String insurerId = "INS-001";
        Double sumInsured = 500000.0;
        Double netPremium = 4500000.0;
        Double grossPremium = 5310000.0;
        String dummyPolicyNumber = null;
        boolean linkDummyNumber = false;

        try {
            JsonNode root;
            if (scheduleJson instanceof String s) {
                root = objectMapper.readTree(s);
            } else {
                root = objectMapper.valueToTree(scheduleJson);
            }
            if (root != null) {
                if (root.has("corporateObject") && root.get("corporateObject").has("corporateId")) {
                    corporateId = root.get("corporateObject").get("corporateId").asText();
                }
                if (root.has("icObject") && root.get("icObject").has("insurer_id")) {
                    insurerId = root.get("icObject").get("insurer_id").asText();
                }
                if (root.has("policyObject")) {
                    JsonNode polObj = root.get("policyObject");
                    if (polObj.has("sumInsured")) sumInsured = polObj.get("sumInsured").asDouble();
                    if (polObj.has("netPremium")) netPremium = polObj.get("netPremium").asDouble();
                    if (polObj.has("grossPremium")) grossPremium = polObj.get("grossPremium").asDouble();
                    if (polObj.has("linkDummyNumber")) linkDummyNumber = polObj.get("linkDummyNumber").asBoolean();
                    if (polObj.has("dummyPolicyNumber")) dummyPolicyNumber = polObj.get("dummyPolicyNumber").asText();
                }
            }
        } catch (Exception ignored) {}

        PolicyEntity policy = PolicyEntity.builder()
            .policyId(newPolicyId)
            .policyNumber(policyNo != null ? policyNo : "POL-NO-" + System.currentTimeMillis())
            .policyRecordType(policyRecordType)
            .policyPlan("FAMILY_FLOATER")
            .policyRenewalType("FRESH")
            .policyStartDate(LocalDate.now())
            .policyEndDate(LocalDate.now().plusYears(1))
            .sumInsured(sumInsured)
            .netPremium(netPremium)
            .grossPremium(grossPremium)
            .linkDummyNumber(linkDummyNumber)
            .dummyPolicyNumber(dummyPolicyNumber)
            .insurerId(insurerId)
            .corporateId(corporateId)
            .inwardNo(inwardNo)
            .status("ACTIVE")
            .createdAt(LocalDateTime.now())
            .build();

        policyRepository.save(policy);

        // Update Work Item status
        workItemRepository.findByInwardNo(inwardNo).ifPresent(item -> {
            item.setStatus("COMPLETED");
            item.setUpdatedAt(LocalDateTime.now());
            workItemRepository.save(item);
        });

        // The frontend expects the response data to be the new policyId
        return ApiResponse.success("Policy approved successfully", newPolicyId);
    }
}
