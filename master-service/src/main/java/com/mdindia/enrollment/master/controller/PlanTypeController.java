package com.mdindia.enrollment.master.controller;

import com.mdindia.enrollment.common.dto.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/plan-types")
@CrossOrigin(origins = "*")
public class PlanTypeController {

    @GetMapping
    public ApiResponse<List<Object>> getPlanTypes(@RequestParam(defaultValue = "false") boolean onlyName) {
        if (onlyName) {
            return ApiResponse.success(List.of(
                "Base Policy",
                "Top Up Policy",
                "Parental Policy",
                "Comprehensive Group Health Policy",
                "Executive Health Care Policy"
            ));
        }
        return ApiResponse.success(List.of(
            Map.of("id", "PT-01", "name", "Base Policy", "description", "Primary corporate group health coverage"),
            Map.of("id", "PT-02", "name", "Top Up Policy", "description", "Higher sum insured top-up policy"),
            Map.of("id", "PT-03", "name", "Parental Policy", "description", "Coverage dedicated for employee parents/in-laws"),
            Map.of("id", "PT-04", "name", "Comprehensive Group Health Policy", "description", "Full floater group coverage"),
            Map.of("id", "PT-05", "name", "Executive Health Care Policy", "description", "Executive corporate policy tier")
        ));
    }
}
