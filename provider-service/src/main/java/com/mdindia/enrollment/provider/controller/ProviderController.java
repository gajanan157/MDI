package com.mdindia.enrollment.provider.controller;

import com.mdindia.enrollment.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

@RestController
@RequestMapping("/v1/provider")
@CrossOrigin(origins = "*")
public class ProviderController {

    private static final Set<String> NETWORK_TYPES = Set.of("NETWORK", "NON_NETWORK");
    private static final Set<String> SOURCES = Set.of("TPA", "INSURER", "HYBRID");

    /** How a request key maps to a column. Types: s text, b boolean, n number, l list (stored comma separated), d date. */
    private record Field(String key, String column, char type) {}

    private static final List<Field> FIELDS = List.of(
        new Field("providerName", "provider_name", 's'),
        new Field("providerNetworkType", "provider_network_type", 's'),
        new Field("empanelmentSource", "empanelment_source", 's'),
        new Field("recordStatus", "record_status", 's'),
        new Field("providerIsVerified", "is_verified", 'b'),
        new Field("providerOwnershipType", "ownership_type", 's'),
        new Field("providerDayCareFlag", "day_care_flag", 'b'),
        new Field("providerCareTier", "care_tier", 's'),
        new Field("providerInternalGrade", "internal_grade", 's'),
        new Field("providerOwnerName", "owner_name", 's'),
        new Field("providerOwnerDesignation", "owner_designation", 's'),
        new Field("providerOwnerQualification", "owner_qualification", 's'),
        new Field("providerSignatoryName", "signatory_name", 's'),
        new Field("providerSignatoryDesignation", "signatory_designation", 's'),
        new Field("providerSystemOfMedicineId", "system_of_medicine_id", 's'),
        new Field("providerTpaServicingBranchId", "tpa_servicing_branch_id", 's'),
        new Field("providerTpaServicingBranchName", "tpa_servicing_branch_name", 's'),
        new Field("providerServiceEmailId", "service_email_id", 'l'),
        new Field("providerRegistrationNo", "registration_no", 's'),
        new Field("providerRegistrationAuthority", "registration_authority", 's'),
        new Field("providerPanNo", "pan_no", 's'),
        new Field("providerPanHolderName", "pan_holder_name", 's'),
        new Field("providerTanNo", "tan_no", 's'),
        new Field("providerWebsiteUrl", "website_url", 's'),
        new Field("providerOfficialContactTelephoneNo", "telephone_no", 'l'),
        new Field("providerOfficialContactMobileNo", "mobile_no", 'l'),
        new Field("providerOfficialFaxNo", "fax_no", 'l'),
        new Field("providerOfficialContactEmailId", "email_id", 'l'),
        new Field("providerAddress", "address", 's'),
        new Field("providerPlotNo", "plot_no", 's'),
        new Field("providerLocation", "location", 's'),
        new Field("providerTaluka", "taluka", 's'),
        new Field("providerCity", "city", 's'),
        new Field("providerDistrict", "district", 's'),
        new Field("providerStateName", "state_name", 's'),
        new Field("providerStateCode", "state_code", 's'),
        new Field("providerCountryCode", "country_code", 's'),
        new Field("providerZone", "zone", 's'),
        new Field("providerPostalCode", "postal_code", 's'),
        new Field("providerLocationType", "location_type", 's'),
        new Field("providerLatitude", "latitude", 'n'),
        new Field("providerLongitude", "longitude", 'n'),
        new Field("providerAddressStatus", "address_status", 's'),
        new Field("noOfBeds", "no_of_beds", 'n'),
        new Field("nextRenewalDueDate", "next_renewal_due_date", 'd'));

    /** Names under which the details screen sends the contact block. */
    private static final Map<String, String> CONTACT_ALIASES = Map.of(
        "providerTelephoneNo", "providerOfficialContactTelephoneNo",
        "providerMobileNo", "providerOfficialContactMobileNo",
        "providerFaxNo", "providerOfficialFaxNo",
        "providerEmailId", "providerOfficialContactEmailId",
        "providerWebsiteUrl", "providerWebsiteUrl");

    private static final Map<String, String> SORT_COLUMNS = Map.of(
        "providerName", "p.provider_name", "providerCode", "p.provider_code", "city", "p.city", "state", "p.state_name",
        "noOfBeds", "p.no_of_beds", "providerType", "t.type_code");

