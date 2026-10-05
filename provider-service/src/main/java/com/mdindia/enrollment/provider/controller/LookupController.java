package com.mdindia.enrollment.provider.controller;

import com.mdindia.enrollment.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/** Reference data used by the provider screens: small lists, and the provider type master. */
@RestController
@CrossOrigin(origins = "*")
public class LookupController {

    private final JdbcTemplate jdbc;

    LookupController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // ---- small lists ----------------------------------------------------------------------------

    @GetMapping("/v1/provider-clinical-specialty")
    public ApiResponse<List<Map<String, Object>>> specialties(@RequestParam(required = false) String providerClinicalSpecialtyName) {
        return ApiResponse.ofList(lookup("CLINICAL_SPECIALTY", "providerClinicalSpecialty", providerClinicalSpecialtyName));
    }

    @GetMapping("/v1/provider-system-of-medicine")
    public ApiResponse<List<Map<String, Object>>> systemsOfMedicine() {
        return ApiResponse.ofList(lookup("SYSTEM_OF_MEDICINE", "providerSystemOfMedicine", null));
    }

    @GetMapping("/v1/provider-bed-type")
    public ApiResponse<List<Map<String, Object>>> bedTypes() {
        return ApiResponse.ofList(lookup("BED_TYPE", "providerBedType", null));
    }

    @GetMapping("/v1/provider-contact-person-role")
    public ApiResponse<List<Map<String, Object>>> contactPersonRoles() {
        return ApiResponse.ofList(lookup("CONTACT_PERSON_ROLE", "providerContactPersonRole", null));
    }

