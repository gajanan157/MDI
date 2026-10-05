package com.mdindia.enrollment.insurer.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

/** Queries and row shapes shared by the insurer, office and contact person controllers. */
@Component
class InsurerStore {

    static final String INSURER_SELECT =
        "select i.*, "
            + "(select o.insurer_office_id from insurer_offices o where o.insurer_id = i.insurer_id and o.office_type = 'HO' limit 1) as head_office_id, "
            + "(select o.office_code from insurer_offices o where o.insurer_id = i.insurer_id and o.office_type = 'HO' limit 1) as head_office_code "
            + "from insurers i ";

    final JdbcTemplate jdbc;
    private final ObjectMapper json;

    InsurerStore(JdbcTemplate jdbc, ObjectMapper json) {
        this.jdbc = jdbc;
        this.json = json;
    }

    // ---- insurers -------------------------------------------------------------------------------

    /** The shape the screens read; id/name duplicate insurerId/insurerName for the enrollment dropdowns. */
    Map<String, Object> insurer(ResultSet rs) throws SQLException {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", rs.getString("insurer_id"));
        m.put("insurerId", rs.getString("insurer_id"));
        m.put("name", rs.getString("legal_name"));
        m.put("insurerName", rs.getString("legal_name"));
        m.put("legalName", rs.getString("legal_name"));
        m.put("code", rs.getString("insurer_code"));
        m.put("insurerCode", rs.getString("insurer_code"));
        m.put("insurerType", rs.getString("insurer_type"));
        m.put("irdaiInsurerCode", rs.getString("irdai_insurer_code"));
        m.put("brandName", rs.getString("brand_name"));
        m.put("description", rs.getString("description"));
        m.put("contactEmail", rs.getString("contact_email"));
        m.put("contactPhone", rs.getString("contact_phone"));
        m.put("pan", rs.getString("pan"));
        m.put("gstin", rs.getString("gstin"));
        m.put("abdmEmpanelledFlag", rs.getBoolean("abdm_empanelled"));
        m.put("isActive", rs.getBoolean("is_active"));
        m.put("status", rs.getBoolean("is_active") ? "ACTIVE" : "INACTIVE");
        m.put("officeId", rs.getString("head_office_id"));
        m.put("officeCode", rs.getString("head_office_code"));
        m.put("createdAt", String.valueOf(rs.getTimestamp("created_at")));
        m.put("updatedAt", String.valueOf(rs.getTimestamp("updated_at")));
        Map<String, Object> a = new LinkedHashMap<>();
        a.put("addressId", rs.getString("address_id"));
        a.put("address", rs.getString("address"));
        a.put("city", rs.getString("city"));
        a.put("stateName", rs.getString("state_name"));
        a.put("postalCode", rs.getString("postal_code"));
        a.put("countryCode", rs.getString("country_code"));
        a.put("addressStatus", rs.getString("address_status"));
        a.put("addressUse", rs.getString("address_use"));
        m.put("address", a);
        return m;
    }

    Optional<Map<String, Object>> insurerById(String id) {
        List<Map<String, Object>> rows = jdbc.query(INSURER_SELECT + "where i.insurer_id = ? and i.deleted = false",
            (rs, n) -> insurer(rs), id);
        return rows.stream().findFirst();
    }

    boolean insurerExists(String id) {
        Integer n = jdbc.queryForObject("select count(*) from insurers where insurer_id = ? and deleted = false", Integer.class, id);
        return n != null && n > 0;
    }

    // ---- offices --------------------------------------------------------------------------------

    static final String OFFICE_SELECT =
        "select o.*, i.legal_name as insurer_name, s.office_code as sup_code, s.office_name as sup_name, s.office_type as sup_type "
            + "from insurer_offices o join insurers i on i.insurer_id = o.insurer_id "
            + "left join insurer_offices s on s.insurer_office_id = o.superior_office_id ";

    Map<String, Object> office(ResultSet rs, boolean withAssignments) throws SQLException {
        String id = rs.getString("insurer_office_id");
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("insurerOfficeId", id);
        m.put("officeId", id);
        m.put("insurerId", rs.getString("insurer_id"));
        m.put("insurerName", rs.getString("insurer_name"));
        m.put("officeCode", rs.getString("office_code"));
        m.put("officeName", rs.getString("office_name"));
        m.put("officeType", rs.getString("office_type"));
        m.put("superiorOfficeId", rs.getString("superior_office_id"));
        if (rs.getString("superior_office_id") != null) {
            Map<String, Object> sup = new LinkedHashMap<>();
            sup.put("insurerOfficeId", rs.getString("superior_office_id"));
            sup.put("officeCode", rs.getString("sup_code"));
            sup.put("officeName", rs.getString("sup_name"));
            sup.put("officeType", rs.getString("sup_type"));
            m.put("superiorInsurerOffice", sup);
        } else {
            m.put("superiorInsurerOffice", null);
        }
        m.put("underwritingCenter", rs.getBoolean("underwriting_center"));
        m.put("servicingAllocationFor", rs.getString("servicing_allocation_for"));
        m.put("serviceTypes", serviceTypes(rs.getString("service_types")));
        m.put("effectiveFrom", rs.getDate("effective_from") == null ? null : rs.getDate("effective_from").toString());
        m.put("effectiveTo", rs.getDate("effective_to") == null ? null : rs.getDate("effective_to").toString());
        m.put("activeFlag", rs.getBoolean("active_flag"));
        m.put("address", officeAddress(rs));
        if (withAssignments) m.put("assignments", assignments(id));
        return m;
    }