    private final JdbcTemplate jdbc;

    ProviderController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // ---- list -----------------------------------------------------------------------------------

    /**
     * Provider search. Paging is 1-based. The Rohini number and its expiry live in the identifiers, so those
     * filters look at the provider's ROHINI identifier.
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String providerName,
            @RequestParam(required = false) String providerIibRohiniCode,
            @RequestParam(required = false) String providerCode,
            @RequestParam(required = false) String providerNetworkType,
            @RequestParam(required = false) String providerType,
            @RequestParam(required = false) Integer expiringInDays,
            @RequestParam(required = false) String providerIibRohiniEffectiveToDate,
            @RequestParam(required = false) String providerRohiniStatus,
            @RequestParam(required = false) String pincode,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String insurerIds,
            @RequestParam(required = false) String networkSource,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "false") boolean expiringProvidersView) {

        String rohini = "select 1 from provider_identifiers i where i.provider_id = p.provider_id and i.identifier_type_name = 'ROHINI Registry Code'";
        StringBuilder where = new StringBuilder("where p.record_status <> 'Deleted'");
        List<Object> args = new ArrayList<>();
        like(where, args, "p.provider_name", providerName);
        like(where, args, "p.provider_code", providerCode);
        like(where, args, "p.postal_code", pincode);
        like(where, args, "p.state_name", state);
        like(where, args, "p.city", city);
        if (present(providerNetworkType)) { where.append(" and p.provider_network_type = ?"); args.add(providerNetworkType.trim().toUpperCase()); }
        if (present(providerType)) { where.append(" and t.type_code = ?"); args.add(providerType.trim().toUpperCase()); }
        if (present(providerIibRohiniCode)) {
            where.append(" and exists (").append(rohini).append(" and lower(i.identifier_value) like ?)");
            args.add(Util.like(providerIibRohiniCode));
        }
        if (present(providerIibRohiniEffectiveToDate) && Util.date(providerIibRohiniEffectiveToDate) != null) {
            where.append(" and exists (").append(rohini).append(" and i.valid_to = ?)");
            args.add(Util.date(providerIibRohiniEffectiveToDate));
        }
        if (present(providerRohiniStatus)) {
            boolean active = "ROHINI_ACTIVE".equalsIgnoreCase(providerRohiniStatus.trim());
            where.append(" and exists (").append(rohini).append(" and i.valid_to ").append(active ? ">=" : "<").append(" current_date)");
        }
        int window = expiringProvidersView ? 30 : (expiringInDays != null && expiringInDays > 0 ? expiringInDays : 0);
        if (window > 0) {
            where.append(" and exists (").append(rohini).append(" and i.valid_to between current_date and current_date + ?)");
            args.add(window);
        }
        if (present(insurerIds)) {
            List<String> ids = Arrays.stream(insurerIds.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
            if (!ids.isEmpty()) {
                where.append(" and exists (select 1 from provider_insurers pi where pi.provider_id = p.provider_id and pi.insurer_id in (")
                    .append(String.join(",", Collections.nCopies(ids.size(), "?"))).append("))");
                args.addAll(ids);
            }
        }
        if (present(networkSource)) {
            String source = networkSource.trim().toUpperCase();
            if (SOURCES.contains(source)) {
                where.append(" and p.empanelment_source in (?, 'HYBRID')");
                args.add(source);
            }
        }

        String from = "from providers p join provider_type_master t on t.provider_type_id = p.provider_type_id ";
        Long total = jdbc.queryForObject("select count(*) " + from + where, Long.class, args.toArray());
        int pageSize = size > 0 ? Math.min(size, 1000) : 20;
        int pageNo = Math.max(page, 1);
        List<Object> pageArgs = new ArrayList<>(args);
        pageArgs.add(pageSize);
        pageArgs.add((long) (pageNo - 1) * pageSize);

        List<Map<String, Object>> rows = jdbc.query("select p.*, t.type_code, t.display_name as type_name, t.class_code, t.subclass_code " + from + where
                + " order by " + orderBy(sortBy) + " limit ? offset ?",
            (rs, n) -> row(rs), pageArgs.toArray());
        for (Map<String, Object> r : rows) r.put("identifiers", identifiers((String) r.get("providerId")));

        long totalRecords = total == null ? 0 : total;
        Map<String, Object> pagination = new LinkedHashMap<>();
        pagination.put("totalRecords", totalRecords);
        pagination.put("totalPages", (int) Math.ceil((double) totalRecords / pageSize));
        pagination.put("currentPage", pageNo);
        pagination.put("pageSize", pageSize);

        Integer expiring = jdbc.queryForObject("select count(distinct i.provider_id) from provider_identifiers i join providers p on p.provider_id = i.provider_id "
            + "where p.record_status <> 'Deleted' and i.identifier_type_name = 'ROHINI Registry Code' and i.valid_to between current_date and current_date + 30", Integer.class);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("status", 200);
        body.put("message", "Operation successful");
        body.put("data", rows);
        body.put("pagination", pagination);
        body.put("additionalData", Map.of("countExpiringInDays", expiring == null ? 0 : expiring));
        return ResponseEntity.ok(body);
    }

    // ---- create / read / update -----------------------------------------------------------------

    @PostMapping
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(@RequestBody Map<String, Object> body) {
        String name = Util.text(body, "providerName");
        String typeId = Util.text(body, "providerTypeId");
        String network = Util.text(body, "providerNetworkType");
        if (name == null || typeId == null || network == null) return Util.error(400, "providerName, providerTypeId and providerNetworkType are required");
        network = network.toUpperCase();
        if (!NETWORK_TYPES.contains(network)) return Util.error(400, "providerNetworkType must be NETWORK or NON_NETWORK");
        if (count("select count(*) from provider_type_master where provider_type_id = ?", typeId) == 0) return Util.error(400, "Unknown provider type");
        String source = Util.text(body, "empanelmentSource") == null ? "TPA" : Util.text(body, "empanelmentSource").toUpperCase();
        if (!SOURCES.contains(source)) return Util.error(400, "empanelmentSource must be TPA, INSURER or HYBRID");
        String rohini = Util.text(body, "providerRohiniNumber");
        if (rohini != null && count("select count(*) from provider_identifiers where lower(identifier_value) = lower(?) and identifier_type_name = 'ROHINI Registry Code'", rohini) > 0) {
            return Util.error(409, "A provider with Rohini number '" + rohini + "' already exists");
        }

        String id = "prv-" + UUID.randomUUID().toString().substring(0, 8);
        String code = nextCode();
        jdbc.update("insert into providers (provider_id, provider_code, provider_name, provider_type_id, provider_network_type, empanelment_source, address_id) values (?,?,?,?,?,?,?)",
            id, code, name, typeId, network, source, Util.id("adr-"));
        Map<String, Object> rest = new LinkedHashMap<>(body);
        rest.remove("providerName");
        rest.remove("providerNetworkType");
        rest.remove("empanelmentSource");
        applyFields(id, rest);
        replaceList("provider_insurers", "insurer_id", id, strings(body.get("insurerIds")));
        replaceList("provider_specialties", "specialty_id", id, strings(firstPresent(body, "providerClinicalSpecialityIds", "providerClinicalSpecialtyIds")));
        if (rohini != null) {
            jdbc.update("insert into provider_identifiers (provider_identifier_id, provider_id, identifier_type_name, identifier_value, is_primary, source_system) values (?,?,?,?,?,?)",
                Util.id("pid-"), id, "ROHINI Registry Code", rohini, true, "TPA");
        }
        Map<String, Object> created = new LinkedHashMap<>();
        created.put("id", id);
        created.put("providerId", id);
        created.put("providerCode", code);
        created.put("providerName", name);
        return ResponseEntity.ok(ApiResponse.success("Provider created successfully", created));
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<ApiResponse<Map<String, Object>>> details(@PathVariable String id) {
        return details(id, true);
    }

    @PatchMapping("/{id}/details")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> patchDetails(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return patch(id, body);
    }

    @PatchMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> patch(@PathVariable String id, @RequestBody Map<String, Object> body) {
        if (!exists(id)) return Util.error(404, "Provider not found");
        Map<String, Object> source = new LinkedHashMap<>(body);
        Map<String, Object> contact = Util.map(body, "providerContactDetail");
        if (contact != null) {
            CONTACT_ALIASES.forEach((from, to) -> { if (contact.containsKey(from)) source.put(to, contact.get(from)); });
        }
        Map<String, Object> address = Util.map(body, "address");
        if (address != null) address.forEach(source::putIfAbsent);

        String network = Util.text(source, "providerNetworkType");
        if (network != null && !NETWORK_TYPES.contains(network.toUpperCase())) return Util.error(400, "providerNetworkType must be NETWORK or NON_NETWORK");
        String typeId = Util.text(source, "providerTypeId");
        if (typeId != null) {
            if (count("select count(*) from provider_type_master where provider_type_id = ?", typeId) == 0) return Util.error(400, "Unknown provider type");
            jdbc.update("update providers set provider_type_id = ? where provider_id = ?", typeId, id);
        }
        if (network != null) source.put("providerNetworkType", network.toUpperCase());
        applyFields(id, source);
        if (Util.has(source, "insurerIds")) replaceList("provider_insurers", "insurer_id", id, strings(source.get("insurerIds")));
        Object specialties = firstPresent(source, "providerClinicalSpecialityIds", "providerClinicalSpecialtyIds", "clinicalSpecialtyIds");
        if (specialties != null) replaceList("provider_specialties", "specialty_id", id, strings(specialties));
        return details(id, false, "Provider updated successfully");
    }

    // ---- contact persons ------------------------------------------------------------------------

    /** Empty list (not 404) when the provider has no contact persons yet. */
    @GetMapping("/{id}/contact-person")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> contactPersons(@PathVariable String id) {
        if (!exists(id)) return Util.error(404, "Provider not found");
        return ResponseEntity.ok(ApiResponse.ofList(contacts(id)));
    }

