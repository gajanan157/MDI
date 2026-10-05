package com.mdindia.enrollment.insurer.controller;

import com.mdindia.enrollment.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/** Insurer offices (head, regional, divisional, underwriting), their hierarchy and the people assigned to them. */
@RestController
@CrossOrigin(origins = "*")
public class InsurerOfficeController {

    private static final Set<String> TYPES = Set.of("HO", "RO", "DO", "UO", "OTHER");
    /** Which office types may sit directly above each type. */
    private static final Map<String, Set<String>> SUPERIORS = Map.of(
        "HO", Set.of(), "RO", Set.of("HO"), "DO", Set.of("RO"), "UO", Set.of("DO", "RO"));

    private final InsurerStore store;
    private final JdbcTemplate jdbc;

    InsurerOfficeController(InsurerStore store, JdbcTemplate jdbc) {
        this.store = store;
        this.jdbc = jdbc;
    }

    // ---- offices --------------------------------------------------------------------------------

    @GetMapping({"/v1/insurer/insurer-office", "/v1/insurer-office"})
    public ApiResponse<List<Map<String, Object>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String insurerId,
            @RequestParam(required = false) String officeCode,
            @RequestParam(required = false) String officeName,
            @RequestParam(required = false) String officeType,
            @RequestParam(required = false) String officeId,
            @RequestParam(required = false) String serviceType,
            @RequestParam(defaultValue = "false") boolean onlyNames) {

        StringBuilder where = new StringBuilder("where i.deleted = false");
        List<Object> args = new ArrayList<>();
        if (insurerId != null && !insurerId.isBlank()) { where.append(" and o.insurer_id = ?"); args.add(insurerId); }
        if (officeId != null && !officeId.isBlank()) { where.append(" and o.insurer_office_id = ?"); args.add(officeId); }
        if (officeType != null && !officeType.isBlank()) { where.append(" and upper(o.office_type) = ?"); args.add(officeType.trim().toUpperCase()); }
        if (officeCode != null && !officeCode.isBlank()) { where.append(" and lower(o.office_code) like ?"); args.add(Util.like(officeCode)); }
        if (officeName != null && !officeName.isBlank()) { where.append(" and lower(o.office_name) like ?"); args.add(Util.like(officeName)); }
        if (serviceType != null && !serviceType.isBlank()) { where.append(" and lower(o.service_types) like ?"); args.add(Util.like(serviceType)); }

        String from = "from insurer_offices o join insurers i on i.insurer_id = o.insurer_id left join insurer_offices s on s.insurer_office_id = o.superior_office_id ";
        if (onlyNames) {
            List<Map<String, Object>> names = jdbc.query("select o.insurer_office_id, o.office_name, o.office_code, o.office_type " + from + where + " order by o.office_code",
                (rs, n) -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("insurerOfficeId", rs.getString("insurer_office_id"));
                    m.put("id", rs.getString("insurer_office_id"));
                    m.put("officeName", rs.getString("office_name"));
                    m.put("name", rs.getString("office_name"));
                    m.put("officeCode", rs.getString("office_code"));
                    m.put("officeType", rs.getString("office_type"));
                    return m;
                }, args.toArray());
            return ApiResponse.ofList(names);
        }

        Long total = jdbc.queryForObject("select count(*) " + from + where, Long.class, args.toArray());
        int pageIndex = Math.max(page, 0);
        int pageSize = size > 0 ? Math.min(size, 1000) : 20;
        args.add(pageSize);
        args.add((long) pageIndex * pageSize);
        List<Map<String, Object>> rows = jdbc.query(InsurerStore.OFFICE_SELECT.replace("where", "") + where + " order by i.legal_name, o.office_code limit ? offset ?",
            (rs, n) -> store.office(rs, true), args.toArray());
        long totalRecords = total == null ? 0 : total;
        return ApiResponse.success(rows, totalRecords, (int) Math.ceil((double) totalRecords / pageSize), pageIndex, pageSize);
    }

    @GetMapping("/v1/insurer/insurer-office/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> get(@PathVariable String id) {
        return store.officeById(id, true)
            .map(o -> ResponseEntity.ok(ApiResponse.success(o)))
            .orElseGet(() -> Util.error(404, "Office not found"));
    }

    @PostMapping("/v1/insurer/{insurerId}/insurer-office")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(@PathVariable String insurerId, @RequestBody Map<String, Object> body) {
        if (!store.insurerExists(insurerId)) return Util.error(404, "Insurer not found");
        String type = Util.text(body, "officeType") == null ? "OTHER" : Util.text(body, "officeType").toUpperCase();
        String code = Util.text(body, "officeCode");
        String name = Util.text(body, "officeName");
        if (code == null || name == null) return Util.error(400, "officeCode and officeName are required");
        if (!TYPES.contains(type)) return Util.error(400, "officeType must be one of HO, RO, DO, UO, OTHER");
        if (count("select count(*) from insurer_offices where insurer_id = ? and lower(office_code) = lower(?)", insurerId, code) > 0) {
            return Util.error(409, "Office code '" + code + "' already exists for this insurer");
        }
        if ("HO".equals(type) && count("select count(*) from insurer_offices where insurer_id = ? and office_type = 'HO'", insurerId) > 0) {
            return Util.error(409, "This insurer already has a head office");
        }
        String superior = Util.text(body, "superiorOfficeId");
        ResponseEntity<ApiResponse<Map<String, Object>>> bad = checkSuperior(insurerId, type, superior, null);
        if (bad != null) return bad;

        String id = Util.id("OFF-");
        Map<String, Object> a = Util.map(body, "address");
        jdbc.update("insert into insurer_offices (insurer_office_id, insurer_id, office_code, office_name, office_type, superior_office_id, "
                + "underwriting_center, servicing_allocation_for, service_types, effective_from, effective_to, address_id, address_type, "
                + "address, city, state_name, postal_code, country_code, address_status) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            id, insurerId, code, name, type, superior, Boolean.TRUE.equals(Util.bool(body, "underwritingCenter")),
            Util.text(body, "servicingAllocationFor") == null ? "both" : Util.text(body, "servicingAllocationFor"),
            store.serviceTypesJson(body.get("serviceTypes")), Util.date(body.get("effectiveFrom")), Util.date(body.get("effectiveTo")),
            Util.id("adr-"), Util.text(a, "addressType") == null ? "both" : Util.text(a, "addressType"), Util.text(a, "address"), Util.text(a, "city"),
            Util.text(a, "stateName"), Util.text(a, "postalCode"), Util.text(a, "countryCode") == null ? "IN" : Util.text(a, "countryCode"), "ACTIVE");
        savePeople(insurerId, id, body);
        return ResponseEntity.ok(ApiResponse.success("Office created successfully", store.officeById(id, true).orElseThrow()));
    }

    @PatchMapping("/v1/insurer/insurer-office/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> update(@PathVariable String id, @RequestBody Map<String, Object> body) {
        Optional<Map<String, Object>> current = store.officeById(id, false);
        if (current.isEmpty()) return Util.error(404, "Office not found");
        String insurerId = (String) current.get().get("insurerId");

        String code = Util.text(body, "officeCode");
        if (code != null && count("select count(*) from insurer_offices where insurer_id = ? and lower(office_code) = lower(?) and insurer_office_id <> ?", insurerId, code, id) > 0) {
            return Util.error(409, "Office code '" + code + "' already exists for this insurer");
        }
        String type = Util.text(body, "officeType") == null ? null : Util.text(body, "officeType").toUpperCase();
        if (type != null && !TYPES.contains(type)) return Util.error(400, "officeType must be one of HO, RO, DO, UO, OTHER");
        String effectiveType = type != null ? type : (String) current.get().get("officeType");
        if (type != null && "HO".equals(type) && count("select count(*) from insurer_offices where insurer_id = ? and office_type = 'HO' and insurer_office_id <> ?", insurerId, id) > 0) {
            return Util.error(409, "This insurer already has a head office");
        }
        boolean superiorGiven = Util.has(body, "superiorOfficeId");
        String superior = superiorGiven ? Util.text(body, "superiorOfficeId") : (String) current.get().get("superiorOfficeId");
        if (superiorGiven || type != null) {
            ResponseEntity<ApiResponse<Map<String, Object>>> bad = checkSuperior(insurerId, effectiveType, superior, id);
            if (bad != null) return bad;
        }

        jdbc.update("update insurer_offices set office_code = coalesce(?, office_code), office_name = coalesce(?, office_name), "
                + "office_type = ?, superior_office_id = ?, underwriting_center = coalesce(?, underwriting_center), "
                + "servicing_allocation_for = coalesce(?, servicing_allocation_for), effective_from = coalesce(?, effective_from), "
                + "effective_to = coalesce(?, effective_to), active_flag = coalesce(?, active_flag), updated_at = now() where insurer_office_id = ?",
            code, Util.text(body, "officeName"), effectiveType, superior, Util.bool(body, "underwritingCenter"),
            Util.text(body, "servicingAllocationFor"), Util.date(body.get("effectiveFrom")), Util.date(body.get("effectiveTo")),
            Util.bool(body, "activeFlag"), id);
        if (Util.has(body, "serviceTypes")) {
            jdbc.update("update insurer_offices set service_types = ? where insurer_office_id = ?", store.serviceTypesJson(body.get("serviceTypes")), id);
        }
        Map<String, Object> a = Util.map(body, "address");
        if (a != null) {
            jdbc.update("update insurer_offices set address_type = coalesce(?, address_type), address = coalesce(?, address), city = coalesce(?, city), "
                    + "state_name = coalesce(?, state_name), postal_code = coalesce(?, postal_code), country_code = coalesce(?, country_code) "
                    + "where insurer_office_id = ?",
                Util.text(a, "addressType"), Util.text(a, "address"), Util.text(a, "city"), Util.text(a, "stateName"),
                Util.text(a, "postalCode"), Util.text(a, "countryCode"), id);
        }
        savePeople(insurerId, id, body);
        return ResponseEntity.ok(ApiResponse.success("Office updated successfully", store.officeById(id, true).orElseThrow()));
    }

    // ---- hierarchy ------------------------------------------------------------------------------

    /**
     * Offices of an insurer as a tree: {insurer, parentOffice: [head offices -> regionalOffices -> divisionalOffices
     * -> underwritingOffices]}. Offices with no superior start their own tree. Filters keep a branch when the office
     * or anything beneath it matches.
     */
    @GetMapping("/v1/insurer/insurer-office/hierarchy")
    public ApiResponse<Map<String, Object>> hierarchy(
            @RequestParam(required = false) String insurerId,
            @RequestParam(required = false) String officeName,
            @RequestParam(required = false) String officeCode,
            @RequestParam(required = false) String officeType,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String contactPerson,
            @RequestParam(required = false) String status) {

        boolean oneInsurer = insurerId != null && !insurerId.isBlank();
        List<Map<String, Object>> all = jdbc.query(InsurerStore.OFFICE_SELECT + "where i.deleted = false "
                + (oneInsurer ? "and o.insurer_id = ? " : "") + "order by o.office_code",
            (rs, n) -> store.office(rs, true), oneInsurer ? new Object[]{insurerId} : new Object[0]);

        Map<String, List<Map<String, Object>>> children = new HashMap<>();
        List<Map<String, Object>> roots = new ArrayList<>();
        for (Map<String, Object> o : all) {
            String sup = (String) o.get("superiorOfficeId");
            if (sup == null) roots.add(o); else children.computeIfAbsent(sup, k -> new ArrayList<>()).add(o);
        }

        Filter filter = new Filter(officeName, officeCode, officeType, location, contactPerson, status);
        List<Map<String, Object>> parentOffice = new ArrayList<>();
        for (Map<String, Object> root : roots) {
            Map<String, Object> node = build(root, children, filter, 0);
            if (node != null) parentOffice.add(node);
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("insurer", insurerId == null || insurerId.isBlank() ? null : store.insurerById(insurerId).orElse(null));
        data.put("parentOffice", parentOffice);
        return ApiResponse.success(data);
    }

    private Map<String, Object> build(Map<String, Object> office, Map<String, List<Map<String, Object>>> children, Filter filter, int depth) {
        String type = String.valueOf(office.get("officeType"));
        List<Map<String, Object>> kept = new ArrayList<>();
        for (Map<String, Object> child : children.getOrDefault((String) office.get("insurerOfficeId"), List.of())) {
            if (depth < 8) {
                Map<String, Object> node = build(child, children, filter, depth + 1);
                if (node != null) kept.add(node);
            }
        }
        if (!filter.matches(office) && kept.isEmpty()) return null;

        Map<String, Object> node = new LinkedHashMap<>();
        node.put("insurerOfficeId", office.get("insurerOfficeId"));
        node.put("insurerOfficeCode", office.get("officeCode"));
        node.put("insurerOfficeName", office.get("officeName"));
        node.put("insurerOfficeType", type);
        node.put("serviceAllocation", office.get("servicingAllocationFor"));
        node.put("serviceTypes", office.get("serviceTypes"));
        node.put("effectiveFrom", office.get("effectiveFrom"));
        node.put("effectiveTo", office.get("effectiveTo"));
        node.put("address", office.get("address"));
        node.put("assignments", office.get("assignments"));

        // Each level names its children differently. An underwriting office directly under a regional office
        // is shown under an unnamed divisional office, which the screen flattens.
        switch (type) {
            case "HO" -> node.put("regionalOffices", kept);
            case "RO" -> {
                List<Map<String, Object>> divisional = new ArrayList<>();
                List<Map<String, Object>> loose = new ArrayList<>();
                for (Map<String, Object> k : kept) {
                    if ("UO".equals(k.get("insurerOfficeType"))) loose.add(k); else divisional.add(k);
                }
                if (!loose.isEmpty()) {
                    Map<String, Object> placeholder = new LinkedHashMap<>();
                    placeholder.put("insurerOfficeId", null);
                    placeholder.put("insurerOfficeCode", null);
                    placeholder.put("insurerOfficeName", null);
                    placeholder.put("insurerOfficeType", "DO");
                    placeholder.put("serviceAllocation", "both");
                    placeholder.put("underwritingOffices", loose);
                    divisional.add(placeholder);
                }
                node.put("divisionalOffices", divisional);
            }
            case "DO" -> node.put("underwritingOffices", kept);
            default -> node.put("children", kept);
        }
        return node;
    }

    private record Filter(String name, String code, String type, String location, String person, String status) {
        boolean matches(Map<String, Object> o) {
            if (has(name) && !contains((String) o.get("officeName"), name)) return false;
            if (has(code) && !contains((String) o.get("officeCode"), code)) return false;
            if (has(type) && !type.equalsIgnoreCase(String.valueOf(o.get("officeType")))) return false;
            if (has(status)) {
                boolean active = Boolean.TRUE.equals(o.get("activeFlag"));
                if (!status.equalsIgnoreCase(active ? "active" : "inactive")) return false;
            }
            if (has(location)) {
                @SuppressWarnings("unchecked") Map<String, Object> a = (Map<String, Object>) o.get("address");
                if (!(contains((String) a.get("city"), location) || contains((String) a.get("stateName"), location)
                        || contains((String) a.get("address"), location))) return false;
            }
            if (has(person)) {
                @SuppressWarnings("unchecked") List<Map<String, Object>> as = (List<Map<String, Object>>) o.get("assignments");
                boolean any = as.stream().anyMatch(x -> {
                    @SuppressWarnings("unchecked") Map<String, Object> cp = (Map<String, Object>) x.get("contactPerson");
                    return contains((String) cp.get("fullName"), person);
                });
                if (!any) return false;
            }
            return true;
        }

        private static boolean has(String v) { return v != null && !v.isBlank(); }
        private static boolean contains(String hay, String needle) { return hay != null && hay.toLowerCase().contains(needle.trim().toLowerCase()); }
    }

    // ---- assignments ----------------------------------------------------------------------------

    /** Updates a person's role at an office and replaces their contact channels. */
    @PatchMapping("/v1/insurer-office/insurer-office-contact-assignment/{assignmentId}")
    @Transactional
    public ResponseEntity<ApiResponse<String>> updateAssignment(@PathVariable String assignmentId, @RequestBody Map<String, Object> body) {
        List<Map<String, Object>> found = jdbc.queryForList("select contact_person_id from contact_assignments where assignment_id = ?", assignmentId);
        if (found.isEmpty()) return Util.error(404, "Assignment not found");
        String personId = (String) found.get(0).get("contact_person_id");

        Integer priority = body.get("priorityRank") instanceof Number n ? Integer.valueOf(n.intValue()) : null;
        jdbc.update("update contact_assignments set designation = coalesce(?, designation), department = coalesce(?, department), "
                + "priority = coalesce(?, priority), status = coalesce(?, status) where assignment_id = ?",
            Util.text(body, "designation"), Util.text(body, "department"), priority, Util.text(body, "status"), assignmentId);
        if (body.get("contactChannels") instanceof List<?>) {
            store.saveChannels(personId, Util.list(body, "contactChannels"));
        }
        return ResponseEntity.ok(ApiResponse.success("Contact assignment updated successfully", assignmentId));
    }

    /** Moves a person to another office of the same insurer. */
    @PatchMapping("/v1/insurer-office/move-office-assignment/{assignmentId}")
    @Transactional
    public ResponseEntity<ApiResponse<String>> moveAssignment(@PathVariable String assignmentId, @RequestBody Map<String, Object> body) {
        String newOfficeId = Util.text(body, "newOfficeId");
        if (newOfficeId == null) return Util.error(400, "newOfficeId is required");
        List<Map<String, Object>> current = jdbc.queryForList(
            "select o.insurer_id from contact_assignments a join insurer_offices o on o.insurer_office_id = a.insurer_office_id where a.assignment_id = ?", assignmentId);
        if (current.isEmpty()) return Util.error(404, "Assignment not found");
        Integer sameInsurer = jdbc.queryForObject("select count(*) from insurer_offices where insurer_office_id = ? and insurer_id = ?", Integer.class,
            newOfficeId, current.get(0).get("insurer_id"));
        if (sameInsurer == null || sameInsurer == 0) return Util.error(400, "The new office must belong to the same insurer");
        jdbc.update("update contact_assignments set insurer_office_id = ? where assignment_id = ?", newOfficeId, assignmentId);
        return ResponseEntity.ok(ApiResponse.success("Contact moved to the new office", assignmentId));
    }

    /** isDomain=true lists domains; otherwise the roles of domainId (or of every domain). */
    @GetMapping("/v1/insurer-office/insurer-office-contact-assignment/contact-role-domain")
    public ApiResponse<List<Map<String, Object>>> roleDomain(@RequestParam(defaultValue = "false") boolean isDomain,
                                                              @RequestParam(required = false) String domainId) {
        if (isDomain) {
            return ApiResponse.ofList(jdbc.query("select distinct domain_id, domain_name from contact_roles order by domain_name",
                (rs, n) -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("domainId", rs.getString("domain_id"));
                    m.put("domainName", rs.getString("domain_name"));
                    return m;
                }));
        }
        String sql = "select * from contact_roles " + (domainId == null || domainId.isBlank() ? "" : "where domain_id = ? ") + "order by role_name";
        return ApiResponse.ofList(jdbc.query(sql, (rs, n) -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("domainId", rs.getString("domain_id"));
            m.put("domainName", rs.getString("domain_name"));
            m.put("roleId", rs.getString("role_id"));
            m.put("roleName", rs.getString("role_name"));
            return m;
        }, domainId == null || domainId.isBlank() ? new Object[0] : new Object[]{domainId}));
    }

    // ---------------------------------------------------------------------------------------------

    private void savePeople(String insurerId, String officeId, Map<String, Object> body) {
        for (Map<String, Object> person : Util.list(body, "contactPersonRequestList")) {
            if (InsurerStore.hasPerson(person)) store.savePerson(insurerId, officeId, person);
        }
    }

    /** Returns an error response when the chosen superior office is not allowed above this type, else null. */
    private ResponseEntity<ApiResponse<Map<String, Object>>> checkSuperior(String insurerId, String type, String superiorId, String selfId) {
        if (superiorId == null) return null;
        if (superiorId.equals(selfId)) return Util.error(400, "An office cannot report to itself");
        List<Map<String, Object>> sup = jdbc.queryForList("select insurer_id, office_type from insurer_offices where insurer_office_id = ?", superiorId);
        if (sup.isEmpty()) return Util.error(400, "Superior office not found");
        if (!insurerId.equals(sup.get(0).get("insurer_id"))) return Util.error(400, "The superior office must belong to the same insurer");
        Set<String> allowed = SUPERIORS.get(type);
        if (allowed != null && !allowed.contains(String.valueOf(sup.get(0).get("office_type")))) {
            return Util.error(400, type + " offices must report to " + (allowed.isEmpty() ? "no one (head office)" : String.join(" or ", allowed)));
        }
        return null;
    }

    private int count(String sql, Object... args) {
        Integer n = jdbc.queryForObject(sql, Integer.class, args);
        return n == null ? 0 : n;
    }
}
