package com.mdindia.enrollment.ecard.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.mdindia.enrollment.common.dto.ApiResponse;
import com.mdindia.enrollment.ecard.entity.ECardTemplateEntity;
import com.mdindia.enrollment.ecard.repository.ECardTemplateRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/v1/ecards")
@CrossOrigin(origins = "*")
public class ECardController {

    private final ECardTemplateRepository repository;
    private final ObjectMapper objectMapper;

    public ECardController(ECardTemplateRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/template-details")
    public ApiResponse<Map<String, Object>> getTemplateDetails(
            @RequestParam(required = false) String insurerId,
            @RequestParam(required = false) String corporateId) {

        Optional<ECardTemplateEntity> templateOpt = (insurerId != null && corporateId != null)
            ? repository.findByInsurerIdAndCorporateId(insurerId, corporateId)
            : repository.findAll().stream().findFirst();

        ECardTemplateEntity template = templateOpt.orElseGet(() -> ECardTemplateEntity.builder()
            .templateConfigurationId("TMPL-DEFAULT")
            .templateName("Standard Template")
            .insurerId(insurerId != null ? insurerId : "INS-001")
            .corporateId(corporateId != null ? corporateId : "CORP-201")
            .active(true)
            .eCardType("PHOTO")
            .templateLabelsJson("{\"policyNoLabel\":\"Policy No\",\"memberIdLabel\":\"Health Card No\",\"validityLabel\":\"Valid Till\"}")
            .createdAt(LocalDateTime.now())
            .build());

        Map<String, Object> labels = new HashMap<>();
        try {
            if (template.getTemplateLabelsJson() != null) {
                labels = objectMapper.readValue(template.getTemplateLabelsJson(), Map.class);
            }
        } catch (Exception ignored) {}

        Map<String, Object> response = new HashMap<>();
        response.put("templateConfigurationId", template.getTemplateConfigurationId());
        response.put("templateName", template.getTemplateName());
        response.put("insurerId", template.getInsurerId());
        response.put("corporateId", template.getCorporateId());
        response.put("active", template.getActive());
        response.put("eCardType", template.getECardType());
        response.put("templateLabels", labels);

        return ApiResponse.success(response);
    }

    @PostMapping("/preview")
    public ApiResponse<Map<String, Object>> previewTemplate(@RequestBody Map<String, Object> body) {
        return ApiResponse.success("Template preview generated successfully", Map.of(
            "previewHtml", "<div class='ecard-preview'><h4>MD INDIA HEALTH CARD</h4></div>",
            "labelsApplied", body.getOrDefault("templateLabels", Map.of())
        ));
    }

    @PutMapping("/template-customization")
    public ApiResponse<ECardTemplateEntity> customizeTemplate(@RequestBody Map<String, Object> body) {
        String insurerId = (String) body.getOrDefault("insurerId", "INS-001");
        String corporateId = (String) body.getOrDefault("corporateId", "CORP-201");
        String templateName = (String) body.getOrDefault("templateName", "Customized Template");
        String eCardType = (String) body.getOrDefault("eCardType", "PHOTO");
        Object labels = body.get("templateLabels");

        String labelsJson = "{}";
        try {
            if (labels != null) labelsJson = objectMapper.writeValueAsString(labels);
        } catch (Exception ignored) {}

        final String finalLabels = labelsJson;

        ECardTemplateEntity entity = repository.findByInsurerIdAndCorporateId(insurerId, corporateId)
            .orElseGet(() -> ECardTemplateEntity.builder()
                .templateConfigurationId("TMPL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .insurerId(insurerId)
                .corporateId(corporateId)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build());

        entity.setTemplateName(templateName);
        entity.setECardType(eCardType);
        entity.setTemplateLabelsJson(finalLabels);
        ECardTemplateEntity saved = repository.save(entity);

        return ApiResponse.success("Template customization saved successfully", saved);
    }

    @GetMapping("/templates-list")
    public ApiResponse<List<ECardTemplateEntity>> getTemplatesList(@RequestParam(required = false) Boolean active) {
        if (active != null) {
            return ApiResponse.success(repository.findByActive(active));
        }
        return ApiResponse.success(repository.findAll());
    }

    @GetMapping("/templates/names")
    public ApiResponse<List<String>> getTemplateNames() {
        List<String> names = repository.findAll().stream()
            .map(ECardTemplateEntity::getTemplateName)
            .toList();
        return ApiResponse.success(names);
    }

    @PutMapping("/{templateConfigurationId}/status")
    public ApiResponse<String> updateStatus(
            @PathVariable String templateConfigurationId,
            @RequestParam boolean active) {

        return repository.findById(templateConfigurationId)
            .map(t -> {
                t.setActive(active);
                repository.save(t);
                return ApiResponse.success("Template status updated to " + (active ? "ACTIVE" : "INACTIVE"), "SUCCESS");
            })
            .orElseGet(() -> ApiResponse.error("Template not found", 404));
    }

    @GetMapping("/pdf")
    public ResponseEntity<byte[]> generateECardPdf(
            @RequestParam String healthCardNumber,
            @RequestParam(required = false) String corporateId) {

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A6.rotate(), 20, 20, 20, 20);
            PdfWriter.getInstance(document, baos);
            document.open();

            // Card Header
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(0, 51, 102));
            Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(100, 100, 100));
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.BLACK);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.BLACK);

            Paragraph header = new Paragraph("MD INDIA HEALTHCARE SERVICES (TPA) PVT. LTD.", titleFont);
            header.setAlignment(Element.ALIGN_CENTER);
            document.add(header);

            Paragraph subHeader = new Paragraph("CORPORATE GROUP HEALTH INSURANCE E-CARD", subTitleFont);
            subHeader.setAlignment(Element.ALIGN_CENTER);
            subHeader.setSpacingAfter(10);
            document.add(subHeader);

            // Table with member details
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1.5f, 2.5f});

            addCell(table, "Health Card Number:", boldFont);
            addCell(table, healthCardNumber, boldFont);

            addCell(table, "Member Name:", normalFont);
            addCell(table, "Rajesh Kumar", normalFont);

            addCell(table, "Corporate ID:", normalFont);
            addCell(table, corporateId != null ? corporateId : "CORP-201 (Tata Consultancy Services)", normalFont);

            addCell(table, "Policy Number:", normalFont);
            addCell(table, "POL-TCS-2026-001", normalFont);

            addCell(table, "Valid Thru:", normalFont);
            addCell(table, "31-Mar-2027", normalFont);

            addCell(table, "24x7 Toll Free Support:", boldFont);
            addCell(table, "1800-233-1166 / 1800-233-4500", boldFont);

            document.add(table);

            Paragraph footer = new Paragraph("\nNote: Cashless facility subject to network hospital terms and conditions.", FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 7, Color.GRAY));
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();

            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + healthCardNumber + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(baos.toByteArray());

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private void addCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(3);
        table.addCell(cell);
    }
}
