package com.mdindia.enrollment.master.controller;

import com.mdindia.enrollment.common.dto.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/documentmaster")
@CrossOrigin(origins = "*")
public class DocumentMasterController {

    @GetMapping
    public ApiResponse<Map<String, Object>> getDocumentMaster(
            @RequestParam(defaultValue = "true") boolean onlyName,
            @RequestParam(required = false) String departmentId,
            @RequestParam(required = false) String departmentSubtype) {

        return ApiResponse.success(Map.of(
            "s3BucketName", "enrollment",
            "departmentSubtypes", List.of("CORPORATE_ENROLLMENT", "RETAIL_ENROLLMENT", "ENDORSEMENT", "MBM"),
            "documentTypes", List.of(
                "POLICY_SCHEDULE",
                "MEMBER_DATA",
                "UNDERWRITING_EXCEPTION",
                "PREMIUM_RECEIPT",
                "PROPOSAL_FORM",
                "CO_INSURANCE_AGREEMENT",
                "OTHERS"
            )
        ));
    }
}
