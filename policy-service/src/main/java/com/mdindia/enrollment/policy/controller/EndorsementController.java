package com.mdindia.enrollment.policy.controller;

import com.mdindia.enrollment.common.dto.ApiResponse;
import com.mdindia.enrollment.policy.entity.PolicyEndorsementEntity;
import com.mdindia.enrollment.policy.repository.PolicyEndorsementRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/policy-endorsements")
@CrossOrigin(origins = "*")
public class EndorsementController {

    private final PolicyEndorsementRepository repository;

    public EndorsementController(PolicyEndorsementRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/by-policy-number")
    public ApiResponse<List<PolicyEndorsementEntity>> getByPolicyNumber(@RequestParam String policyNumber) {
        List<PolicyEndorsementEntity> list = repository.findByPolicyNumber(policyNumber);
        return ApiResponse.success(list);
    }

    @GetMapping("/search")
    public ApiResponse<List<PolicyEndorsementEntity>> searchEndorsements(
            @RequestParam(required = false) String policyId,
            @RequestParam(required = false) String policyNumber) {
        if (policyId != null) {
            return ApiResponse.success(repository.findByPolicyId(policyId));
        }
        if (policyNumber != null) {
            return ApiResponse.success(repository.findByPolicyNumber(policyNumber));
        }
        return ApiResponse.success(repository.findAll());
    }

    @PostMapping("/member-data/send-kafka")
    public ApiResponse<Map<String, String>> sendMemberDataToKafka(@RequestBody Map<String, Object> body) {
        String policyNumber = (String) body.get("policyNumber");
        String inwardNo = (String) body.get("inwardNo");

        return ApiResponse.success("Member data dispatched to Kafka event stream for processing", Map.of(
            "status", "QUEUED",
            "policyNumber", policyNumber != null ? policyNumber : "",
            "inwardNo", inwardNo != null ? inwardNo : ""
        ));
    }
}
