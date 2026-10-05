package com.mdindia.enrollment.master.controller;

import com.mdindia.enrollment.common.dto.ApiResponse;
import com.mdindia.enrollment.master.entity.CorporateGroupEntity;
import com.mdindia.enrollment.master.repository.CorporateGroupRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/v1/corporate-group", "/v1/corporate-groups"})
@CrossOrigin(origins = "*")
public class CorporateGroupController {

    private final CorporateGroupRepository repository;

    public CorporateGroupController(CorporateGroupRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ApiResponse<List<CorporateGroupEntity>> getAll() {
        return ApiResponse.ofList(repository.findAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<CorporateGroupEntity> getById(@PathVariable String id) {
        return repository.findById(id)
            .map(ApiResponse::success)
            .orElseGet(() -> ApiResponse.error("Corporate group not found", 404));
    }

    @PostMapping
    public ApiResponse<CorporateGroupEntity> create(@RequestBody CorporateGroupEntity group) {
        if (group.getCorporateGroupId() == null || group.getCorporateGroupId().isBlank()) {
            group.setCorporateGroupId("GRP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        group.setCreatedAt(LocalDateTime.now());
        if (group.getStatus() == null) group.setStatus("ACTIVE");
        CorporateGroupEntity saved = repository.save(group);
        return ApiResponse.success("Corporate group created successfully", saved);
    }
}
