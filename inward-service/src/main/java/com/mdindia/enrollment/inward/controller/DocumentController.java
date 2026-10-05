package com.mdindia.enrollment.inward.controller;

import com.mdindia.enrollment.common.dto.ApiResponse;
import com.mdindia.enrollment.inward.entity.DocumentEntity;
import com.mdindia.enrollment.inward.entity.InwardEntity;
import com.mdindia.enrollment.inward.repository.DocumentRepository;
import com.mdindia.enrollment.inward.repository.InwardRepository;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@CrossOrigin(origins = "*")
public class DocumentController {

    private static final String DEFAULT_BUCKET = "enrollment";
    private static final String DEFAULT_SUB_BUCKET = "general";

    private final InwardRepository inwardRepository;
    private final DocumentRepository documentRepository;
    private final AtomicInteger sequence = new AtomicInteger(1005);

    public DocumentController(InwardRepository inwardRepository, DocumentRepository documentRepository) {
        this.inwardRepository = inwardRepository;
        this.documentRepository = documentRepository;
    }

    @PostMapping(value = "/v1/scan/files/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Map<String, Object>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String inwardNo,
            @RequestParam(required = false) String inwardReceivedTpaBranchId,
            @RequestParam(required = false) String inwardReceivedChannel,
            @RequestParam(required = false) String departmentId,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String entityId,
            @RequestParam(required = false) String inwardSourceReferenceNo,
            @RequestParam(required = false) String inwardPriority,
            @RequestParam(required = false) String documentType,
            @RequestParam(required = false) String s3BucketName,
            @RequestParam(required = false) String s3SubBucketName) {

        if (file == null || file.isEmpty()) {
            return ApiResponse.error("Uploaded file is empty", "FILE_EMPTY", 400);
        }

        String effectiveInwardNo = trimToNull(inwardNo);
        if (effectiveInwardNo == null) {
            effectiveInwardNo = nextInwardNo();

            InwardEntity newInward = InwardEntity.builder()
                .inwardNo(effectiveInwardNo)
                .inwardReceivedTpaBranchId(defaultIfBlank(inwardReceivedTpaBranchId, "BR-PUN"))
                .inwardReceivedChannel(upperCase(inwardReceivedChannel, "EMAIL"))
                .departmentId(defaultIfBlank(departmentId, "DEPT-ENROLL"))
                .entityType(upperCase(entityType, "CORPORATE"))
                .entityId(defaultIfBlank(entityId, "CORP-201"))
                .inwardSourceReferenceNo(defaultIfBlank(inwardSourceReferenceNo, ""))
                .inwardPriority(upperCase(inwardPriority, "MEDIUM"))
                .s3BucketName(defaultIfBlank(s3BucketName, DEFAULT_BUCKET))
                .s3SubBucketName(defaultIfBlank(s3SubBucketName, DEFAULT_SUB_BUCKET))
                .status("UNDER_PROCESS")
                .createdAt(LocalDateTime.now())
                .build();
            // Inwards uploaded here belong to the corporate health enrolment portal.
            newInward.setCategory("CORPORATE_HEALTH");
            newInward.setSubCategory("ENROLLMENT");
            newInward.setAppName("ENROLLMENT_PORTAL");

            inwardRepository.save(newInward);
        }

        String fileMetadataId = nextFileMetadataId();
        String originalFileName = defaultIfBlank(file.getOriginalFilename(), "uploaded_file");
        String resolvedDocumentType = defaultIfBlank(documentType, "POLICY_SCHEDULE");
        String resolvedBucket = defaultIfBlank(s3BucketName, DEFAULT_BUCKET);
        String resolvedSubBucket = defaultIfBlank(s3SubBucketName, DEFAULT_SUB_BUCKET);

        DocumentEntity document = DocumentEntity.builder()
            .fileMetadataId(fileMetadataId)
            .inwardNo(effectiveInwardNo)
            .fileName(originalFileName)
            .documentType(resolvedDocumentType)
            .s3BucketName(resolvedBucket)
            .s3SubBucketName(resolvedSubBucket)
            .fileSize(file.getSize())
            .contentType(defaultIfBlank(file.getContentType(), MediaType.APPLICATION_OCTET_STREAM_VALUE))
            .downloadUrl("/v1/files/download/" + fileMetadataId)
            .createdAt(LocalDateTime.now())
            .build();

        documentRepository.save(document);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("inwardNo", effectiveInwardNo);
        data.put("fileMetadataId", fileMetadataId);
        data.put("fileName", originalFileName);
        data.put("documentType", resolvedDocumentType);
        data.put("s3BucketName", resolvedBucket);
        data.put("s3SubBucketName", resolvedSubBucket);
        data.put("fileSize", file.getSize());
        data.put("downloadUrl", document.getDownloadUrl());

        return ApiResponse.success("File uploaded successfully", data);
    }