    Map<String, Object> officeAddress(ResultSet rs) throws SQLException {
        Map<String, Object> a = new LinkedHashMap<>();
        a.put("addressId", rs.getString("address_id"));
        a.put("addressType", rs.getString("address_type"));
        a.put("address", rs.getString("address"));
        a.put("city", rs.getString("city"));
        a.put("stateName", rs.getString("state_name"));
        a.put("postalCode", rs.getString("postal_code"));
        a.put("countryCode", rs.getString("country_code"));
        a.put("addressStatus", rs.getString("address_status"));
        return a;
    }

    List<Object> serviceTypes(String raw) {
        if (raw == null || raw.isBlank()) return List.of();
        try {
            return json.readValue(raw, new TypeReference<List<Object>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    String serviceTypesJson(Object value) {
        try {
            return value == null ? "[]" : json.writeValueAsString(value);
        } catch (Exception e) {
            return "[]";
        }
    }

    Optional<Map<String, Object>> officeById(String id, boolean withAssignments) {
        return jdbc.query(OFFICE_SELECT + "where o.insurer_office_id = ?", (rs, n) -> office(rs, withAssignments), id)
            .stream().findFirst();
    }

    // ---- contact persons ------------------------------------------------------------------------

    /** People assigned to one office, each with their channels. */
    List<Map<String, Object>> assignments(String officeId) {
        return jdbc.query(
            "select a.*, p.* from contact_assignments a join contact_persons p on p.contact_person_id = a.contact_person_id "
                + "where a.insurer_office_id = ? and p.deleted = false order by a.priority nulls last, p.full_name",
            (rs, n) -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("assignmentId", rs.getString("assignment_id"));
                m.put("designation", rs.getString("designation"));
                m.put("department", rs.getString("department"));
                m.put("priorityRank", rs.getObject("priority"));
                m.put("domainId", rs.getString("domain_id"));
                m.put("roleId", rs.getString("role_id"));
                m.put("status", rs.getString("status"));
                m.put("contactPerson", person(rs));
                m.put("contactChannels", channels(rs.getString("contact_person_id")));
                return m;
            }, officeId);
    }

    Map<String, Object> person(ResultSet rs) throws SQLException {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("contactPersonId", rs.getString("contact_person_id"));
        m.put("tenantId", rs.getString("tenant_id"));
        m.put("insurerId", rs.getString("insurer_id"));
        m.put("prefix", rs.getString("prefix"));
        m.put("firstName", rs.getString("first_name"));
        m.put("middleName", rs.getString("middle_name"));
        m.put("lastName", rs.getString("last_name"));
        m.put("suffix", rs.getString("suffix"));
        m.put("fullName", rs.getString("full_name"));
        m.put("dateOfBirth", rs.getDate("date_of_birth") == null ? null : rs.getDate("date_of_birth").toString());
        m.put("gender", rs.getString("gender"));
        m.put("notes", rs.getString("notes"));
        String tags = rs.getString("tags");
        m.put("tags", tags == null || tags.isBlank() ? List.of() : Arrays.asList(tags.split(",")));
        return m;
    }

    List<Map<String, Object>> channels(String personId) {
        return jdbc.query("select * from contact_channels where contact_person_id = ? order by channel_id",
            (rs, n) -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("channelId", rs.getString("channel_id"));
                m.put("type", rs.getString("channel_type"));
                m.put("value", rs.getString("channel_value"));
                m.put("isWhatsappEnabled", rs.getBoolean("whatsapp_enabled"));
                return m;
            }, personId);
    }

    /**
     * Creates or updates one person from a request item (the same item shape the screens send for insurers,
     * offices and contact persons): details, channels and, when an office is given, the assignment to it.
     */
    String savePerson(String insurerId, String officeId, Map<String, Object> p) {
        String personId = Util.text(p, "contactPersonId");
        boolean exists = personId != null && Optional.ofNullable(jdbc.queryForObject(
            "select count(*) from contact_persons where contact_person_id = ?", Integer.class, personId)).orElse(0) > 0;

        String first = Util.text(p, "firstName");
        String middle = Util.text(p, "middleName");
        String last = Util.text(p, "lastName");
        String full = Util.text(p, "fullName");
        if (full == null) {
            full = String.join(" ", Arrays.stream(new String[]{first, middle, last}).filter(Objects::nonNull).toList());
        }
        String tags = p.get("tags") instanceof Collection<?> c ? String.join(",", c.stream().map(String::valueOf).toList()) : null;

        if (exists) {
            jdbc.update("update contact_persons set prefix = coalesce(?, prefix), first_name = coalesce(?, first_name), "
                    + "middle_name = coalesce(?, middle_name), last_name = coalesce(?, last_name), full_name = ?, "
                    + "date_of_birth = coalesce(?, date_of_birth), gender = coalesce(?, gender), notes = coalesce(?, notes), "
                    + "tags = coalesce(?, tags), updated_at = now() where contact_person_id = ?",
                Util.text(p, "prefix"), first, middle, last, full, Util.date(p.get("dateOfBirth")),
                Util.text(p, "gender"), Util.text(p, "notes"), tags, personId);
        } else {
            personId = Util.id("cp-");
            jdbc.update("insert into contact_persons (contact_person_id, tenant_id, insurer_id, prefix, first_name, middle_name, "
                    + "last_name, full_name, date_of_birth, gender, notes, tags) values (?,?,?,?,?,?,?,?,?,?,?,?)",
                personId, Util.text(p, "tenantId"), insurerId, Util.text(p, "prefix"), first, middle, last, full,
                Util.date(p.get("dateOfBirth")), Util.text(p, "gender"), Util.text(p, "notes"), tags);
        }

        if (p.get("contactChannels") instanceof List<?> || p.get("channels") instanceof List<?>) {
            saveChannels(personId, Util.list(p, p.get("contactChannels") instanceof List<?> ? "contactChannels" : "channels"));
        }
        if (officeId != null) {
            saveAssignment(personId, officeId, p);
        }
        return personId;
    }

    void saveChannels(String personId, List<Map<String, Object>> items) {
        Set<String> keep = new HashSet<>();
        for (Map<String, Object> item : items) {
            String value = Util.text(item, "value");
            String type = Util.text(item, "type");
            if (value == null || type == null) continue;
            boolean whatsapp = Boolean.TRUE.equals(Util.bool(item, "isWhatsappEnabled"));
            String channelId = Util.text(item, "channelId");
            int updated = channelId == null ? 0 : jdbc.update(
                "update contact_channels set channel_type = ?, channel_value = ?, whatsapp_enabled = ? "
                    + "where channel_id = ? and contact_person_id = ?", type, value, whatsapp, channelId, personId);
            if (updated == 0) {
                channelId = Util.id("ch-");
                jdbc.update("insert into contact_channels (channel_id, contact_person_id, channel_type, channel_value, whatsapp_enabled) "
                    + "values (?,?,?,?,?)", channelId, personId, type, value, whatsapp);
            }
            keep.add(channelId);
        }
        for (String existing : jdbc.queryForList("select channel_id from contact_channels where contact_person_id = ?", String.class, personId)) {
            if (!keep.contains(existing)) jdbc.update("delete from contact_channels where channel_id = ?", existing);
        }
    }

    void saveAssignment(String personId, String officeId, Map<String, Object> p) {
        String domainId = null;
        String roleId = null;
        List<Map<String, Object>> roles = Util.list(p, "contactRoles");
        if (!roles.isEmpty()) {
            domainId = Util.text(roles.get(0), "domainId");
            roleId = Util.text(roles.get(0), "roleId");
        }
        Integer priority = null;
        String rawPriority = Util.text(p, "priority") != null ? Util.text(p, "priority") : Util.text(p, "priorityRank");
        if (rawPriority != null && rawPriority.matches("\\d+")) priority = Integer.parseInt(rawPriority);

        String assignmentId = Util.text(p, "assignmentId");
        int updated = assignmentId == null ? 0 : jdbc.update(
            "update contact_assignments set designation = coalesce(?, designation), department = coalesce(?, department), "
                + "priority = coalesce(?, priority), domain_id = coalesce(?, domain_id), role_id = coalesce(?, role_id) "
                + "where assignment_id = ? and contact_person_id = ?",
            Util.text(p, "designation"), Util.text(p, "department"), priority, domainId, roleId, assignmentId, personId);
        if (updated == 0) {
            jdbc.update("insert into contact_assignments (assignment_id, contact_person_id, insurer_office_id, designation, "
                    + "department, priority, domain_id, role_id) values (?,?,?,?,?,?,?,?)",
                Util.id("as-"), personId, officeId, Util.text(p, "designation"), Util.text(p, "department"),
                priority, domainId, roleId);
        }
    }

    /** True when the item has anything worth saving (the screens send one empty item when nobody was entered). */
    static boolean hasPerson(Map<String, Object> p) {
        return Util.text(p, "firstName") != null || Util.text(p, "lastName") != null || Util.text(p, "fullName") != null;
    }
}
