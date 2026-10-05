package com.mdindia.enrollment.master.controller;

import com.mdindia.enrollment.master.entity.AgentEntity;
import com.mdindia.enrollment.master.repository.AgentRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/v1/agents", "/v1/agent"})
@CrossOrigin(origins = "*")
public class AgentController {

    public static class ApiResponse<T> {
        private boolean success;
        private String message;
        private int statusCode;
        private T data;

        private ApiResponse(boolean success, String message, int statusCode, T data) {
            this.success = success;
            this.message = message;
            this.statusCode = statusCode;
            this.data = data;
        }

        public static <T> ApiResponse<T> success(T data) {
            return new ApiResponse<>(true, "Success", 200, data);
        }

        public static <T> ApiResponse<T> success(String message, T data) {
            return new ApiResponse<>(true, message, 200, data);
        }

        public static <T> ApiResponse<List<T>> ofList(List<T> data) {
            return new ApiResponse<>(true, "Success", 200, data);
        }

        public static <T> ApiResponse<T> error(String message, int statusCode) {
            return new ApiResponse<>(false, message, statusCode, null);
        }

        public boolean isSuccess() {
            return success;
        }

        public String getMessage() {
            return message;
        }

        public int getStatusCode() {
            return statusCode;
        }

        public T getData() {
            return data;
        }
    }

    private final AgentRepository repository;

    public AgentController(AgentRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ApiResponse<List<AgentEntity>> getAll() {
        return ApiResponse.ofList(repository.findAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<AgentEntity> getById(@PathVariable String id) {
        return repository.findById(id)
            .map(ApiResponse::success)
            .orElseGet(() -> ApiResponse.error("Agent not found", 404));
    }

    @PostMapping
    public ApiResponse<AgentEntity> create(@RequestBody AgentEntity agent) {
        if (agent.getAgentId() == null || agent.getAgentId().isBlank()) {
            agent.setAgentId("AGT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        agent.setCreatedAt(LocalDateTime.now());
        if (agent.getStatus() == null) agent.setStatus("ACTIVE");
        AgentEntity saved = repository.save(agent);
        return ApiResponse.success("Agent created successfully", saved);
    }
}
