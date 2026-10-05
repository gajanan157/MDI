package com.mdindia.enrollment.member.controller;

import com.mdindia.enrollment.common.dto.ApiResponse;
import com.mdindia.enrollment.common.dto.ExceptionApprovalRequestDto;
import com.mdindia.enrollment.common.dto.PageResponse;
import com.mdindia.enrollment.member.entity.MemberEntity;
import com.mdindia.enrollment.member.repository.MemberRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@RestController
@RequestMapping
@CrossOrigin(origins = "*")
public class ExceptionController {

    private final MemberRepository memberRepository;
    private final AtomicInteger cardSeq = new AtomicInteger(880050);

    public ExceptionController(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    @GetMapping("/v1/member/{policyId}/exceptions/summary")
    public ApiResponse<List<Map<String, Object>>> getExceptionsSummary(
            @PathVariable String policyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        List<MemberEntity> exceptionMembers = memberRepository.findByPolicyIdAndEnrollmentStatus(policyId, "EXCEPTION");

        Map<String, Long> categoryCounts = exceptionMembers.stream()
            .filter(m -> m.getExceptionCategory() != null)
            .collect(Collectors.groupingBy(MemberEntity::getExceptionCategory, Collectors.counting()));

        List<Map<String, Object>> summary = categoryCounts.entrySet().stream()
            .map(entry -> {
                Map<String, Object> map = new HashMap<>();
                map.put("category", entry.getKey());
                map.put("count", entry.getValue());
                return map;
            })
            .toList();

        return ApiResponse.success(summary);
    }

    @GetMapping("/v1/member/{policyId}/exceptions")
    public ApiResponse<PageResponse<MemberEntity>> getCategoryExceptions(
            @PathVariable String policyId,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<MemberEntity> result;
        if (category != null && !category.isBlank()) {
            result = memberRepository.findByPolicyIdAndExceptionCategory(policyId, category, pageable);
        } else {
            result = memberRepository.findByPolicyIdAndEnrollmentStatus(policyId, "EXCEPTION", pageable);
        }

        return ApiResponse.success(PageResponse.of(
            result.getContent(),
            result.getTotalElements(),
            result.getNumber(),
            result.getSize()
        ));
    }

    @PostMapping("/v1/members/exceptions/enroll")
    public ApiResponse<Map<String, Object>> approveExceptions(@RequestBody ExceptionApprovalRequestDto request) {
        List<String> stagingIds = request.getStagingMemberEnrollmentIds();
        int approvedCount = 0;

        if (stagingIds != null && !stagingIds.isEmpty()) {
            for (String stagingId : stagingIds) {
                Optional<MemberEntity> opt = memberRepository.findByStagingMemberEnrollmentId(stagingId);
                if (opt.isPresent()) {
                    MemberEntity member = opt.get();
                    member.setEnrollmentStatus("ENROLLED");
                    member.setRecordStatus("ACTIVE");
                    int num = cardSeq.getAndIncrement();
                    member.setUhid("UHID-MD-" + num);
                    member.setHealthCardNumber("HC-" + num);
                    member.setComment("Approved by QC with underwriting document. Remark: " + request.getExceptionApprovalRemark());
                    memberRepository.save(member);
                    approvedCount++;
                }
            }
        }

        return ApiResponse.success("Underwriting exception approved successfully", Map.of(
            "approvedMembersCount", approvedCount,
            "status", "ENROLLED"
        ));
    }
}
