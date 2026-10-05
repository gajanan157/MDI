package com.mdindia.enrollment.provider.controller;

import com.mdindia.enrollment.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

/** The Rohini registry of hospitals. Paging here is 0-based, as the Rohini Master screen sends it. */
@RestController
@RequestMapping("/v1/provider-rohini-master")
@CrossOrigin(origins = "*")
public class RohiniMasterController {

    private static final Map<String, String> SORT_COLUMNS = Map.of(
        "createdAt", "r.created_at", "providerName", "r.provider_name", "rohiniCode", "r.rohini_code",
        "effectiveToDate", "r.effective_to_date", "nextRenewalDueDate", "r.next_renewal_due_date");

    private final JdbcTemplate jdbc;

    RohiniMasterController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * Filters: providerName, rohiniCode, state, district, city, pincode, filterStatus (ACTIVE or INACTIVE; omit for all).
     * expiringProvidersView=true limits the list to Rohini codes that expire within 30 days.
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String providerName,
            @RequestParam(required = false) String rohiniCode,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String pincode,
            @RequestParam(required = false) String filterStatus,
            @RequestParam(defaultValue = "false") boolean expiringProvidersView,
            @RequestParam(defaultValue = "false") boolean download,
            @RequestParam(required = false) String sortBy) {

        if (download) {
            return ResponseEntity.status(501).body(Map.of("success", false, "status", 501, "message", "Excel download is not available yet"));
        }

        StringBuilder where = new StringBuilder("where 1=1");
        List<Object> args = new ArrayList<>();
        like(where, args, "r.provider_name", providerName);
        like(where, args, "r.rohini_code", rohiniCode);
        like(where, args, "r.state_name", state);
        like(where, args, "r.district", district);
        like(where, args, "r.city", city);
        like(where, args, "r.postal_code", pincode);
        if (filterStatus != null && ("ACTIVE".equalsIgnoreCase(filterStatus) || "INACTIVE".equalsIgnoreCase(filterStatus))) {
            where.append(" and r.record_status = ?");
            args.add(filterStatus.trim().toUpperCase());
        }
        if (expiringProvidersView) {
            where.append(" and r.effective_to_date between current_date and current_date + 30");
        }

        Long total = jdbc.queryForObject("select count(*) from provider_rohini_master r " + where, Long.class, args.toArray());
        int pageSize = size > 0 ? Math.min(size, 1000) : 20;
        int pageIndex = Math.max(page, 0);
        args.add(pageSize);
        args.add((long) pageIndex * pageSize);
        List<Map<String, Object>> rows = jdbc.query("select r.* from provider_rohini_master r " + where + " order by " + orderBy(sortBy) + " limit ? offset ?",
            (rs, n) -> item(rs), args.toArray());

        long totalRecords = total == null ? 0 : total;
        Integer expiring = jdbc.queryForObject("select count(*) from provider_rohini_master where record_status = 'ACTIVE' "
            + "and effective_to_date between current_date and current_date + 30", Integer.class);

        Map<String, Object> pagination = new LinkedHashMap<>();
        pagination.put("totalRecords", totalRecords);
        pagination.put("totalPages", (int) Math.ceil((double) totalRecords / pageSize));
        pagination.put("currentPage", pageIndex);
        pagination.put("recordPerPage", pageSize);

        Map<String, Object> additional = new LinkedHashMap<>();
        additional.put("inwardNos", List.of());
        additional.put("countExpiringInDays", expiring == null ? 0 : expiring);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("status", 200);
        body.put("message", "Operation successful");
        body.put("data", rows);
        body.put("pagination", pagination);
        body.put("additionalData", additional);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> get(@PathVariable String id) {
        List<Map<String, Object>> rows = jdbc.query("select r.* from provider_rohini_master r where r.provider_rohini_id = ? or r.rohini_code = ?",
            (rs, n) -> item(rs), id, id);
        if (rows.isEmpty()) return Util.error(404, "Rohini record not found");
        return ResponseEntity.ok(ApiResponse.success(rows.get(0)));
    }

    private static Map<String, Object> item(ResultSet rs) throws SQLException {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("providerRohiniId", rs.getString("provider_rohini_id"));
        m.put("id", rs.getString("provider_rohini_id"));
        m.put("rohiniCode", rs.getString("rohini_code"));
        m.put("providerName", rs.getString("provider_name"));
        m.put("providerAddress", rs.getString("provider_address"));
        m.put("providerEmailId", split(rs.getString("email_id")));
        m.put("providerMobileNo", split(rs.getString("mobile_no")));
        m.put("stateName", rs.getString("state_name"));
        m.put("district", rs.getString("district"));
        m.put("city", rs.getString("city"));
        m.put("postalCode", rs.getString("postal_code"));
        m.put("bedCount", rs.getObject("bed_count"));
        m.put("latitude", rs.getBigDecimal("latitude"));
        m.put("longitude", rs.getBigDecimal("longitude"));
        m.put("effectiveToDate", rs.getDate("effective_to_date") == null ? null : rs.getDate("effective_to_date").toString());
        m.put("nextRenewalDueDate", rs.getDate("next_renewal_due_date") == null ? null : rs.getDate("next_renewal_due_date").toString());
        m.put("registrationStatus", rs.getString("registration_status"));
        m.put("providerStatus", rs.getString("provider_status"));
        m.put("networkType", rs.getString("network_type"));
        m.put("recordStatus", rs.getString("record_status"));
        return m;
    }

    private static List<String> split(String csv) {
        return csv == null || csv.isBlank() ? List.of() : Arrays.stream(csv.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
    }

    private static void like(StringBuilder where, List<Object> args, String column, String value) {
        if (value == null || value.isBlank()) return;
        where.append(" and lower(").append(column).append(") like ?");
        args.add(Util.like(value));
    }

    private static String orderBy(String sortBy) {
        String column = "r.created_at";
        String dir = "desc";
        if (sortBy != null && !sortBy.isBlank()) {
            String[] parts = sortBy.split(",");
            column = SORT_COLUMNS.getOrDefault(parts[0].trim(), column);
            dir = parts.length > 1 && "desc".equalsIgnoreCase(parts[1].trim()) ? "desc" : parts.length > 1 ? "asc" : "desc";
        }
        return column + " " + dir + ", r.rohini_code asc";
    }
}
