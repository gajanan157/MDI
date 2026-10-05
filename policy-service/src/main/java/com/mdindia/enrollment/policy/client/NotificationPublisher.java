package com.mdindia.enrollment.policy.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * Sends notifications to workflow-service, which broadcasts them over /ws/notifications.
 * Delivery is best effort and asynchronous: a failure is logged and never affects the caller.
 */
@Component
public class NotificationPublisher {

    public static final String CATEGORY_WORK_ITEM_ASSIGNED = "WORK_ITEM_ASSIGNED";

    private static final Logger log = LoggerFactory.getLogger(NotificationPublisher.class);

    private final RestClient restClient;

    public NotificationPublisher(@Value("${services.workflow.url:http://localhost:8084}") String workflowServiceUrl) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout((int) Duration.ofSeconds(2).toMillis());
        requestFactory.setReadTimeout((int) Duration.ofSeconds(3).toMillis());
        this.restClient = RestClient.builder()
                .baseUrl(workflowServiceUrl)
                .requestFactory(requestFactory)
                .build();
    }

    public void workItemAssigned(String inwardNo, String policyNo, String username, String displayName) {
        Map<String, Object> data = new HashMap<>();
        data.put("inwardNo", inwardNo);
        data.put("policyNo", policyNo);
        data.put("assignedTo", username);
        data.put("assignedToName", displayName);

        Map<String, Object> notification = new HashMap<>();
        // Same id as the assigning user's own toast, so their browser shows one toast, not two.
        notification.put("id", "work-item-assigned-" + inwardNo);
        notification.put("title", "Work item assigned");
        notification.put("message", inwardNo + " assigned to " + displayName);
        notification.put("type", "INFO");
        notification.put("category", CATEGORY_WORK_ITEM_ASSIGNED);
        notification.put("data", data);
        publish(notification);
    }

    private void publish(Map<String, Object> notification) {
        CompletableFuture.runAsync(() -> {
            try {
                restClient.post()
                        .uri("/api/v1/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(notification)
                        .retrieve()
                        .toBodilessEntity();
            } catch (Exception e) {
                log.warn("Could not publish {} notification: {}", notification.get("category"), e.getMessage());
            }
        });
    }
}
