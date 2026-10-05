package com.mdindia.enrollment.inward.controller;

import com.mdindia.enrollment.common.dto.ApiResponse;
import com.mdindia.enrollment.inward.entity.PsuFileMetadataEntity;
import com.mdindia.enrollment.inward.repository.PsuFileMetadataRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/xml-parser")
@CrossOrigin(origins = "*")
public class PsuXmlController {

    private final PsuFileMetadataRepository repository;

    public PsuXmlController(PsuFileMetadataRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/file-metadata/search")
    public ApiResponse<List<PsuFileMetadataEntity>> searchFiles() {
        return ApiResponse.success(repository.findAll());
    }

    @GetMapping("/file-metadata/summary")
    public ApiResponse<Map<String, Object>> getSummary() {
        List<PsuFileMetadataEntity> all = repository.findAll();
        long totalFiles = all.size();
        long schedulesFound = all.stream().filter(f -> Boolean.TRUE.equals(f.getPolicyScheduleFound())).count();
        long memberDataFound = all.stream().filter(f -> Boolean.TRUE.equals(f.getMemberDataFound())).count();

        return ApiResponse.success(Map.of(
            "totalFiles", totalFiles,
            "policySchedulesFound", schedulesFound,
            "memberDataFound", memberDataFound,
            "pendingFiles", all.stream().filter(f -> "PENDING".equalsIgnoreCase(f.getStatus())).count()
        ));
    }

    @PostMapping("/file-metadata/kafka-events")
    public ApiResponse<Map<String, Object>> pushToKafka(@RequestBody(required = false) List<String> fileIds) {
        if (fileIds != null && !fileIds.isEmpty()) {
            for (String id : fileIds) {
                repository.findById(id).ifPresent(f -> {
                    f.setStatus("PROCESSED");
                    repository.save(f);
                });
            }
        }
        return ApiResponse.success("Selected PSU files dispatched to processing queue", Map.of(
            "dispatchedCount", fileIds != null ? fileIds.size() : 0,
            "status", "QUEUED"
        ));
    }
}
