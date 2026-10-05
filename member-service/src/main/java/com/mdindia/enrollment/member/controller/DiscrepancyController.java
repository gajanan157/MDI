package com.mdindia.enrollment.member.controller;

import com.mdindia.enrollment.common.dto.ApiResponse;
import com.mdindia.enrollment.common.dto.PageResponse;
import com.mdindia.enrollment.member.entity.MemberEntity;
import com.mdindia.enrollment.member.repository.MemberRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/member")
@CrossOrigin(origins = "*")
public class DiscrepancyController {

    private final MemberRepository memberRepository;

    public DiscrepancyController(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    @GetMapping("/{policyId}/discrepancies")
    public ApiResponse<PageResponse<MemberEntity>> getDiscrepancies(
            @PathVariable String policyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<MemberEntity> result = memberRepository.findDiscrepancies(policyId, pageable);

        return ApiResponse.success(PageResponse.of(
            result.getContent(),
            result.getTotalElements(),
            result.getNumber(),
            result.getSize()
        ));
    }
}
