package com.mdindia.enrollment.policy.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Resolves usernames to display names using master-service's GET /api/v1/users.
 * Results are cached briefly. If master-service is unreachable, callers fall back to the username.
 */
@Component
public class UserDirectoryClient {

    private static final Logger log = LoggerFactory.getLogger(UserDirectoryClient.class);
    private static final Duration CACHE_TTL = Duration.ofSeconds(60);

    private final RestClient restClient;
    private volatile Map<String, String> namesByUsername = Collections.emptyMap();
    private volatile Instant loadedAt = Instant.EPOCH;

    public UserDirectoryClient(@Value("${services.master.url:http://localhost:8081}") String masterServiceUrl) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout((int) Duration.ofSeconds(2).toMillis());
        requestFactory.setReadTimeout((int) Duration.ofSeconds(3).toMillis());
        this.restClient = RestClient.builder()
                .baseUrl(masterServiceUrl)
                .requestFactory(requestFactory)
                .build();
    }

    /** Returns the user's display name, or the username itself when it cannot be resolved. */
    public String displayNameOf(String username) {
        if (username == null || username.isBlank()) {
            return username;
        }
        return names().getOrDefault(username, username);
    }

    private Map<String, String> names() {
        if (Instant.now().isAfter(loadedAt.plus(CACHE_TTL))) {
            refresh();
        }
        return namesByUsername;
    }

    private synchronized void refresh() {
        if (!Instant.now().isAfter(loadedAt.plus(CACHE_TTL))) {
            return; // another thread refreshed while we waited
        }
        try {
            Map<String, Object> body = restClient.get()
                    .uri("/api/v1/users")
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});
            Map<String, String> loaded = new HashMap<>();
            if (body != null && body.get("data") instanceof List<?> users) {
                for (Object entry : users) {
                    if (entry instanceof Map<?, ?> user
                            && user.get("username") instanceof String username
                            && user.get("name") instanceof String name
                            && !name.isBlank()) {
                        loaded.put(username, name);
                    }
                }
            }
            namesByUsername = loaded;
        } catch (Exception e) {
            // Keep the previous names; retry after the TTL instead of on every request.
            log.warn("Could not load user names from master-service: {}", e.getMessage());
        }
        loadedAt = Instant.now();
    }
}
