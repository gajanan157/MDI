package com.mdindia.enrollment.workflow.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mdindia.enrollment.common.dto.ApiResponse;
import com.mdindia.enrollment.workflow.config.WebSocketConfig;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Lets other services push a notification to every browser connected to /ws/notifications.
 * Body: {"id","title","message","type":"SUCCESS|INFO|WARNING|ERROR","category","data":{...}}
 */
@RestController
@RequestMapping("/api/v1/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final WebSocketConfig.NotificationHandler notificationHandler;
    private final ObjectMapper objectMapper;

    public NotificationController(WebSocketConfig webSocketConfig, ObjectMapper objectMapper) {
        this.notificationHandler = webSocketConfig.getNotificationHandler();
        this.objectMapper = objectMapper;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<String>> publish(@RequestBody Map<String, Object> notification) {
        if (!(notification.get("category") instanceof String category) || category.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("category is required", 400));
        }
        try {
            notificationHandler.broadcast(objectMapper.writeValueAsString(notification));
            return ResponseEntity.ok(ApiResponse.success("Notification broadcast", "SUCCESS"));
        } catch (JsonProcessingException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Invalid notification payload", 400));
        }
    }
}