    @PostMapping("/v1/scan/files/presigned-upload-init")
    public ApiResponse<Map<String, Object>> presignedUploadInit(@RequestBody(required = false) Map<String, Object> request) {
        String fileMetadataId = nextFileMetadataId();
        String fileName = request != null ? trimToNull(asString(request.get("fileName"))) : null;
        String inwardNo = request != null ? trimToNull(asString(request.get("inwardNo"))) : null;
        String objectKey = fileMetadataId + (fileName != null ? "/" + fileName : "");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("fileMetadataId", fileMetadataId);
        data.put("uploadUrl", "https://s3.mdindia.com/upload/" + objectKey);
        data.put("httpMethod", "PUT");
        data.put("expiresInSeconds", 900);
        if (inwardNo != null) {
            data.put("inwardNo", inwardNo);
        }

        return ApiResponse.success(data);
    }

    @PostMapping("/v1/scan/files/{fileMetadataId}/complete")
    public ApiResponse<Map<String, String>> presignedUploadComplete(@PathVariable String fileMetadataId) {
        DocumentEntity document = documentRepository.findById(fileMetadataId).orElse(null);
        if (document == null) {
            return ApiResponse.error("Unknown fileMetadataId: " + fileMetadataId, "DOCUMENT_NOT_FOUND", 404);
        }

        document.setDownloadUrl("/v1/files/download/" + document.getFileMetadataId());
        documentRepository.save(document);

        return ApiResponse.success(Map.of(
            "fileMetadataId", fileMetadataId,
            "status", "COMPLETED"
        ));
    }

    @GetMapping("/v1/files/presigned-url")
    public ApiResponse<Map<String, String>> getPresignedUrl(
            @RequestParam(required = false) String inwardNo,
            @RequestParam(required = false) String s3BucketName,
            @RequestParam(required = false) String s3SubBucketName,
            @RequestParam(required = false) String documentType) {

        String fileName = "Member_Failed_Report.xlsx";
        if ("UNDERWRITING_EXCEPTION".equalsIgnoreCase(documentType)) {
            fileName = "Underwriting_Exception_Doc.pdf";
        }

        return ApiResponse.success(Map.of(
            "downloadUrl", "/v1/files/download/" + fileName,
            "fileName", fileName,
            "inwardNo", inwardNo != null ? inwardNo : "",
            "s3BucketName", defaultIfBlank(s3BucketName, DEFAULT_BUCKET),
            "s3SubBucketName", defaultIfBlank(s3SubBucketName, DEFAULT_SUB_BUCKET)
        ));
    }

    @GetMapping("/v1/files/download/{id}")
    public ResponseEntity<byte[]> downloadMockFile(@PathVariable String id) {
        byte[] content = ("Mock content for file: " + id).getBytes(StandardCharsets.UTF_8);

        String safeFileName = id.replaceAll("[^A-Za-z0-9._-]", "_");
        ContentDisposition disposition = ContentDisposition.attachment()
            .filename(safeFileName, StandardCharsets.UTF_8)
            .build();

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .body(content);
    }

    private String nextInwardNo() {
        String candidate;
        do {
            candidate = "INW-2026-" + sequence.getAndIncrement();
        } while (inwardRepository.existsById(candidate));
        return candidate;
    }

    private String nextFileMetadataId() {
        String candidate;
        do {
            candidate = "DOC-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase(Locale.ROOT);
        } while (documentRepository.existsById(candidate));
        return candidate;
    }

    private static String asString(Object value) {
        return value instanceof String s ? s : null;
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static String defaultIfBlank(String value, String fallback) {
        String trimmed = trimToNull(value);
        return trimmed != null ? trimmed : fallback;
    }

    private static String upperCase(String value, String fallback) {
        String trimmed = trimToNull(value);
        return trimmed != null ? trimmed.toUpperCase(Locale.ROOT) : fallback;
    }
}