    @PostMapping("/{id}/contact-persons")
    @Transactional
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> addContacts(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return saveContacts(id, body, false);
    }

    @PatchMapping("/{id}/contact-persons")
    @Transactional
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> patchContacts(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return saveContacts(id, body, true);
    }

    private ResponseEntity<ApiResponse<List<Map<String, Object>>>> saveContacts(String providerId, Map<String, Object> body, boolean allowUpdate) {
        if (!exists(providerId)) return Util.error(404, "Provider not found");
        List<Map<String, Object>> items = Util.list(body, "contactPersons");
        if (items.isEmpty()) return Util.error(400, "contactPersons is required");
        for (Map<String, Object> item : items) {
            String contactId = Util.text(item, "providerContactPersonId");
            String roleId = Util.text(item, "providerContactPersonRoleId");
            String roleName = Util.text(item, "providerContactPersonRole");
            if (roleName == null && roleId != null) {
                roleName = jdbc.queryForList("select lookup_name from provider_lookups where lookup_type = 'CONTACT_PERSON_ROLE' and lookup_id = ?", String.class, roleId)
                    .stream().findFirst().orElse(null);
            }
            boolean updated = false;
            if (allowUpdate && contactId != null) {
                updated = jdbc.update("update provider_contact_persons set role_id = coalesce(?, role_id), role_name = coalesce(?, role_name), "
                        + "full_name = coalesce(?, full_name), designation = coalesce(?, designation), telephone_no = coalesce(?, telephone_no), "
                        + "mobile_no = coalesce(?, mobile_no), email_id = coalesce(?, email_id), record_status = coalesce(?, record_status) "
                        + "where provider_contact_person_id = ? and provider_id = ?",
                    roleId, roleName, Util.text(item, "providerContactPersonFullName"), Util.text(item, "providerContactPersonDesignation"),
                    csv(item.get("providerContactPersonTelephoneNo")), csv(item.get("providerContactPersonMobileNo")),
                    csv(item.get("providerContactPersonEmailId")), Util.text(item, "recordStatus"), contactId, providerId) > 0;
            }
            if (!updated) {
                String fullName = Util.text(item, "providerContactPersonFullName");
                if (fullName == null) return Util.error(400, "providerContactPersonFullName is required");
                jdbc.update("insert into provider_contact_persons (provider_contact_person_id, provider_id, role_id, role_name, full_name, designation, "
                        + "telephone_no, mobile_no, email_id) values (?,?,?,?,?,?,?,?,?)",
                    Util.id("pcp-"), providerId, roleId, roleName, fullName, Util.text(item, "providerContactPersonDesignation"),
                    csv(item.get("providerContactPersonTelephoneNo")), csv(item.get("providerContactPersonMobileNo")), csv(item.get("providerContactPersonEmailId")));
            }
        }
        return ResponseEntity.ok(ApiResponse.success("Contact persons saved successfully", contacts(providerId)));
    }

