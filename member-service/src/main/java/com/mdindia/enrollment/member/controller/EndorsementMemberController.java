package com.mdindia.enrollment.member.controller;

import com.mdindia.enrollment.common.dto.ApiResponse;
import com.mdindia.enrollment.common.dto.PageResponse;
import com.mdindia.enrollment.member.entity.MemberEntity;
import com.mdindia.enrollment.member.repository.MemberRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/member")
@CrossOrigin(origins = "*")
public class EndorsementMemberController {

    private final MemberRepository memberRepository;

    public EndorsementMemberController(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    @GetMapping("/endorsementDetail")
    public ApiResponse<PageResponse<MemberEntity>> getEndorsementDetail(
            @RequestParam(required = false) String policyEndorsementId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<MemberEntity> result;
        if (policyEndorsementId != null && !policyEndorsementId.isBlank()) {
            result = memberRepository.findByPolicyEndorsementId(policyEndorsementId, pageable);
        } else {
            result = memberRepository.findAll(pageable);
        }

        return ApiResponse.success(PageResponse.of(
            result.getContent(),
            result.getTotalElements(),
            result.getNumber(),
            result.getSize()
        ));
    }

    @GetMapping("/endorsementStat/{id}")
    public ApiResponse<Map<String, Object>> getEndorsementStatistics(@PathVariable String id) {
        return ApiResponse.success(Map.of(
            "totalRequested", 45,
            "additions", Map.of("success", 40, "failed", 0),
            "modifications", Map.of("success", 0, "failed", 0),
            "deletions", Map.of("success", 5, "failed", 0)
        ));
    }

    @GetMapping("/download")
    public ResponseEntity<byte[]> downloadEndorsementEnrolled(
            @RequestParam(required = false) String policyEndorsementId,
            @RequestParam(required = false) String enrollmentStatus) throws IOException {

        List<MemberEntity> members = memberRepository.findAll();

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Endorsement Members");
            Row headerRow = sheet.createRow(0);

            String[] columns = {"Action", "UHID", "Health Card No", "Employee Code", "Name", "Relationship", "Status"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
            }

            int rowIdx = 1;
            for (MemberEntity m : members) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(m.getEnrollmentAction() != null ? m.getEnrollmentAction() : "ADDITION");
                row.createCell(1).setCellValue(m.getUhid() != null ? m.getUhid() : "");
                row.createCell(2).setCellValue(m.getHealthCardNumber() != null ? m.getHealthCardNumber() : "");
                row.createCell(3).setCellValue(m.getCorporateEmployeeCode() != null ? m.getCorporateEmployeeCode() : "");
                row.createCell(4).setCellValue(m.getInsuredMemberName() != null ? m.getInsuredMemberName() : "");
                row.createCell(5).setCellValue(m.getRelationship() != null ? m.getRelationship() : "");
                row.createCell(6).setCellValue(m.getEnrollmentStatus() != null ? m.getEnrollmentStatus() : "ENROLLED");
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);

            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Endorsement_Members.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(outputStream.toByteArray());
        }
    }
}
