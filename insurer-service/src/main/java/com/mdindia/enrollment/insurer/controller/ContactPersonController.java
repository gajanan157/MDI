package com.mdindia.enrollment.insurer.controller;

import com.mdindia.enrollment.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/v1/insurer")
@CrossOrigin(origins = "*")
public class ContactPersonController {

    private final InsurerStore store;
    private final JdbcTemplate jdbc;

    ContactPersonController(InsurerStore store, JdbcTemplate jdbc) {
        this.store = store;
        this.jdbc = jdbc;
    }

    /** People of one insurer or all insurers; searchText matches the person's name. Paging is 0-based. */
    @GetMapping("/contact-person")
    public ApiResponse<List<Map<String, Object>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String insurerId,
            @RequestParam(required = false) String searchText,
            @RequestParam(required = false) String fullName,
            @RequestParam(required = false) String gender) {

        StringBuilder where = new StringBuilder("where p.deleted = false and i.deleted = false");
        List<Object> args = new ArrayList<>();
        if (insurerId != null && !insurerId.isBlank()) { where.append(" and p.insurer_id = ?"); args.add(insurerId); }
        String text = searchText != null && !searchText.isBlank() ? searchText : fullName;
        if (text != null && !text.isBlank()) { where.append(" and lower(p.full_name) like ?"); args.add(Util.like(text)); }
        if (gender != null && !gender.isBlank()) { where.append(" and lower(p.gender) = ?"); args.add(gender.trim().toLowerCase()); }

        String from = "from contact_persons p join insurers i on i.insurer_id = p.insurer_id ";
        Long total = jdbc.queryForObject("select count(*) " + from + where, Long.class, args.toArray());
        int pageIndex = Math.max(page, 0);
        int pageSize = size > 0 ? Math.min(size, 1000) : 20;
        args.add(pageSize);
        args.add((long) pageIndex * pageSize);
        List<Map<String, Object>> rows = jdbc.query("select p.*, i.legal_name as insurer_legal_name " + from + where
                + " order by p.full_name limit ? offset ?", (rs, n) -> {
            Map<String, Object> m = store.person(rs);
            m.put("insurerLegalName", rs.getString("insurer_legal_name"));
            return m;
        }, args.toArray());
        rows.forEach(this::addDetails);
        long totalRecords = total == null ? 0 : total;
        return ApiResponse.success(rows, totalRecords, (int) Math.ceil((double) totalRecords / pageSize), pageIndex, pageSize);
    }

    @GetMapping("/contact-person/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> get(@PathVariable String id) {
        List<Map<String, Object>> rows = jdbc.query("select p.*, i.legal_name as insurer_legal_name from contact_persons p "
                + "join insurers i on i.insurer_id = p.insurer_id where p.contact_person_id = ? and p.deleted = false", (rs, n) -> {
            Map<String, Object> m = store.person(rs);
            m.put("insurerLegalName", rs.getString("insurer_legal_name"));
            return m;
        }, id);
        if (rows.isEmpty()) return Util.error(404, "Contact person not found");
        addDetails(rows.get(0));
        return ResponseEntity.ok(ApiResponse.success(rows.get(0)));
    }

    /** The screens send an array of people; a single object is accepted too. */
    @PostMapping("/{insurerId}/contact-person")
    @Transactional
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> create(@PathVariable String insurerId, @RequestBody Object body) {
        if (!store.insurerExists(insurerId)) return Util.error(404, "Insurer not found");
        List<Map<String, Object>> items = items(body);
        if (items.isEmpty()) return Util.error(400, "At least one contact person is required");

        List<Map<String, Object>> created = new ArrayList<>();
        for (Map<String, Object> item : items) {
            if (!InsurerStore.hasPerson(item)) return Util.error(400, "firstName or fullName is required");
            Map<String, Object> copy = new LinkedHashMap<>(item);
            copy.remove("contactPersonId");
            String id = store.savePerson(insurerId, null, copy);
            created.add(Map.of("contactPersonId", id, "id", id, "fullName", copy.getOrDefault("fullName", "")));
        }
        return ResponseEntity.ok(ApiResponse.success("Contact person created successfully", created));
    }

    @PatchMapping("/contact-person/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> update(@PathVariable String id, @RequestBody Object body) {
        List<String> insurer = jdbc.queryForList("select insurer_id from contact_persons where contact_person_id = ? and deleted = false", String.class, id);
        if (insurer.isEmpty()) return Util.error(404, "Contact person not found");
        List<Map<String, Object>> items = items(body);
        if (items.isEmpty()) return Util.error(400, "Nothing to update");

        Map<String, Object> item = new LinkedHashMap<>(items.get(0));
        item.put("contactPersonId", id);
        store.savePerson(insurer.get(0), null, item);
        return get(id);
    }

    @DeleteMapping("/contact-person/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        int updated = jdbc.update("update contact_persons set deleted = true, updated_at = now() where contact_person_id = ? and deleted = false", id);
        if (updated == 0) return Util.error(404, "Contact person not found");
        jdbc.update("delete from contact_assignments where contact_person_id = ?", id);
        return Util.deleted("Contact person deleted successfully");
    }

    // ---------------------------------------------------------------------------------------------

    /** Adds channels and the first office assignment, which the list screen shows in the same row. */
    private void addDetails(Map<String, Object> person) {
        String id = (String) person.get("contactPersonId");
        person.put("channels", store.channels(id).stream()
            .map(c -> Map.of("type", c.get("type"), "value", c.get("value"))).toList());
        List<Map<String, Object>> first = jdbc.query(
            "select a.*, o.office_code, o.office_name from contact_assignments a join insurer_offices o on o.insurer_office_id = a.insurer_office_id "
                + "where a.contact_person_id = ? order by a.priority nulls last limit 1", (rs, n) -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("assignmentId", rs.getString("assignment_id"));
                m.put("designation", rs.getString("designation"));
                m.put("department", rs.getString("department"));
                m.put("priority", rs.getObject("priority") == null ? null : String.valueOf(rs.getObject("priority")));
                m.put("officeCode", rs.getString("office_code"));
                m.put("officeName", rs.getString("office_name"));
                return m;
            }, id);
        person.putAll(first.isEmpty() ? Map.of() : first.get(0));
    }

    @SuppressWarnings("unchecked")
    private static List<Map<String, Object>> items(Object body) {
        List<Map<String, Object>> out = new ArrayList<>();
        if (body instanceof List<?> l) {
            for (Object o : l) if (o instanceof Map<?, ?> m) out.add((Map<String, Object>) m);
        } else if (body instanceof Map<?, ?> m) {
            out.add((Map<String, Object>) m);
        }
        return out;
    }
}
