package com.mdindia.enrollment.master.controller;

import com.mdindia.enrollment.common.dto.ApiResponse;
import com.mdindia.enrollment.master.entity.CorporateEntity;
import com.mdindia.enrollment.master.repository.CorporateRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/v1/corporates", "/v1/corporate"})
@CrossOrigin(origins = "*")
public class CorporateController {

    private final CorporateRepository repository;

    public CorporateController(CorporateRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ApiResponse<List<CorporateEntity>> getAll(@RequestParam(required = false) String corporateGroupId) {
        if (corporateGroupId != null && !corporateGroupId.isBlank()) {
            return ApiResponse.ofList(repository.findByCorporateGroupId(corporateGroupId));
        }
        return ApiResponse.ofList(repository.findAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<CorporateEntity> getById(@PathVariable String id) {
        return repository.findById(id)
            .map(ApiResponse::success)
            .orElseGet(() -> ApiResponse.error("Corporate not found", 404));
    }

    @PostMapping
    public ApiResponse<CorporateEntity> create(@RequestBody CorporateEntity corporate) {
        if (corporate.getCorporateId() == null || corporate.getCorporateId().isBlank()) {
            corporate.setCorporateId("CORP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        corporate.setCreatedAt(LocalDateTime.now());
        if (corporate.getStatus() == null) corporate.setStatus("ACTIVE");
        CorporateEntity saved = repository.save(corporate);
        return ApiResponse.success("Corporate created successfully", saved);
    }
}
