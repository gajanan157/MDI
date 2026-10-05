package com.mdindia.enrollment.inward.controller;

import com.mdindia.enrollment.common.dto.ApiResponse;
import com.mdindia.enrollment.common.dto.PageResponse;
import com.mdindia.enrollment.inward.entity.InwardEntity;
import com.mdindia.enrollment.inward.repository.InwardRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping
@CrossOrigin(origins = "*")
public class InwardController {

    private final InwardRepository inwardRepository;
    private final AtomicInteger sequence = new AtomicInteger(1003);

    public InwardController(InwardRepository inwardRepository) {
        this.inwardRepository = inwardRepository;
    }

    @GetMapping("/v1/files/inwards")
    public ApiResponse<List<InwardEntity>> getInwards(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String departmentId,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String inwardNo,
            @RequestParam(required = false) String sourceEntityName) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        LocalDateTime from = parseDay(fromDate, false);
        LocalDateTime to = parseDay(toDate, true);
        // All filters are optional; with none given every inward is listed, as before.
        Specification<InwardEntity> spec = (root, query, cb) -> {
            List<Predicate> all = new ArrayList<>();
            if (status != null && !status.isBlank()) all.add(cb.equal(root.get("status"), status.trim()));
            if (departmentId != null && !departmentId.isBlank()) all.add(cb.equal(root.get("departmentId"), departmentId.trim()));
            if (from != null) all.add(cb.greaterThanOrEqualTo(root.get("createdAt"), from));
            if (to != null) all.add(cb.lessThanOrEqualTo(root.get("createdAt"), to));
            if (inwardNo != null && !inwardNo.isBlank()) {
                all.add(cb.like(cb.lower(root.get("inwardNo")), "%" + inwardNo.trim().toLowerCase() + "%"));
            }
            if (sourceEntityName != null && !sourceEntityName.isBlank()) {
                String like = "%" + sourceEntityName.trim().toLowerCase() + "%";
                all.add(cb.or(
                    cb.like(cb.lower(cb.coalesce(root.<String>get("sourceEntityName"), "")), like),
                    cb.like(cb.lower(cb.coalesce(root.<String>get("insurerName"), "")), like),
                    cb.like(cb.lower(cb.coalesce(root.<String>get("corporateName"), "")), like)));
            }
            return cb.and(all.toArray(new Predicate[0]));
        };
        Page<InwardEntity> pageResult = inwardRepository.findAll(spec, pageable);

        return ApiResponse.ofPage(PageResponse.of(
            pageResult.getContent(),
            pageResult.getTotalElements(),
            pageResult.getNumber(),
            pageResult.getSize()
        ));
    }

    /** yyyy-MM-dd to the start (or end) of that day; anything else is ignored. */
    private static LocalDateTime parseDay(String value, boolean endOfDay) {
        if (value == null || value.length() < 10) return null;
        try {
            LocalDate day = LocalDate.parse(value.substring(0, 10));
            return endOfDay ? day.atTime(23, 59, 59) : day.atStartOfDay();
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    @GetMapping("/v1/files/inwards/export")
    public ResponseEntity<byte[]> exportInwards() throws IOException {
        List<InwardEntity> inwards = inwardRepository.findAll(Sort.by("createdAt").descending());

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Inwards");
            Row headerRow = sheet.createRow(0);

            String[] columns = {"Inward No", "Channel", "Branch ID", "Entity Type", "Entity ID", "Reference No", "Priority", "Status", "Created At"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
            }

            int rowIdx = 1;
            for (InwardEntity inward : inwards) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(inward.getInwardNo());
                row.createCell(1).setCellValue(inward.getInwardReceivedChannel());
                row.createCell(2).setCellValue(inward.getInwardReceivedTpaBranchId());
                row.createCell(3).setCellValue(inward.getEntityType());
                row.createCell(4).setCellValue(inward.getEntityId());
                row.createCell(5).setCellValue(inward.getInwardSourceReferenceNo());
                row.createCell(6).setCellValue(inward.getInwardPriority());
                row.createCell(7).setCellValue(inward.getStatus());
                row.createCell(8).setCellValue(inward.getCreatedAt() != null ? inward.getCreatedAt().toString() : "");
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);

            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Inward_List.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(outputStream.toByteArray());
        }
    }

    @PostMapping("/v1/generateId/inwardno")
    public ApiResponse<Map<String, String>> generateInwardNo() {
        String newInwardNo = "INW-2026-" + sequence.getAndIncrement();
        return ApiResponse.success(Map.of("inwardNo", newInwardNo));
    }

    @PatchMapping("/v1/generateId/inwardno/{id}")
    public ApiResponse<Map<String, String>> updateInwardNo(@PathVariable String id, @RequestBody Map<String, String> body) {
        return ApiResponse.success(Map.of("inwardNo", id, "message", "Inward updated"));
    }
}
