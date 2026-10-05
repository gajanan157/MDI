package com.mdindia.enrollment.tpa.controller;

import com.mdindia.enrollment.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/** Escalation matrix: for each query type and branch, the people to contact at each level (0 = contact person). */
@RestController
@RequestMapping("/v1/escalation-matrix")
@CrossOrigin(origins = "*")
public class EscalationMatrixController {

    private static final int MAX_LEVEL = 4;

    private final JdbcTemplate jdbc;

    public EscalationMatrixController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping("/departments/dropdown")
    public ApiResponse<List<Map<String, Object>>> departments(
            @RequestParam(name = "tpa_department_active_flag", required = false) Boolean activeOnly) {
        String sql = "select department_id, department_name from escalation_departments"
            + (Boolean.TRUE.equals(activeOnly) ? " where active_flag = true" : "")
            + " order by department_name";
        List<Map<String, Object>> rows = jdbc.query(sql, (rs, i) -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("departmentId", rs.getString("department_id"));
            m.put("departmentName", rs.getString("department_name"));
            return m;
        });
        return ApiResponse.ofList(rows);
    }

    /** One record per query and branch, with its escalation levels, filtered by branch and/or department. */
    @GetMapping("/groupedNew")
    public ApiResponse<List<Map<String, Object>>> grouped(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String tpaBranchId,
            @RequestParam(required = false) String departmentId) {

        StringBuilder where = new StringBuilder(" where 1=1");
        List<Object> args = new ArrayList<>();
        if (tpaBranchId != null && !tpaBranchId.isBlank()) {
            where.append(" and m.tpa_branch_id = ?");
            args.add(tpaBranchId);
        }
        if (departmentId != null && !departmentId.isBlank()) {
            where.append(" and q.department_id = ?");
            args.add(departmentId);
        }
        String from = " from escalation_matrix m"
            + " join escalation_queries q on q.query_id = m.query_id"
            + " join escalation_departments d on d.department_id = q.department_id"
            + " join tpa t on t.tpa_id = m.tpa_id"
            + " join tpa_branches b on b.tpa_branch_id = m.tpa_branch_id";

        Long total = jdbc.queryForObject("select count(*)" + from + where, Long.class, args.toArray());
        int pageIndex = Math.max(page, 0);
        int pageSize = size > 0 ? Math.min(size, 500) : 20;
        List<Object> pageArgs = new ArrayList<>(args);
        pageArgs.add(pageSize);
        pageArgs.add((long) pageIndex * pageSize);

        List<Map<String, Object>> records = jdbc.query(
            "select m.escalation_matrix_id, q.query_id, q.query_code, q.query_name, d.department_id, d.department_name,"
                + " t.tpa_id, t.legal_name as tpa_name, b.tpa_branch_id, b.branch_name" + from + where
                + " order by b.branch_code, q.query_code limit ? offset ?",
            (rs, i) -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("escalationMatrixId", rs.getString("escalation_matrix_id"));
                m.put("queryId", rs.getString("query_id"));
                m.put("queryCode", rs.getString("query_code"));
                m.put("queryName", rs.getString("query_name"));
                m.put("departmentId", rs.getString("department_id"));
                m.put("departmentName", rs.getString("department_name"));
                m.put("tpaId", rs.getString("tpa_id"));
                m.put("tpaName", rs.getString("tpa_name"));
                m.put("tpaBranchId", rs.getString("tpa_branch_id"));
                m.put("tpaBranchName", rs.getString("branch_name"));
                return m;
            }, pageArgs.toArray());

        for (Map<String, Object> record : records) {
            record.put("levels", levels((String) record.get("escalationMatrixId")));
        }
        long totalRecords = total == null ? 0 : total;
        int totalPages = (int) Math.ceil((double) totalRecords / pageSize);
        return ApiResponse.success(records, totalRecords, totalPages, pageIndex, pageSize);
    }

    /** People who can be picked for a level of the given query. */
    @GetMapping("/employeeByQuery")
    public ApiResponse<List<Map<String, Object>>> employees(@RequestParam(required = false) String queryId) {
        return ApiResponse.ofList(jdbc.query(
            "select employee_id, employee_code, employee_name, designation, email, mobile from escalation_employees order by employee_name",
            (rs, i) -> employee(rs.getString("employee_id"), rs.getString("employee_code"), rs.getString("employee_name"),
                rs.getString("designation"), rs.getString("email"), rs.getString("mobile"))));
    }

    @PutMapping("/query/{queryId}/matrix/{matrixId}/level")
    @Transactional
    public ResponseEntity<ApiResponse<String>> saveLevels(@PathVariable String queryId, @PathVariable String matrixId,
                                                          @RequestBody Map<String, Object> body) {
        Integer exists = jdbc.queryForObject(
            "select count(*) from escalation_matrix where escalation_matrix_id = ? and query_id = ?", Integer.class, matrixId, queryId);
        if (exists == null || exists == 0) {
            return ResponseEntity.status(404).body(ApiResponse.error("Escalation matrix not found", 404));
        }
        if (!(body.get("levels") instanceof List<?> levels) || levels.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("At least one level is required", 400));
        }

        List<Object[]> rows = new ArrayList<>();
        Set<Integer> seen = new HashSet<>();
        for (Object item : levels) {
            if (!(item instanceof Map<?, ?> level)) continue;
            Object levelValue = level.get("escalationLevel");
            Object employeeId = level.get("employeeId");
            if (!(levelValue instanceof Number n) || employeeId == null || String.valueOf(employeeId).isBlank()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Each level needs escalationLevel and employeeId", 400));
            }
            int number = n.intValue();
            if (number < 0 || number > MAX_LEVEL || !seen.add(number)) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Level must be 0 to " + MAX_LEVEL + " and used once", 400));
            }
            Integer known = jdbc.queryForObject("select count(*) from escalation_employees where employee_id = ?", Integer.class, employeeId);
            if (known == null || known == 0) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Unknown employee " + employeeId, 400));
            }
            rows.add(new Object[]{matrixId, number, String.valueOf(employeeId), nullable(level.get("mobile")), nullable(level.get("email"))});
        }

        jdbc.update("delete from escalation_levels where escalation_matrix_id = ?", matrixId);
        for (Object[] row : rows) {
            jdbc.update("insert into escalation_levels (escalation_matrix_id, escalation_level, employee_id, mobile, email) values (?,?,?,?,?)", row);
        }
        return ResponseEntity.ok(ApiResponse.success("Escalation levels updated successfully", matrixId));
    }

    private List<Map<String, Object>> levels(String matrixId) {
        return jdbc.query(
            "select l.escalation_level, l.sla_hours, e.employee_id, e.employee_code, e.employee_name, e.designation,"
                + " coalesce(l.email, e.email) as email, coalesce(l.mobile, e.mobile) as mobile"
                + " from escalation_levels l join escalation_employees e on e.employee_id = l.employee_id"
                + " where l.escalation_matrix_id = ? order by l.escalation_level",
            (rs, i) -> {
                Map<String, Object> m = employee(rs.getString("employee_id"), rs.getString("employee_code"),
                    rs.getString("employee_name"), rs.getString("designation"), rs.getString("email"), rs.getString("mobile"));
                m.put("escalationLevel", rs.getInt("escalation_level"));
                m.put("slaHours", rs.getInt("sla_hours"));
                return m;
            }, matrixId);
    }

    private static Map<String, Object> employee(String id, String code, String name, String designation, String email, String mobile) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("employeeId", id);
        m.put("employeeCode", code);
        m.put("employeeName", name);
        m.put("designation", designation);
        Map<String, Object> contacts = new LinkedHashMap<>();
        contacts.put("Email", email);
        contacts.put("Mobile", mobile);
        m.put("contacts", contacts);
        return m;
    }

    private static String nullable(Object value) {
        return value == null || String.valueOf(value).isBlank() ? null : String.valueOf(value);
    }
}
