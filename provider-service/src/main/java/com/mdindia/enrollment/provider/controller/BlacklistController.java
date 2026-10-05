package com.mdindia.enrollment.provider.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

/** Excluded (blacklisted) and watchlisted providers. */
@RestController
@RequestMapping("/v1/Provider-Blacklist")
@CrossOrigin(origins = "*")
public class BlacklistController {

    private static final String EXCLUSION = "PROVIDER_EXCLUSION_RECORDS";
    private static final Map<String, String> SORT_COLUMNS = Map.of(
        "providerName", "b.provider_name", "effectiveFrom", "b.effective_from", "createdAt", "b.created_at",
        "state", "b.provider_state", "city", "b.provider_city", "insurerName", "b.insurer_name");

    private final JdbcTemplate jdbc;

    BlacklistController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * Excluded providers with filters and 1-based paging. Only exclusion records are listed unless
     * restrictionType says otherwise (use WATCHLIST or ALL).
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String providerName,
            @RequestParam(required = false) String insurerId,
            @RequestParam(required = false) String providerBlacklistSource,
            @RequestParam(required = false) String providerMatchingStatus,
            @RequestParam(required = false) String stateName,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String pincode,
            @RequestParam(required = false) String restrictionType,
            @RequestParam(defaultValue = "false") boolean download,
            @RequestParam(required = false) String sortBy) {

        if (download) {
            return ResponseEntity.status(501).body(Map.of("success", false, "status", 501, "message", "Excel download is not available yet"));
        }

        StringBuilder where = new StringBuilder("where b.record_status = 'Active'");
        List<Object> args = new ArrayList<>();
        String type = restrictionType == null || restrictionType.isBlank() ? EXCLUSION : restrictionType.trim().toUpperCase();
        if ("WATCHLIST".equals(type)) type = "PROVIDER_WATCHLIST_RECORDS";
        if (!"ALL".equals(type)) { where.append(" and b.restriction_type = ?"); args.add(type); }
        like(where, args, "b.provider_name", providerName);
        like(where, args, "b.provider_state", stateName);
        like(where, args, "b.provider_district", district);
        like(where, args, "b.provider_city", city);
        like(where, args, "b.provider_pincode", pincode);
        if (insurerId != null && !insurerId.isBlank()) { where.append(" and b.insurer_id = ?"); args.add(insurerId.trim()); }
        if (providerBlacklistSource != null && !providerBlacklistSource.isBlank()) {
            where.append(" and b.blacklist_source = ?");
            args.add(providerBlacklistSource.trim().toUpperCase());
        }
        if (providerMatchingStatus != null && !providerMatchingStatus.isBlank()) {
            where.append(" and b.matching_status = ?");
            args.add(providerMatchingStatus.trim().toUpperCase());
        }

        String from = "from provider_blacklist b left join providers p on p.provider_id = b.provider_id ";
        Long total = jdbc.queryForObject("select count(*) " + from + where, Long.class, args.toArray());
        int pageSize = size > 0 ? Math.min(size, 1000) : 20;
        int pageNo = Math.max(page, 1);
        args.add(pageSize);
        args.add((long) (pageNo - 1) * pageSize);
        List<Map<String, Object>> rows = jdbc.query("select b.*, p.provider_code " + from + where + " order by " + orderBy(sortBy) + " limit ? offset ?",
            (rs, n) -> row(rs), args.toArray());

        long totalRecords = total == null ? 0 : total;
        Map<String, Object> pagination = new LinkedHashMap<>();
        pagination.put("totalRecords", totalRecords);
        pagination.put("totalPages", (int) Math.ceil((double) totalRecords / pageSize));
        pagination.put("currentPage", pageNo);
        pagination.put("pageSize", pageSize);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("status", 200);
        body.put("message", "Operation successful");
        body.put("data", rows);
        body.put("pagination", pagination);
        return ResponseEntity.ok(body);
    }

    private Map<String, Object> row(ResultSet rs) throws SQLException {
        Map<String, Object> m = new LinkedHashMap<>();
        String id = rs.getString("provider_blacklist_id");
        m.put("id", id);
        m.put("providerBlacklistMasterId", id);
        m.put("providerId", rs.getString("provider_id"));
        m.put("providerName", rs.getString("provider_name"));
        m.put("providerCode", rs.getString("provider_code"));
        m.put("providerIibRohiniCode", rs.getString("provider_iib_rohini_code"));
        m.put("insurerId", rs.getString("insurer_id"));
        m.put("insurerName", rs.getString("insurer_name"));
        m.put("providerBlacklistSource", rs.getString("blacklist_source"));
        m.put("providerMatchingStatus", rs.getString("matching_status"));
        m.put("restrictionType", rs.getString("restriction_type"));
        m.put("providerRestrictionApplicableFor", rs.getString("restriction_applicable_for"));
        m.put("providerAddress", rs.getString("provider_address"));
        m.put("providerCity", rs.getString("provider_city"));
        m.put("providerDistrict", rs.getString("provider_district"));
        m.put("providerState", rs.getString("provider_state"));
        m.put("providerPincode", rs.getString("provider_pincode"));
        m.put("providerBlacklistStartDate", date(rs, "effective_from"));
        m.put("providerBlacklistEffectiveFrom", date(rs, "effective_from"));
        m.put("providerBlacklistEffectiveTo", date(rs, "effective_to"));
        m.put("providerStatusReason", rs.getString("status_reason"));
        m.put("providerBlacklistReasonDescription", rs.getString("status_reason"));
        m.put("providerBlacklistStatus", rs.getString("record_status"));
        m.put("investigationRequiredFlag", rs.getBoolean("investigation_required_flag"));
        m.put("emergencyExceptionAllowedFlag", rs.getBoolean("emergency_exception_allowed_flag"));
        m.put("remark", rs.getString("remark"));
        return m;
    }

    private static String date(ResultSet rs, String column) throws SQLException {
        return rs.getDate(column) == null ? null : rs.getDate(column).toString();
    }

    private static void like(StringBuilder where, List<Object> args, String column, String value) {
        if (value == null || value.isBlank()) return;
        where.append(" and lower(").append(column).append(") like ?");
        args.add(Util.like(value));
    }

    private static String orderBy(String sortBy) {
        String column = "b.effective_from";
        String dir = "desc";
        if (sortBy != null && !sortBy.isBlank()) {
            String[] parts = sortBy.split(",");
            column = SORT_COLUMNS.getOrDefault(parts[0].trim(), column);
            dir = parts.length > 1 && "asc".equalsIgnoreCase(parts[1].trim()) ? "asc" : parts.length > 1 ? "desc" : "asc";
        }
        return column + " " + dir + " nulls last";
    }
}
