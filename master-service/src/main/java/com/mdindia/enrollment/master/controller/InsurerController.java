package com.mdindia.enrollment.master.controller;

import com.mdindia.enrollment.common.dto.ApiResponse;
import com.mdindia.enrollment.master.entity.InsurerEntity;
import com.mdindia.enrollment.master.entity.InsurerOfficeEntity;
import com.mdindia.enrollment.master.repository.InsurerOfficeRepository;
import com.mdindia.enrollment.master.repository.InsurerRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/v1/insurer", "/v1/insurers"})
@CrossOrigin(origins = "*")
public class InsurerController {

    private final InsurerRepository insurerRepository;
    private final InsurerOfficeRepository officeRepository;

    public InsurerController(InsurerRepository insurerRepository, InsurerOfficeRepository officeRepository) {
        this.insurerRepository = insurerRepository;
        this.officeRepository = officeRepository;
    }

    @GetMapping
    public ApiResponse<List<InsurerEntity>> getAll() {
        return ApiResponse.success(insurerRepository.findAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<InsurerEntity> getById(@PathVariable String id) {
        return insurerRepository.findById(id)
            .map(ApiResponse::success)
            .orElseGet(() -> ApiResponse.error("Insurer not found", 404));
    }

    @GetMapping("/{id}/uo-offices")
    public ApiResponse<List<InsurerOfficeEntity>> getUnderwritingOffices(@PathVariable String id) {
        List<InsurerOfficeEntity> offices = officeRepository.findByInsurerIdAndOfficeType(id, "ISSUING");
        if (offices.isEmpty()) {
            offices = officeRepository.findByInsurerId(id);
        }
        return ApiResponse.success(offices);
    }

    @GetMapping("/hierarchy")
    public ApiResponse<Map<String, Object>> getHierarchy(
            @RequestParam String insurerId,
            @RequestParam(required = false) String insurerOfficeId) {
        List<InsurerOfficeEntity> allOffices = officeRepository.findByInsurerId(insurerId);
        List<InsurerOfficeEntity> regional = allOffices.stream()
            .filter(o -> "REGIONAL".equalsIgnoreCase(o.getOfficeType()))
            .toList();
        List<InsurerOfficeEntity> divisional = allOffices.stream()
            .filter(o -> "DIVISIONAL".equalsIgnoreCase(o.getOfficeType()))
            .toList();
        List<InsurerOfficeEntity> issuing = allOffices.stream()
            .filter(o -> "ISSUING".equalsIgnoreCase(o.getOfficeType()))
            .toList();

        return ApiResponse.success(Map.of(
            "insurerId", insurerId,
            "regionalOffices", regional,
            "divisionalOffices", divisional,
            "issuingOffices", issuing
        ));
    }
}