    // ---------------------------------------------------------------------------------------------

    private ResponseEntity<ApiResponse<Map<String, Object>>> details(String id, boolean unused) {
        return details(id, unused, "Operation successful");
    }

    private ResponseEntity<ApiResponse<Map<String, Object>>> details(String id, boolean unused, String message) {
        List<Map<String, Object>> found = jdbc.query("select p.*, t.type_code, t.display_name as type_name, t.class_code, t.subclass_code, "
                + "(select lookup_name from provider_lookups l where l.lookup_type = 'SYSTEM_OF_MEDICINE' and l.lookup_id = p.system_of_medicine_id) as som_name "
                + "from providers p join provider_type_master t on t.provider_type_id = p.provider_type_id where p.provider_id = ?",
            (rs, n) -> {
                Map<String, Object> m = row(rs);
                m.put("providerTypeId", rs.getString("provider_type_id"));
                m.put("providerTypeName", rs.getString("type_name"));
                m.put("providerClass", rs.getString("class_code"));
                m.put("providerSubclass", rs.getString("subclass_code"));
                m.put("providerIsVerified", rs.getBoolean("is_verified"));
                m.put("providerOwnershipType", rs.getString("ownership_type"));
                m.put("providerDayCareFlag", rs.getBoolean("day_care_flag"));
                m.put("providerCareTier", rs.getString("care_tier"));
                m.put("providerInternalGrade", rs.getString("internal_grade"));
                m.put("providerOwnerName", rs.getString("owner_name"));
                m.put("providerOwnerDesignation", rs.getString("owner_designation"));
                m.put("providerOwnerQualification", rs.getString("owner_qualification"));
                m.put("providerSignatoryName", rs.getString("signatory_name"));
                m.put("providerSignatoryDesignation", rs.getString("signatory_designation"));
                m.put("providerSystemOfMedicineId", rs.getString("system_of_medicine_id"));
                m.put("providerSystemOfMedicineName", rs.getString("som_name"));
                m.put("providerTpaServicingBranchId", rs.getString("tpa_servicing_branch_id"));
                m.put("providerTpaServicingBranchName", rs.getString("tpa_servicing_branch_name"));
                m.put("providerServiceEmailId", rs.getString("service_email_id"));
                m.put("providerRegistrationNo", rs.getString("registration_no"));
                m.put("providerRegistrationAuthority", rs.getString("registration_authority"));
                m.put("providerPanNo", rs.getString("pan_no"));
                m.put("providerPanHolderName", rs.getString("pan_holder_name"));
                m.put("providerTanNo", rs.getString("tan_no"));
                m.put("providerAddress", rs.getString("address"));
                m.put("providerAddressId", rs.getString("address_id"));
                m.put("providerPlotNo", rs.getString("plot_no"));
                m.put("providerLocation", rs.getString("location"));
                m.put("providerTaluka", rs.getString("taluka"));
                m.put("providerCity", rs.getString("city"));
                m.put("providerDistrict", rs.getString("district"));
                m.put("providerStateName", rs.getString("state_name"));
                m.put("providerStateCode", rs.getString("state_code"));
                m.put("providerCountryCode", rs.getString("country_code"));
                m.put("providerZone", rs.getString("zone"));
                m.put("providerPostalCode", rs.getString("postal_code"));
                m.put("providerLocationType", rs.getString("location_type"));
                BigDecimal lat = rs.getBigDecimal("latitude");
                BigDecimal lon = rs.getBigDecimal("longitude");
                m.put("providerLatitude", lat);
                m.put("providerLongitude", lon);
                m.put("providerAddressStatus", rs.getString("address_status"));
                m.put("recordStatus", rs.getString("record_status"));
                Map<String, Object> contact = new LinkedHashMap<>();
                contact.put("providerWebsiteAvailableFlag", rs.getString("website_url") != null);
                contact.put("providerWebsiteUrl", rs.getString("website_url"));
                contact.put("providerTelephoneNo", split(rs.getString("telephone_no")));
                contact.put("providerMobileNo", split(rs.getString("mobile_no")));
                contact.put("providerFaxNo", split(rs.getString("fax_no")));
                contact.put("providerEmailId", split(rs.getString("email_id")));
                m.put("providerContactDetail", contact);
                return m;
            }, id);
        if (found.isEmpty()) return Util.error(404, "Provider not found");
        Map<String, Object> d = found.get(0);
        d.put("providerClinicalSpecialties", jdbc.query(
            "select l.lookup_id, l.lookup_name from provider_specialties s join provider_lookups l on l.lookup_type = 'CLINICAL_SPECIALTY' and l.lookup_id = s.specialty_id "
                + "where s.provider_id = ? order by l.sort_order",
            (rs, n) -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("providerClinicalSpecialtyId", rs.getString("lookup_id"));
                m.put("providerClinicalSpecialtyName", rs.getString("lookup_name"));
                return m;
            }, id));
        d.put("insurerIds", jdbc.queryForList("select insurer_id from provider_insurers where provider_id = ? order by insurer_id", String.class, id));
        d.put("providerOldCode", jdbc.queryForList("select identifier_value from provider_identifiers where provider_id = ? and identifier_type_name = 'Old Provider Code' limit 1",
            String.class, id).stream().findFirst().orElse(null));
        d.put("identifiers", identifiers(id));
        d.put("certificates", List.of());
        d.put("agreements", List.of());
        d.put("blacklistedByIcNames", List.of());
        return ResponseEntity.ok(ApiResponse.success(message, d));
    }

    /** Fields shared by the list rows and the details view. */
    private Map<String, Object> row(ResultSet rs) throws SQLException {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", rs.getString("provider_id"));
        m.put("providerId", rs.getString("provider_id"));
        m.put("providerName", rs.getString("provider_name"));
        m.put("providerCode", rs.getString("provider_code"));
        m.put("providerType", rs.getString("type_code"));
        m.put("providerNetworkType", rs.getString("provider_network_type"));
        m.put("globalProviderNetwork", rs.getString("provider_network_type"));
        String source = rs.getString("empanelment_source");
        m.put("tpaProviderNetwork", "TPA".equals(source) || "HYBRID".equals(source) ? rs.getString("provider_network_type") : null);
        m.put("insurerProviderNetwork", "INSURER".equals(source) || "HYBRID".equals(source) ? rs.getString("provider_network_type") : null);
        m.put("networkSource", source);
        m.put("address", rs.getString("address"));
        m.put("city", rs.getString("city"));
        m.put("state", rs.getString("state_name"));
        m.put("noOfBeds", rs.getObject("no_of_beds"));
        m.put("nextRenewalDueDate", rs.getDate("next_renewal_due_date") == null ? null : rs.getDate("next_renewal_due_date").toString());
        return m;
    }

    private List<Map<String, Object>> identifiers(String providerId) {
        return jdbc.query("select * from provider_identifiers where provider_id = ? order by is_primary desc, identifier_type_name", (rs, n) -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("providerIdentifierId", rs.getString("provider_identifier_id"));
            m.put("identifierTypeName", rs.getString("identifier_type_name"));
            m.put("identifierValue", rs.getString("identifier_value"));
            m.put("identifierStatus", rs.getString("identifier_status"));
            m.put("validFrom", rs.getDate("valid_from") == null ? null : rs.getDate("valid_from").toString());
            m.put("validTo", rs.getDate("valid_to") == null ? null : rs.getDate("valid_to").toString());
            m.put("isPrimary", rs.getBoolean("is_primary"));
            m.put("issueDate", rs.getDate("issue_date") == null ? null : rs.getDate("issue_date").toString());
            m.put("sourceSystem", rs.getString("source_system"));
            m.put("identifierHolderName", rs.getString("identifier_holder_name"));
            m.put("issuingAuthorityName", rs.getString("issuing_authority_name"));
            m.put("verificationReferenceNo", rs.getString("verification_reference_no"));
            return m;
        }, providerId);
    }

    private List<Map<String, Object>> contacts(String providerId) {
        return jdbc.query("select * from provider_contact_persons where provider_id = ? order by full_name", (rs, n) -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("providerContactPersonId", rs.getString("provider_contact_person_id"));
            m.put("providerId", rs.getString("provider_id"));
            m.put("providerContactPersonRoleId", rs.getString("role_id"));
            m.put("providerContactPersonRole", rs.getString("role_name"));
            m.put("providerContactPersonFullName", rs.getString("full_name"));
            m.put("providerContactPersonDesignation", rs.getString("designation"));
            m.put("providerContactPersonTelephoneNo", split(rs.getString("telephone_no")));
            m.put("providerContactPersonMobileNo", split(rs.getString("mobile_no")));
            m.put("providerContactPersonEmailId", split(rs.getString("email_id")));
            m.put("recordStatus", rs.getString("record_status"));
            return m;
        }, providerId);
    }

    /** Updates only the columns whose keys are present in the request. */
    private void applyFields(String id, Map<String, Object> body) {
        List<String> sets = new ArrayList<>();
        List<Object> args = new ArrayList<>();
        for (Field f : FIELDS) {
            if (!body.containsKey(f.key())) continue;
            Object raw = body.get(f.key());
            Object value = switch (f.type()) {
                case 'b' -> raw == null ? Boolean.FALSE : Boolean.valueOf(String.valueOf(raw));
                case 'n' -> number(raw, f.column());
                case 'l' -> csv(raw);
                case 'd' -> Util.date(raw);
                default -> raw == null || String.valueOf(raw).isBlank() ? null : String.valueOf(raw).trim();
            };
            sets.add(f.column() + " = ?");
            args.add(value);
        }
        if (sets.isEmpty()) return;
        sets.add("updated_at = now()");
        args.add(id);
        jdbc.update("update providers set " + String.join(", ", sets) + " where provider_id = ?", args.toArray());
    }

    private static Object number(Object raw, String column) {
        if (raw == null || String.valueOf(raw).isBlank()) return null;
        try {
            return "no_of_beds".equals(column) ? (Object) Integer.valueOf((int) Double.parseDouble(String.valueOf(raw))) : new BigDecimal(String.valueOf(raw));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private void replaceList(String table, String column, String providerId, List<String> values) {
        jdbc.update("delete from " + table + " where provider_id = ?", providerId);
        for (String v : new LinkedHashSet<>(values)) {
            jdbc.update("insert into " + table + " (provider_id, " + column + ") values (?, ?)", providerId, v);
        }
    }

    private String nextCode() {
        int max = jdbc.queryForList("select provider_code from providers", String.class).stream()
            .filter(s -> s.matches("PRV\\d+")).mapToInt(s -> Integer.parseInt(s.substring(3))).max().orElse(0);
        return String.format("PRV%06d", max + 1);
    }

    private boolean exists(String id) {
        return count("select count(*) from providers where provider_id = ? and record_status <> 'Deleted'", id) > 0;
    }

    private int count(String sql, Object... args) {
        Integer n = jdbc.queryForObject(sql, Integer.class, args);
        return n == null ? 0 : n;
    }

    private static boolean present(String v) {
        return v != null && !v.isBlank();
    }

    private static void like(StringBuilder where, List<Object> args, String column, String value) {
        if (!present(value)) return;
        where.append(" and lower(").append(column).append(") like ?");
        args.add(Util.like(value));
    }

    private static String orderBy(String sortBy) {
        String column = "p.provider_name";
        String dir = "asc";
        if (present(sortBy)) {
            String[] parts = sortBy.split(",");
            column = SORT_COLUMNS.getOrDefault(parts[0].trim(), column);
            if (parts.length > 1 && "desc".equalsIgnoreCase(parts[1].trim())) dir = "desc";
        }
        return column + " " + dir + " nulls last";
    }

    private static Object firstPresent(Map<String, Object> body, String... keys) {
        for (String k : keys) if (body.containsKey(k)) return body.get(k);
        return null;
    }

    private static List<String> strings(Object value) {
        if (value instanceof Collection<?> c) return c.stream().map(String::valueOf).map(String::trim).filter(s -> !s.isEmpty()).toList();
        if (value == null) return List.of();
        return Arrays.stream(String.valueOf(value).split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
    }

    private static String csv(Object value) {
        if (value == null) return null;
        List<String> parts = strings(value);
        return parts.isEmpty() ? null : String.join(",", parts);
    }

    private static List<String> split(String csv) {
        return csv == null || csv.isBlank() ? List.of() : Arrays.stream(csv.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
    }
}
