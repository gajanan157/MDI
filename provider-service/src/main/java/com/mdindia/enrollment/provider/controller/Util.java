package com.mdindia.enrollment.provider.controller;

import com.mdindia.enrollment.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;

import java.sql.Date;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.*;

/** Small helpers for reading request bodies and building responses. */
final class Util {
    private Util() {}

    static String text(Map<?, ?> body, String key) {
        if (body == null) return null;
        Object v = body.get(key);
        if (v == null) return null;
        String s = String.valueOf(v).trim();
        return s.isEmpty() ? null : s;
    }

    static boolean has(Map<?, ?> body, String key) {
        return body != null && body.containsKey(key);
    }

    static Boolean bool(Map<?, ?> body, String key) {
        if (body == null || body.get(key) == null) return null;
        Object v = body.get(key);
        return v instanceof Boolean b ? b : Boolean.parseBoolean(String.valueOf(v));
    }

    @SuppressWarnings("unchecked")
    static Map<String, Object> map(Map<?, ?> body, String key) {
        return body != null && body.get(key) instanceof Map<?, ?> m ? (Map<String, Object>) m : null;
    }

    @SuppressWarnings("unchecked")
    static List<Map<String, Object>> list(Map<?, ?> body, String key) {
        if (body == null || !(body.get(key) instanceof List<?> l)) return List.of();
        List<Map<String, Object>> out = new ArrayList<>();
        for (Object o : l) if (o instanceof Map<?, ?> m) out.add((Map<String, Object>) m);
        return out;
    }

    /** Accepts yyyy-MM-dd or a longer ISO timestamp; anything else is treated as empty. */
    static Date date(Object value) {
        if (value == null) return null;
        String s = String.valueOf(value).trim();
        if (s.length() < 10) return null;
        try {
            return Date.valueOf(LocalDate.parse(s.substring(0, 10)));
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    static String id(String prefix) {
        return prefix + UUID.randomUUID().toString().substring(0, 12);
    }

    static <T> ResponseEntity<ApiResponse<T>> error(int status, String message) {
        return ResponseEntity.status(status).body(ApiResponse.error(message, status));
    }

    /** Body for deletes: the screens check statusCode to know the delete worked. */
    static ResponseEntity<Map<String, Object>> deleted(String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("status", 200);
        body.put("statusCode", 200);
        body.put("message", message);
        return ResponseEntity.ok(body);
    }

    static String like(String value) {
        return "%" + value.trim().toLowerCase() + "%";
    }
}