    /** Each row has id/name plus the longer names some screens read (e.g. providerBedTypeId / providerBedTypeName). */
    private List<Map<String, Object>> lookup(String type, String prefix, String nameFilter) {
        String sql = "select lookup_id, lookup_name from provider_lookups where lookup_type = ? and active = true"
            + (nameFilter == null || nameFilter.isBlank() ? "" : " and lower(lookup_name) like ?") + " order by sort_order, lookup_name";
        Object[] args = nameFilter == null || nameFilter.isBlank() ? new Object[]{type} : new Object[]{type, Util.like(nameFilter)};
        return jdbc.query(sql, (rs, n) -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", rs.getString("lookup_id"));
            m.put("name", rs.getString("lookup_name"));
            m.put(prefix + "Id", rs.getString("lookup_id"));
            m.put(prefix + "Name", rs.getString("lookup_name"));
            return m;
        }, args);
    }

    // ---- provider type master -------------------------------------------------------------------

    /** Filters: typeCode, classCode, subclassCode, displayName, providerTypeScope, isActive, recordStatus. Paging is 1-based. */
    @GetMapping("/v1/provider-type-master")
    public ApiResponse<List<Map<String, Object>>> listTypes(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String typeCode,
            @RequestParam(required = false) String classCode,
            @RequestParam(required = false) String subclassCode,
            @RequestParam(required = false) String displayName,
            @RequestParam(required = false) String providerTypeScope,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String recordStatus,
            @RequestParam(required = false) String sortBy) {

        StringBuilder where = new StringBuilder("where record_status <> 'Deleted'");
        List<Object> args = new ArrayList<>();
        like(where, args, "type_code", typeCode);
        like(where, args, "class_code", classCode);
        like(where, args, "subclass_code", subclassCode);
        like(where, args, "display_name", displayName);
        like(where, args, "provider_type_scope", providerTypeScope);
        if (isActive != null) { where.append(" and is_active = ?"); args.add(isActive); }
        if (recordStatus != null && !recordStatus.isBlank()) { where.append(" and lower(record_status) = ?"); args.add(recordStatus.trim().toLowerCase()); }

        Long total = jdbc.queryForObject("select count(*) from provider_type_master " + where, Long.class, args.toArray());
        int pageSize = size > 0 ? Math.min(size, 1000) : 20;
        int pageNo = Math.max(page, 1);
        args.add(pageSize);
        args.add((long) (pageNo - 1) * pageSize);
        String order = "sortOrder".equals(sortBy) ? "sort_order" : "display_name".equals(sortBy) || "displayName".equals(sortBy) ? "display_name" : "sort_order, display_name";
        List<Map<String, Object>> rows = jdbc.query("select * from provider_type_master " + where + " order by " + order + " limit ? offset ?",
            (rs, n) -> type(rs), args.toArray());
        long totalRecords = total == null ? 0 : total;
        return ApiResponse.success(rows, totalRecords, (int) Math.ceil((double) totalRecords / pageSize), pageNo, pageSize);
    }

    @GetMapping("/v1/provider-type-master/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getType(@PathVariable String id) {
        List<Map<String, Object>> rows = jdbc.query("select * from provider_type_master where provider_type_id = ? and record_status <> 'Deleted'", (rs, n) -> type(rs), id);
        if (rows.isEmpty()) return Util.error(404, "Provider type not found");
        return ResponseEntity.ok(ApiResponse.success(rows.get(0)));
    }

    @PostMapping("/v1/provider-type-master")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createType(@RequestBody Map<String, Object> body) {
        String code = Util.text(body, "typeCode");
        String name = Util.text(body, "displayName");
        if (code == null || name == null) return Util.error(400, "typeCode and displayName are required");
        code = code.toUpperCase().replace(' ', '_');
        Integer dup = jdbc.queryForObject("select count(*) from provider_type_master where type_code = ?", Integer.class, code);
        if (dup != null && dup > 0) return Util.error(409, "Provider type '" + code + "' already exists");
        String id = Util.id("ptm-");
        Integer order = body.get("sortOrder") instanceof Number n ? n.intValue() : 100;
        jdbc.update("insert into provider_type_master (provider_type_id, tenant_id, type_code, class_code, subclass_code, display_name, provider_type_scope, is_active, sort_order) "
                + "values (?,?,?,?,?,?,?,?,?)",
            id, Util.text(body, "tenantId"), code, Util.text(body, "classCode"), Util.text(body, "subclassCode"), name,
            Util.text(body, "providerTypeScope"), body.get("isActive") == null || Boolean.TRUE.equals(Util.bool(body, "isActive")), order);
        return ResponseEntity.ok(ApiResponse.success("Provider type created successfully", type(id)));
    }

    @PatchMapping("/v1/provider-type-master/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> patchType(@PathVariable String id, @RequestBody Map<String, Object> body) {
        Integer exists = jdbc.queryForObject("select count(*) from provider_type_master where provider_type_id = ?", Integer.class, id);
        if (exists == null || exists == 0) return Util.error(404, "Provider type not found");
        String status = Util.text(body, "recordStatus");
        if (status != null) {
            status = switch (status.toUpperCase()) {
                case "ACTIVE" -> "Active";
                case "INACTIVE" -> "Inactive";
                case "DELETED" -> "Deleted";
                default -> null;
            };
            if (status == null) return Util.error(400, "recordStatus must be ACTIVE, INACTIVE or DELETED");
            if ("Deleted".equals(status)) {
                Integer used = jdbc.queryForObject("select count(*) from providers where provider_type_id = ? and record_status <> 'Deleted'", Integer.class, id);
                if (used != null && used > 0) return Util.error(409, "This provider type is used by " + used + " provider(s)");
            }
        }
        jdbc.update("update provider_type_master set class_code = coalesce(?, class_code), subclass_code = coalesce(?, subclass_code), "
                + "display_name = coalesce(?, display_name), provider_type_scope = coalesce(?, provider_type_scope), "
                + "sort_order = coalesce(?, sort_order), is_active = coalesce(?, is_active), record_status = coalesce(?, record_status) where provider_type_id = ?",
            Util.text(body, "classCode"), Util.text(body, "subclassCode"), Util.text(body, "displayName"), Util.text(body, "providerTypeScope"),
            body.get("sortOrder") instanceof Number n ? n.intValue() : null, Util.bool(body, "isActive"), status, id);
        if ("Inactive".equals(status)) jdbc.update("update provider_type_master set is_active = false where provider_type_id = ?", id);
        if ("Active".equals(status)) jdbc.update("update provider_type_master set is_active = true where provider_type_id = ?", id);
        return ResponseEntity.ok(ApiResponse.success("Provider type updated successfully", type(id)));
    }

    // ---------------------------------------------------------------------------------------------

    private Map<String, Object> type(String id) {
        return jdbc.query("select * from provider_type_master where provider_type_id = ?", (rs, n) -> type(rs), id).stream().findFirst().orElse(null);
    }

    private Map<String, Object> type(java.sql.ResultSet rs) throws java.sql.SQLException {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("providerTypeId", rs.getString("provider_type_id"));
        m.put("tenantId", rs.getString("tenant_id"));
        m.put("typeCode", rs.getString("type_code"));
        m.put("classCode", rs.getString("class_code"));
        m.put("subclassCode", rs.getString("subclass_code"));
        m.put("displayName", rs.getString("display_name"));
        m.put("providerTypeScope", rs.getString("provider_type_scope"));
        m.put("isActive", rs.getBoolean("is_active"));
        m.put("sortOrder", rs.getInt("sort_order"));
        m.put("recordStatus", rs.getString("record_status"));
        return m;
    }

    private static void like(StringBuilder where, List<Object> args, String column, String value) {
        if (value == null || value.isBlank()) return;
        where.append(" and lower(").append(column).append(") like ?");
        args.add(Util.like(value));
    }
}
