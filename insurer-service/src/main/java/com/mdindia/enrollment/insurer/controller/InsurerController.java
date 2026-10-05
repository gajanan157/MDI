package com.mdindia.enrollment.insurer.controller;

import com.mdindia.enrollment.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping({"/v1/insurer", "/v1/insurers"})
@CrossOrigin(origins = "*")
public class InsurerController {

    private static final Set<String> TYPES = Set.of("PSU", "PRIVATE");
    private static final Map<String, String> SORT_COLUMNS = Map.of(
        "legalName", "i.legal_name", "name", "i.legal_name", "insurerCode", "i.insurer_code", "code", "i.insurer_code",
        "insurerType", "i.insurer_type", "irdaiInsurerCode", "i.irdai_insurer_code", "createdAt", "i.created_at");

    private final InsurerStore store;
    private final JdbcTemplate jdbc;

    InsurerController(InsurerStore store, JdbcTemplate jdbc) {
        this.store = store;
        this.jdbc = jdbc;
    }

    /**
     * Search with 0-based paging. Filters: legalName, irdaiInsurerCode (or irdaiCode), insurerType, brandName,
     * insurerCode. sortBy is a field name, optionally followed by ",desc".
     */
    @GetMapping
    public ApiResponse<List<Map<String, Object>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String legalName,
            @RequestParam(required = false) String irdaiInsurerCode,
            @RequestParam(required = false) String irdaiCode,
            @RequestParam(required = false) String insurerType,
            @RequestParam(required = false) String brandName,
            @RequestParam(required = false) String insurerCode,
            @RequestParam(required = false) String sortBy) {

        StringBuilder where = new StringBuilder("where i.deleted = false");
        List<Object> args = new ArrayList<>();
        addLike(where, args, "i.legal_name", legalName);
        addLike(where, args, "i.irdai_insurer_code", irdaiInsurerCode != null ? irdaiInsurerCode : irdaiCode);
        addLike(where, args, "i.brand_name", brandName);
        addLike(where, args, "i.insurer_code", insurerCode);
        if (insurerType != null && !insurerType.isBlank()) {
            where.append(" and upper(i.insurer_type) = ?");
            args.add(insurerType.trim().toUpperCase());
        }

        Long total = jdbc.queryForObject("select count(*) from insurers i " + where, Long.class, args.toArray());
        int pageIndex = Math.max(page, 0);
        int pageSize = size > 0 ? Math.min(size, 1000) : 20;
        args.add(pageSize);
        args.add((long) pageIndex * pageSize);
        List<Map<String, Object>> rows = jdbc.query(
            InsurerStore.INSURER_SELECT + where + " order by " + orderBy(sortBy) + " limit ? offset ?",
            (rs, n) -> store.insurer(rs), args.toArray());
        long totalRecords = total == null ? 0 : total;
        return ApiResponse.success(rows, totalRecords, (int) Math.ceil((double) totalRecords / pageSize), pageIndex, pageSize);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> get(@PathVariable String id) {
        return store.insurerById(id)
            .map(i -> ResponseEntity.ok(ApiResponse.success(i)))
            .orElseGet(() -> Util.error(404, "Insurer not found"));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(@RequestBody Map<String, Object> body) {
        String legalName = Util.text(body, "legalName");
        String code = Util.text(body, "insurerCode");
        String type = Util.text(body, "insurerType") == null ? null : Util.text(body, "insurerType").toUpperCase();
        if (legalName == null || code == null || type == null) {
            return Util.error(400, "legalName, insurerCode and insurerType are required");
        }
        if (!TYPES.contains(type)) return Util.error(400, "insurerType must be PSU or PRIVATE");
        if (exists("select count(*) from insurers where lower(insurer_code) = lower(?) and deleted = false", code)) {
            return Util.error(409, "An insurer with code '" + code + "' already exists");
        }
        Map<String, Object> headOffice = Util.map(body, "insurerOffice");
        String officeCode = Util.text(headOffice, "officeCode");

        String id = nextId();
        Map<String, Object> a = Util.map(body, "address");
        jdbc.update("insert into insurers (insurer_id, legal_name, insurer_code, insurer_type, irdai_insurer_code, brand_name, description, "
                + "contact_email, contact_phone, pan, gstin, abdm_empanelled, address_id, address, city, state_name, postal_code, "
                + "country_code, address_status, address_use) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            id, legalName, code, type, Util.text(body, "irdaiInsurerCode"), Util.text(body, "brandName"), Util.text(body, "description"),
            Util.text(body, "contactEmail"), Util.text(body, "contactPhone"), Util.text(body, "pan"), Util.text(body, "gstin"),
            Boolean.TRUE.equals(Util.bool(body, "abdmEmpanelledFlag")), Util.id("adr-"), Util.text(a, "address"), Util.text(a, "city"),
            Util.text(a, "stateName"), Util.text(a, "postalCode"), a != null && Util.text(a, "countryCode") != null ? Util.text(a, "countryCode") : "IN",
            "ACTIVE", "registered");

        String headOfficeId = null;
        if (officeCode != null) {
            headOfficeId = Util.id("OFF-");
            jdbc.update("insert into insurer_offices (insurer_office_id, insurer_id, office_code, office_name, office_type, effective_from, "
                    + "effective_to, address_id, address_type, address, city, state_name, postal_code, country_code, address_status) "
                    + "values (?,?,?,?,'HO',current_date,date '2099-12-31',?,?,?,?,?,?,'IN','ACTIVE')",
                headOfficeId, id, officeCode, legalName + " Head Office", Util.id("adr-"), "both", Util.text(a, "address"),
                Util.text(a, "city"), Util.text(a, "stateName"), Util.text(a, "postalCode"));
        }
        for (Map<String, Object> person : Util.list(body, "assignments")) {
            if (InsurerStore.hasPerson(person)) store.savePerson(id, headOfficeId, person);
        }
        saveAgreements(id, body);
        return ResponseEntity.ok(ApiResponse.success("Insurer created successfully", store.insurerById(id).orElseThrow()));
    }

    @PatchMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> update(@PathVariable String id, @RequestBody Map<String, Object> body) {
        if (!store.insurerExists(id)) return Util.error(404, "Insurer not found");

        String code = Util.text(body, "insurerCode");
        if (code != null && exists("select count(*) from insurers where lower(insurer_code) = lower(?) and deleted = false and insurer_id <> ?", code, id)) {
            return Util.error(409, "An insurer with code '" + code + "' already exists");
        }
        String type = Util.text(body, "insurerType");
        if (type != null && !TYPES.contains(type.toUpperCase())) return Util.error(400, "insurerType must be PSU or PRIVATE");

        jdbc.update("update insurers set legal_name = coalesce(?, legal_name), insurer_code = coalesce(?, insurer_code), "
                + "insurer_type = coalesce(?, insurer_type), irdai_insurer_code = coalesce(?, irdai_insurer_code), "
                + "brand_name = coalesce(?, brand_name), description = coalesce(?, description), contact_email = coalesce(?, contact_email), "
                + "contact_phone = coalesce(?, contact_phone), pan = coalesce(?, pan), gstin = coalesce(?, gstin), "
                + "abdm_empanelled = coalesce(?, abdm_empanelled), is_active = coalesce(?, is_active), updated_at = now() where insurer_id = ?",
            Util.text(body, "legalName"), code, type == null ? null : type.toUpperCase(), Util.text(body, "irdaiInsurerCode"),
            Util.text(body, "brandName"), Util.text(body, "description"), Util.text(body, "contactEmail"), Util.text(body, "contactPhone"),
            Util.text(body, "pan"), Util.text(body, "gstin"), Util.bool(body, "abdmEmpanelledFlag"), Util.bool(body, "isActive"), id);

        Map<String, Object> a = Util.map(body, "address");
        if (a != null) {
            jdbc.update("update insurers set address = coalesce(?, address), city = coalesce(?, city), state_name = coalesce(?, state_name), "
                    + "postal_code = coalesce(?, postal_code) where insurer_id = ?",
                Util.text(a, "address"), Util.text(a, "city"), Util.text(a, "stateName"), Util.text(a, "postalCode"), id);
        }
        String officeCode = Util.text(Util.map(body, "insurerOffice"), "officeCode");
        if (officeCode != null) {
            if (exists("select count(*) from insurer_offices where insurer_id = ? and office_code = ? and office_type <> 'HO'", id, officeCode)) {
                return Util.error(409, "Office code '" + officeCode + "' is already used by another office");
            }
            jdbc.update("update insurer_offices set office_code = ? where insurer_id = ? and office_type = 'HO'", officeCode, id);
        }
        saveAgreements(id, body);
        return ResponseEntity.ok(ApiResponse.success("Insurer updated successfully", store.insurerById(id).orElseThrow()));
    }

    /** Hides the insurer. The row stays so policies that point at it keep working. */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        if (!store.insurerExists(id)) return Util.error(404, "Insurer not found");
        jdbc.update("update insurers set deleted = true, is_active = false, updated_at = now() where insurer_id = ?", id);
        return Util.deleted("Insurer deleted successfully");
    }

    // ---- lookups used by the enrollment screens -------------------------------------------------

    /** Underwriting (issuing) offices of an insurer; falls back to all offices when there are none. */
    @GetMapping("/{id}/uo-offices")
    public ApiResponse<List<Map<String, Object>>> underwritingOffices(@PathVariable String id) {
        List<Map<String, Object>> rows = offices(id, "UO");
        if (rows.isEmpty()) rows = offices(id, null);
        return ApiResponse.ofList(rows);
    }

    /**
     * Head and divisional office above an underwriting office (insurerOfficeId); the screens read hoOffice and
     * doOffice from the top level of the body, the same objects are also repeated under data.
     */
    @GetMapping("/hierarchy")
    public ResponseEntity<Map<String, Object>> hierarchy(@RequestParam String insurerId,
                                                         @RequestParam(required = false) String insurerOfficeId) {
        Map<String, Object> ho = null, ro = null, dOffice = null;
        String cursor = insurerOfficeId;
        int guard = 0;
        while (cursor != null && guard++ < 10) {
            Optional<Map<String, Object>> o = store.officeById(cursor, false);
            if (o.isEmpty()) break;
            Map<String, Object> view = brief(o.get());
            switch (String.valueOf(o.get().get("officeType"))) {
                case "HO" -> ho = view;
                case "RO" -> ro = view;
                case "DO" -> dOffice = view;
                default -> { }
            }
            cursor = (String) o.get().get("superiorOfficeId");
        }
        if (ho == null) {
            ho = offices(insurerId, "HO").stream().findFirst().orElse(null);
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("insurerId", insurerId);
        data.put("hoOffice", ho);
        data.put("roOffice", ro);
        data.put("doOffice", dOffice);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("status", 200);
        body.put("message", "Operation successful");
        body.put("hoOffice", ho);
        body.put("roOffice", ro);
        body.put("doOffice", dOffice);
        body.put("data", data);
        return ResponseEntity.ok(body);
    }

    // ---------------------------------------------------------------------------------------------

    private List<Map<String, Object>> offices(String insurerId, String type) {
        return jdbc.query("select * from insurer_offices where insurer_id = ? " + (type == null ? "" : "and office_type = ? ") + "order by office_code",
            (rs, n) -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("officeId", rs.getString("insurer_office_id"));
                m.put("insurerOfficeId", rs.getString("insurer_office_id"));
                m.put("insurerId", rs.getString("insurer_id"));
                m.put("officeCode", rs.getString("office_code"));
                m.put("officeName", rs.getString("office_name"));
                m.put("officeType", rs.getString("office_type"));
                m.put("city", rs.getString("city"));
                m.put("state", rs.getString("state_name"));
                return m;
            }, type == null ? new Object[]{insurerId} : new Object[]{insurerId, type});
    }

    private static Map<String, Object> brief(Map<String, Object> office) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("officeId", office.get("insurerOfficeId"));
        m.put("insurerOfficeId", office.get("insurerOfficeId"));
        m.put("officeCode", office.get("officeCode"));
        m.put("officeName", office.get("officeName"));
        m.put("officeType", office.get("officeType"));
        return m;
    }

    private void saveAgreements(String insurerId, Map<String, Object> body) {
        for (Map<String, Object> a : Util.list(body, "masterAgreements")) {
            jdbc.update("insert into master_agreements (insurer_id, start_date, end_date, signed_by_tpa, signed_by_insurer, file_metadata_id, effective_period) "
                    + "values (?,?,?,?,?,?,?)",
                insurerId, Util.date(a.get("startDate")), Util.date(a.get("endDate")), Boolean.TRUE.equals(Util.bool(a, "signedByTpa")),
                Boolean.TRUE.equals(Util.bool(a, "signedByInsurer")), Util.text(a, "fileMetadataId"), Util.text(a, "effectivePeriod"));
        }
    }

    private String nextId() {
        int max = jdbc.queryForList("select insurer_id from insurers", String.class).stream()
            .filter(s -> s.matches("INS-\\d+")).mapToInt(s -> Integer.parseInt(s.substring(4))).max().orElse(0);
        return String.format("INS-%03d", max + 1);
    }

    private boolean exists(String sql, Object... args) {
        Integer n = jdbc.queryForObject(sql, Integer.class, args);
        return n != null && n > 0;
    }

    private static void addLike(StringBuilder where, List<Object> args, String column, String value) {
        if (value == null || value.isBlank()) return;
        where.append(" and lower(").append(column).append(") like ?");
        args.add(Util.like(value));
    }

    private static String orderBy(String sortBy) {
        String column = "i.legal_name";
        String dir = "asc";
        if (sortBy != null && !sortBy.isBlank()) {
            String[] parts = sortBy.split(",");
            column = SORT_COLUMNS.getOrDefault(parts[0].trim(), column);
            if (parts.length > 1 && "desc".equalsIgnoreCase(parts[1].trim())) dir = "desc";
        }
        return column + " " + dir;
    }
}
