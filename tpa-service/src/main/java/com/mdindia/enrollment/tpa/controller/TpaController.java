package com.mdindia.enrollment.tpa.controller;

import com.mdindia.enrollment.common.dto.ApiResponse;
import com.mdindia.enrollment.tpa.dto.TpaMapper;
import com.mdindia.enrollment.tpa.entity.TpaEntity;
import com.mdindia.enrollment.tpa.repository.TpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/v1/tpa")
@CrossOrigin(origins = "*")
public class TpaController {

    private final TpaRepository repository;

    public TpaController(TpaRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> list() {
        return ApiResponse.ofList(repository.findAll().stream().map(TpaMapper::tpa).toList());
    }

    @GetMapping("/{tpaId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> get(@PathVariable String tpaId) {
        return repository.findById(tpaId)
            .map(t -> ResponseEntity.ok(ApiResponse.success(TpaMapper.tpa(t))))
            .orElseGet(() -> ResponseEntity.status(404).body(ApiResponse.error("TPA not found", 404)));
    }

    @PostMapping({"", "/"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(@RequestBody Map<String, Object> body) {
        String code = TpaMapper.text(body, "tpaCode");
        String legalName = TpaMapper.text(body, "legalName");
        if (code == null || code.isBlank() || legalName == null || legalName.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("tpaCode and legalName are required", 400));
        }
        TpaEntity tpa = new TpaEntity();
        tpa.setTpaId(UUID.randomUUID().toString());
        apply(tpa, body);
        repository.save(tpa);
        return ResponseEntity.ok(ApiResponse.success("TPA created successfully", TpaMapper.tpa(tpa)));
    }

    @PatchMapping("/{tpaId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> update(@PathVariable String tpaId,
                                                                   @RequestBody Map<String, Object> body) {
        return repository.findById(tpaId).map(tpa -> {
            apply(tpa, body);
            repository.save(tpa);
            return ResponseEntity.ok(ApiResponse.success("TPA updated successfully", TpaMapper.tpa(tpa)));
        }).orElseGet(() -> ResponseEntity.status(404).body(ApiResponse.error("TPA not found", 404)));
    }

    private void apply(TpaEntity tpa, Map<String, Object> body) {
        if (body.containsKey("tpaCode")) tpa.setTpaCode(TpaMapper.text(body, "tpaCode"));
        if (body.containsKey("legalName")) tpa.setLegalName(TpaMapper.text(body, "legalName"));
        if (body.containsKey("cin")) tpa.setCin(TpaMapper.text(body, "cin"));
        if (body.containsKey("contactEmail")) tpa.setContactEmail(TpaMapper.join(body.get("contactEmail")));
        if (body.containsKey("contactPhone")) tpa.setContactPhone(TpaMapper.join(body.get("contactPhone")));
        if (body.get("tenantId") != null) tpa.setTenantId(TpaMapper.text(body, "tenantId"));
        Map<String, Object> address = TpaMapper.map(body, "updateTpaAddressRequestDto");
        if (address == null) address = TpaMapper.map(body, "address");
        if (address != null && address.get("tenantId") != null) tpa.setTenantId(TpaMapper.text(address, "tenantId"));
        TpaMapper.applyAddress(tpa.getAddress(), address);
        tpa.setUpdatedAt(LocalDateTime.now());
    }
}
