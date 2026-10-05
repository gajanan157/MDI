package com.mdindia.enrollment.master.controller;

import com.mdindia.enrollment.common.dto.ApiResponse;
import com.mdindia.enrollment.master.auth.PasswordHasher;
import com.mdindia.enrollment.master.auth.TokenService;
import com.mdindia.enrollment.master.entity.UserEntity;
import com.mdindia.enrollment.master.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Local username/password login used when the UI runs without Keycloak (VITE_ENABLE_KEYCLOAK=false).
 * Tokens are stateless: logout is done by the client discarding its token.
 */
@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private static final String INVALID_LOGIN = "Invalid username or password";

    private final UserRepository userRepository;
    private final TokenService tokenService;

    public AuthController(UserRepository userRepository, TokenService tokenService) {
        this.userRepository = userRepository;
        this.tokenService = tokenService;
    }

    public record LoginRequest(String username, String password) {}

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@RequestBody(required = false) LoginRequest request) {
        if (request == null || isBlank(request.username()) || isBlank(request.password())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Username and password are required", 400));
        }
        Optional<UserEntity> user = userRepository.findById(request.username().trim());
        // Same message for unknown user and wrong password, so usernames cannot be probed.
        if (user.isEmpty() || !PasswordHasher.matches(request.password(), user.get().getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error(INVALID_LOGIN, 401));
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("accessToken", tokenService.issue(user.get()));
        body.put("tokenType", "Bearer");
        body.put("expiresIn", tokenService.ttlSeconds());
        body.put("user", userInfo(user.get()));
        return ResponseEntity.ok(ApiResponse.success("Login successful", body));
    }

    /** Validates the bearer token and returns the current user. */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> me(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        String token = authorization != null && authorization.startsWith("Bearer ")
            ? authorization.substring("Bearer ".length()).trim()
            : null;
        return tokenService.verify(token)
            .flatMap(claims -> userRepository.findById(String.valueOf(claims.get("preferred_username"))))
            .map(user -> ResponseEntity.ok(ApiResponse.success(userInfo(user))))
            .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Session expired or invalid", 401)));
    }

    public record SwitchRoleRequest(String role) {}

    /**
     * Switches the active role. The role is only granted if the user really holds it (checked against the
     * database, not the request), and it is returned inside a newly signed token, so it cannot be forged client-side.
     */
    @PostMapping("/switch-role")
    public ResponseEntity<ApiResponse<Map<String, Object>>> switchRole(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody(required = false) SwitchRoleRequest request) {
        String token = authorization != null && authorization.startsWith("Bearer ")
            ? authorization.substring("Bearer ".length()).trim()
            : null;
        Optional<UserEntity> user = tokenService.verify(token)
            .flatMap(claims -> userRepository.findById(String.valueOf(claims.get("preferred_username"))));
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Session expired or invalid", 401));
        }
        if (request == null || isBlank(request.role()) || !user.get().getAllRoles().contains(request.role())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("You do not have this role", 403));
        }
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("accessToken", tokenService.issue(user.get(), request.role()));
        body.put("tokenType", "Bearer");
        body.put("expiresIn", tokenService.ttlSeconds());
        return ResponseEntity.ok(ApiResponse.success("Role switched", body));
    }

    /** Tokens are stateless; the client discards its token. Kept so the UI has one call to make. */
    @PostMapping("/logout")
    public ApiResponse<String> logout() {
        return ApiResponse.success("Logged out", "SUCCESS");
    }

    private static Map<String, Object> userInfo(UserEntity user) {
        Map<String, Object> info = new LinkedHashMap<>();
        String[] nameParts = Optional.ofNullable(user.getName()).orElse("").trim().split("\\s+", 2);
        info.put("sub", user.getUsername());
        info.put("preferred_username", user.getUsername());
        info.put("name", user.getName());
        info.put("given_name", nameParts[0]);
        info.put("family_name", nameParts.length > 1 ? nameParts[1] : "");
        info.put("email", user.getEmail());
        info.put("groupName", user.getGroupName());
        info.put("roles", user.getAllRoles());
        return info;
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
