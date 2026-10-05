package com.mdindia.enrollment.policy.controller;

import com.mdindia.enrollment.common.dto.ApiResponse;
import com.mdindia.enrollment.common.dto.PageResponse;
import com.mdindia.enrollment.policy.entity.PolicyEntity;
import com.mdindia.enrollment.policy.repository.PolicyRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
@CrossOrigin(origins = "*")
public class PolicySearchController {

    private final PolicyRepository policyRepository;

    public PolicySearchController(PolicyRepository policyRepository) {
        this.policyRepository = policyRepository;
    }

    @GetMapping("/v1/policies")
    public ApiResponse<List<PolicyEntity>> searchPolicies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<PolicyEntity> result = status != null && !status.isBlank()
            ? policyRepository.findByStatus(status, pageable)
            : policyRepository.findAll(pageable);

        return ApiResponse.ofPage(PageResponse.of(
            result.getContent(),
            result.getTotalElements(),
            result.getNumber(),
            result.getSize()
        ));
    }

    @GetMapping("/v1/policies/dropdown")
    public ApiResponse<List<Map<String, String>>> getPolicyDropdown() {
        List<Map<String, String>> dropdown = policyRepository.findAll().stream()
            .map(p -> Map.of(
                "policyId", p.getPolicyId(),
                "policyNumber", p.getPolicyNumber(),
                "corporateId", p.getCorporateId() != null ? p.getCorporateId() : ""
            ))
            .toList();

        return ApiResponse.success(dropdown);
    }

    @GetMapping("/v1/enroll/policy/dummy-search")
    public ApiResponse<List<String>> searchDummyPolicies(
            @RequestParam(required = false) String insurerId,
            @RequestParam(required = false) String corporateId) {

        List<PolicyEntity> dummies;
        if (insurerId != null && corporateId != null) {
            dummies = policyRepository.findByInsurerIdAndCorporateIdAndPolicyRecordType(insurerId, corporateId, "DUMMY");
        } else {
            dummies = policyRepository.findByPolicyRecordType("DUMMY");
        }

        List<String> dummyNumbers = dummies.stream()
            .map(PolicyEntity::getPolicyNumber)
            .toList();

        return ApiResponse.success(dummyNumbers);
    }
}
