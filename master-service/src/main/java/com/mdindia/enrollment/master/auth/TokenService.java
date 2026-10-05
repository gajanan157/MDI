package com.mdindia.enrollment.master.auth;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mdindia.enrollment.master.entity.UserEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.*;

/**
 * Issues and verifies HS256 JWTs for local (non-Keycloak) login.
 * Claims mirror Keycloak's layout (preferred_username, realm_access, resource_access["react-client"])
 * so the UI reads them exactly like a Keycloak token.
 */
@Service
public class TokenService {

    public static final String CLIENT_ID = "react-client";
    private static final Base64.Encoder B64 = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder B64_DECODE = Base64.getUrlDecoder();

    private final ObjectMapper objectMapper;
    private final byte[] secret;
    private final Duration ttl;

    public TokenService(ObjectMapper objectMapper,
                        @Value("${auth.jwt.secret}") String secret,
                        @Value("${auth.jwt.ttl:PT8H}") Duration ttl) {
        if (secret == null || secret.length() < 32) {
            throw new IllegalStateException("auth.jwt.secret must be at least 32 characters");
        }
        this.objectMapper = objectMapper;
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.ttl = ttl;
    }

    public long ttlSeconds() {
        return ttl.toSeconds();
    }

    public String issue(UserEntity user) {
        return issue(user, user.getRole());
    }

    /** Issues a token whose signed {@code active_role} claim is the role the user is currently working as. */
    public String issue(UserEntity user, String activeRole) {
        Instant now = Instant.now();
        List<String> roles = user.getAllRoles();
        String[] nameParts = Optional.ofNullable(user.getName()).orElse("").trim().split("\\s+", 2);

        Map<String, Object> claims = new LinkedHashMap<>();
        claims.put("sub", user.getUsername());
        claims.put("preferred_username", user.getUsername());
        claims.put("name", user.getName());
        claims.put("given_name", nameParts[0]);
        claims.put("family_name", nameParts.length > 1 ? nameParts[1] : "");
        claims.put("email", user.getEmail());
        claims.put("groups", user.getGroupName() == null ? List.of() : List.of("/" + user.getGroupName()));
        claims.put("realm_access", Map.of("roles", roles));
        claims.put("resource_access", Map.of(CLIENT_ID, Map.of("roles", roles)));
        claims.put("active_role", activeRole);
        claims.put("iat", now.getEpochSecond());
        claims.put("exp", now.plus(ttl).getEpochSecond());

        try {
            String header = B64.encodeToString("{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8));
            String payload = B64.encodeToString(objectMapper.writeValueAsBytes(claims));
            return header + "." + payload + "." + sign(header + "." + payload);
        } catch (Exception e) {
            throw new IllegalStateException("Could not create token", e);
        }
    }

    /** Returns the claims of a valid, unexpired token, or empty. */
    public Optional<Map<String, Object>> verify(String token) {
        if (token == null) return Optional.empty();
        String[] parts = token.split("\\.");
        if (parts.length != 3) return Optional.empty();
        try {
            byte[] expected = sign(parts[0] + "." + parts[1]).getBytes(StandardCharsets.US_ASCII);
            if (!MessageDigest.isEqual(expected, parts[2].getBytes(StandardCharsets.US_ASCII))) {
                return Optional.empty();
            }
            Map<String, Object> claims = objectMapper.readValue(
                B64_DECODE.decode(parts[1]), new TypeReference<Map<String, Object>>() {});
            if (!(claims.get("exp") instanceof Number exp) || exp.longValue() <= Instant.now().getEpochSecond()) {
                return Optional.empty();
            }
            return Optional.of(claims);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    private String sign(String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret, "HmacSHA256"));
        return B64.encodeToString(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
    }
}
