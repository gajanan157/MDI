package com.mdindia.enrollment.master.controller;

import com.mdindia.enrollment.common.dto.ApiResponse;
import com.mdindia.enrollment.master.entity.BrokerEntity;
import com.mdindia.enrollment.master.repository.BrokerRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/v1/brokers", "/v1/broker"})
@CrossOrigin(origins = "*")
public class BrokerController {

    private final BrokerRepository repository;

    public BrokerController(BrokerRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ApiResponse<List<BrokerEntity>> getAll() {
        return ApiResponse.ofList(repository.findAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<BrokerEntity> getById(@PathVariable String id) {
        return repository.findById(id)
            .map(ApiResponse::success)
            .orElseGet(() -> ApiResponse.error("Broker not found", 404));
    }

    @PostMapping
    public ApiResponse<BrokerEntity> create(@RequestBody BrokerEntity broker) {
        if (broker.getBrokerId() == null || broker.getBrokerId().isBlank()) {
            broker.setBrokerId("BRK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        broker.setCreatedAt(LocalDateTime.now());
        if (broker.getStatus() == null) broker.setStatus("ACTIVE");
        BrokerEntity saved = repository.save(broker);
        return ApiResponse.success("Broker created successfully", saved);
    }
}
