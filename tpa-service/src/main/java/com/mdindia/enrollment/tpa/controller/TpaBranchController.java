package com.mdindia.enrollment.tpa.controller;

import com.mdindia.enrollment.common.dto.ApiResponse;
import com.mdindia.enrollment.tpa.dto.TpaMapper;
import com.mdindia.enrollment.tpa.entity.TpaBranchEntity;
import com.mdindia.enrollment.tpa.entity.TpaEntity;
import com.mdindia.enrollment.tpa.repository.TpaBranchRepository;
import com.mdindia.enrollment.tpa.repository.TpaRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "*")
public class TpaBranchController {

    private final TpaBranchRepository branches;
    private final TpaRepository tpas;
    private final JdbcTemplate jdbc;

    public TpaBranchController(TpaBranchRepository branches, TpaRepository tpas, JdbcTemplate jdbc) {
        this.branches = branches;
        this.tpas = tpas;
        this.jdbc = jdbc;
    }

    /**
     * Branch list with filters (branchName, recordStatus, serviceTypes) and 0-based paging.
     * With onlyNames=true it returns a light list of {id, name} used by the parent-branch dropdown.
     */
    @GetMapping("/v1/tpa-branch")
    public ApiResponse<?> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String branchName,
            @RequestParam(required = false) String recordStatus,
            @RequestParam(required = false) List<String> serviceTypes,
            @RequestParam(defaultValue = "false") boolean onlyNames) {

        if (onlyNames) {
            List<Map<String, Object>> names = branches.findAll(Sort.by("branchCode")).stream()
                .filter(b -> TpaBranchEntity.ACTIVE.equals(b.getRecordStatus()))
                .map(b -> Map.<String, Object>of("id", b.getTpaBranchId(), "name", b.getBranchName()))
                .toList();
            return ApiResponse.ofList(names);
        }

        Specification<TpaBranchEntity> spec = (root, query, cb) -> {
            List<Predicate> all = new ArrayList<>();
            if (branchName != null && !branchName.isBlank()) {
                all.add(cb.like(cb.lower(root.get("branchName")), "%" + branchName.trim().toLowerCase() + "%"));
            }
            if (recordStatus != null && !recordStatus.isBlank() && !"All".equalsIgnoreCase(recordStatus)) {
                all.add(cb.equal(cb.lower(root.get("recordStatus")), recordStatus.trim().toLowerCase()));
            }
            if (serviceTypes != null && !serviceTypes.isEmpty()) {
                List<Predicate> anyType = serviceTypes.stream()
                    .filter(s -> s != null && !s.isBlank())
                    .map(s -> cb.like(cb.lower(root.get("serviceTypes")), "%" + s.trim().toLowerCase() + "%"))
                    .toList();
                if (!anyType.isEmpty()) all.add(cb.or(anyType.toArray(new Predicate[0])));
            }
            return cb.and(all.toArray(new Predicate[0]));
        };

        int pageIndex = Math.max(page, 0);
        int pageSize = size > 0 ? Math.min(size, 500) : 20;
        Page<TpaBranchEntity> result = branches.findAll(spec, PageRequest.of(pageIndex, pageSize, Sort.by("branchCode")));
        Map<String, String> parentNames = parentNames(result.getContent());
        Map<String, TpaEntity> tpaById = new HashMap<>();
        List<Map<String, Object>> rows = result.getContent().stream()
            .map(b -> TpaMapper.branch(b, tpaById.computeIfAbsent(b.getTpaId(), id -> tpas.findById(id).orElse(null)),
                parentNames.get(b.getParentBranchId())))
            .toList();
        return ApiResponse.success(rows, result.getTotalElements(), result.getTotalPages(), pageIndex, pageSize);
    }

    @GetMapping("/v1/tpa-branch/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> get(@PathVariable String id) {
        return branches.findById(id)
            .map(b -> ResponseEntity.ok(ApiResponse.success(view(b))))
            .orElseGet(() -> notFound());
    }

    @PostMapping("/v1/tpa/{tpaId}/tpa-branch")
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(@PathVariable String tpaId,
                                                                   @RequestBody Map<String, Object> body) {
        Optional<TpaEntity> tpa = tpas.findById(tpaId);
        if (tpa.isEmpty()) {
            return ResponseEntity.status(404).body(ApiResponse.error("TPA not found", 404));
        }
        String name = TpaMapper.text(body, "branchName");
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Branch name is required", 400));
        }
        if (branches.existsByTpaIdAndBranchNameIgnoreCase(tpaId, name)) {
            return ResponseEntity.status(409).body(ApiResponse.error("A branch named '" + name + "' already exists", 409));
        }
        String parentId = TpaMapper.text(body, "parentBranchId");
        if (parentId != null && !parentId.isBlank() && !branches.existsById(parentId)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Parent branch not found", 400));
        }

        TpaBranchEntity b = new TpaBranchEntity();
        b.setTpaBranchId(UUID.randomUUID().toString());
        b.setTpaId(tpaId);
        b.setTenantId(body.get("tenantId") != null ? TpaMapper.text(body, "tenantId") : tpa.get().getTenantId());
        b.setBranchCode(nextBranchCode(tpaId));
        apply(b, body);
        branches.save(b);
        return ResponseEntity.ok(ApiResponse.success("Branch created successfully", view(b)));
    }

    @PatchMapping("/v1/tpa-branch/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> update(@PathVariable String id,
                                                                   @RequestBody Map<String, Object> body) {
        Optional<TpaBranchEntity> found = branches.findById(id);
        if (found.isEmpty()) return notFound();
        TpaBranchEntity b = found.get();

        String newName = TpaMapper.text(body, "branchName");
        if (newName != null && !newName.equalsIgnoreCase(b.getBranchName())
                && branches.existsByTpaIdAndBranchNameIgnoreCase(b.getTpaId(), newName)) {
            return ResponseEntity.status(409).body(ApiResponse.error("A branch named '" + newName + "' already exists", 409));
        }
        String parentId = TpaMapper.text(body, "parentBranchId");
        if (parentId != null && parentId.equals(id)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("A branch cannot be its own parent", 400));
        }
        apply(b, body);
        branches.save(b);
        return ResponseEntity.ok(ApiResponse.success("Branch updated successfully", view(b)));
    }

    @PatchMapping("/v1/tpa-branch/{id}/toggle-status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggle(@PathVariable String id) {
        Optional<TpaBranchEntity> found = branches.findById(id);
        if (found.isEmpty()) return notFound();
        TpaBranchEntity b = found.get();
        b.setRecordStatus(TpaBranchEntity.ACTIVE.equals(b.getRecordStatus()) ? TpaBranchEntity.INACTIVE : TpaBranchEntity.ACTIVE);
        b.setUpdatedAt(LocalDateTime.now());
        branches.save(b);
        return ResponseEntity.ok(ApiResponse.success("Branch " + b.getRecordStatus().toLowerCase() + " now", view(b)));
    }

    @DeleteMapping("/v1/tpa-branch/{id}")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable String id) {
        if (!branches.existsById(id)) {
            return ResponseEntity.status(404).body(ApiResponse.error("Branch not found", 404));
        }
        Integer children = jdbc.queryForObject("select count(*) from tpa_branches where parent_branch_id = ?", Integer.class, id);
        Integer matrices = jdbc.queryForObject("select count(*) from escalation_matrix where tpa_branch_id = ?", Integer.class, id);
        if ((children != null && children > 0) || (matrices != null && matrices > 0)) {
            return ResponseEntity.status(409).body(ApiResponse.error(
                "Branch is in use (it has child branches or an escalation matrix). Make it inactive instead.", 409));
        }
        branches.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Branch deleted successfully", id));
    }

    // ---------------------------------------------------------------------------------------------

    private void apply(TpaBranchEntity b, Map<String, Object> body) {
        if (body.containsKey("branchName")) b.setBranchName(TpaMapper.text(body, "branchName"));
        if (body.containsKey("parentBranchId")) {
            String parent = TpaMapper.text(body, "parentBranchId");
            b.setParentBranchId(parent == null || parent.isBlank() ? null : parent);
        }
        if (body.containsKey("contactEmail")) b.setContactEmail(TpaMapper.join(body.get("contactEmail")));
        if (body.containsKey("contactPhone")) b.setContactPhone(TpaMapper.join(body.get("contactPhone")));
        if (body.containsKey("serviceType")) b.setServiceTypes(TpaMapper.join(body.get("serviceType")));
        if (body.containsKey("serviceTypes")) b.setServiceTypes(TpaMapper.join(body.get("serviceTypes")));
        if (body.containsKey("tags")) b.setTags(TpaMapper.join(body.get("tags")));
        TpaMapper.applyAddress(b.getAddress(), TpaMapper.map(body, "address"));
        b.setUpdatedAt(LocalDateTime.now());
    }

    private Map<String, Object> view(TpaBranchEntity b) {
        TpaEntity tpa = tpas.findById(b.getTpaId()).orElse(null);
        String parentName = b.getParentBranchId() == null ? null
            : branches.findById(b.getParentBranchId()).map(TpaBranchEntity::getBranchName).orElse(null);
        return TpaMapper.branch(b, tpa, parentName);
    }

    private Map<String, String> parentNames(List<TpaBranchEntity> rows) {
        Set<String> ids = rows.stream().map(TpaBranchEntity::getParentBranchId).filter(Objects::nonNull).collect(Collectors.toSet());
        return branches.findAllById(ids).stream()
            .collect(Collectors.toMap(TpaBranchEntity::getTpaBranchId, TpaBranchEntity::getBranchName));
    }

    /** Codes are 3 digits (001, 002, ...); the next one is one above the highest in use. */
    private String nextBranchCode(String tpaId) {
        int max = branches.findByTpaIdOrderByBranchCode(tpaId).stream()
            .map(TpaBranchEntity::getBranchCode)
            .filter(c -> c != null && c.matches("\\d+"))
            .mapToInt(Integer::parseInt)
            .max().orElse(0);
        return String.format("%03d", max + 1);
    }

    private static <T> ResponseEntity<ApiResponse<T>> notFound() {
        return ResponseEntity.status(404).body(ApiResponse.error("Branch not found", 404));
    }
}
