package com.mdindia.enrollment.tpa.dto;

import com.mdindia.enrollment.tpa.entity.Address;
import com.mdindia.enrollment.tpa.entity.TpaBranchEntity;
import com.mdindia.enrollment.tpa.entity.TpaEntity;

import java.util.*;

/** Converts entities to the JSON shapes the web screens read, and reads values out of request bodies. */
public final class TpaMapper {
    private TpaMapper() {}

    public static List<String> split(String csv) {
        if (csv == null || csv.isBlank()) return List.of();
        return Arrays.stream(csv.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
    }

    /** Accepts a JSON array or a single comma separated string. */
    public static String join(Object value) {
        if (value == null) return null;
        if (value instanceof Collection<?> c) {
            return String.join(",", c.stream().map(String::valueOf).map(String::trim).filter(s -> !s.isEmpty()).toList());
        }
        return String.join(",", split(String.valueOf(value)));
    }

    public static String text(Map<String, Object> body, String key) {
        Object v = body.get(key);
        return v == null ? null : String.valueOf(v).trim();
    }

    @SuppressWarnings("unchecked")
    public static Map<String, Object> map(Map<String, Object> body, String key) {
        return body.get(key) instanceof Map<?, ?> m ? (Map<String, Object>) m : null;
    }

    /** Copies only the address fields present in the request. */
    public static void applyAddress(Address target, Map<String, Object> src) {
        if (src != null) {
            if (src.containsKey("address")) target.setLine(text(src, "address"));
            if (src.containsKey("city")) target.setCity(text(src, "city"));
            if (src.containsKey("stateName")) target.setStateName(text(src, "stateName"));
            if (src.containsKey("postalCode")) target.setPostalCode(text(src, "postalCode"));
            if (src.containsKey("addressType")) target.setAddressType(text(src, "addressType"));
        }
        if (target.getAddressId() == null) target.setAddressId("adr-" + UUID.randomUUID());
        if (target.getAddressStatus() == null) target.setAddressStatus("ACTIVE");
    }

    public static Map<String, Object> address(Address a, String tenantId) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("addressId", a.getAddressId());
        m.put("tenantId", tenantId);
        m.put("addressType", a.getAddressType());
        m.put("address", a.getLine());
        m.put("city", a.getCity());
        m.put("stateName", a.getStateName());
        m.put("postalCode", a.getPostalCode());
        m.put("addressStatus", a.getAddressStatus());
        return m;
    }

    public static Map<String, Object> tpa(TpaEntity t) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("tpaId", t.getTpaId());
        m.put("tenantId", t.getTenantId());
        m.put("tpaCode", t.getTpaCode());
        m.put("legalName", t.getLegalName());
        m.put("cin", t.getCin());
        m.put("contactEmail", t.getContactEmail());
        m.put("contactPhone", t.getContactPhone());
        m.put("address", address(t.getAddress(), t.getTenantId()));
        return m;
    }

    public static Map<String, Object> branch(TpaBranchEntity b, TpaEntity tpa, String parentName) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("tpaBranchId", b.getTpaBranchId());
        m.put("tpaId", b.getTpaId());
        m.put("tenantId", b.getTenantId());
        m.put("tpaName", tpa != null ? tpa.getLegalName() : null);
        m.put("tpaCode", tpa != null ? tpa.getTpaCode() : null);
        m.put("parentBranchId", b.getParentBranchId());
        m.put("parentBranchName", parentName);
        m.put("branchCode", b.getBranchCode());
        m.put("branchName", b.getBranchName());
        m.put("contactEmail", split(b.getContactEmail()));
        m.put("contactPhone", split(b.getContactPhone()));
        m.put("serviceTypes", split(b.getServiceTypes()));
        m.put("tags", split(b.getTags()));
        m.put("recordStatus", b.getRecordStatus());
        m.put("address", address(b.getAddress(), b.getTenantId()));
        return m;
    }
}
