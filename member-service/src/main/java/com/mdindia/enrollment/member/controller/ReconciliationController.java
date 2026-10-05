package com.mdindia.enrollment.member.controller;

import com.mdindia.enrollment.common.dto.ApiResponse;
import com.mdindia.enrollment.common.dto.PageResponse;
import com.mdindia.enrollment.member.entity.MemberEntity;
import com.mdindia.enrollment.member.repository.MemberRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/v1/members")
@CrossOrigin(origins = "*")
public class ReconciliationController {

    private final MemberRepository memberRepository;

    public ReconciliationController(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    @GetMapping("/{policyId}/reconciliation-report")
    public ApiResponse<PageResponse<MemberEntity>> getReconciliationReport(
            @PathVariable String policyId,
            @RequestParam(required = false) String reconciliationStatus,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        List<String> statuses;

        if (reconciliationStatus != null && !reconciliationStatus.isBlank()) {
            statuses = Arrays.stream(reconciliationStatus.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
        } else {
            statuses = List.of("EXISTING_MEMBER_MATCHED", "NEW_ENROLLED", "MEMBER_DELETED", "PARTIAL_MISMATCH");
        }

        Page<MemberEntity> result = memberRepository.findByPolicyIdAndReconciliationStatusIn(policyId, statuses, pageable);

        return ApiResponse.success(PageResponse.of(
            result.getContent(),
            result.getTotalElements(),
            result.getNumber(),
            result.getSize()
        ));
    }
}
