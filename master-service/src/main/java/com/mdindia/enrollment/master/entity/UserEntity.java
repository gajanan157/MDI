package com.mdindia.enrollment.master.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Entity
@Table(name = "users")
public class UserEntity {
    @Id
    private String username;
    private String name;
    private String email;
    private String groupName;
    private String role;

    /** PBKDF2 hash (see PasswordHasher). Null means the user cannot log in. Never serialized. */
    @JsonIgnore
    private String passwordHash;

    /** Extra roles beyond {@link #role}, comma separated. */
    @JsonIgnore
    @Column(length = 2000)
    private String additionalRoles;

    public UserEntity() {}

    public UserEntity(String username, String name, String email, String groupName, String role) {
        this.username = username;
        this.name = name;
        this.email = email;
        this.groupName = groupName;
        this.role = role;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String username;
        private String name;
        private String email;
        private String groupName;
        private String role;
        private String passwordHash;
        private String additionalRoles;

        public Builder username(String u) { this.username = u; return this; }
        public Builder name(String n) { this.name = n; return this; }
        public Builder email(String e) { this.email = e; return this; }
        public Builder groupName(String g) { this.groupName = g; return this; }
        public Builder role(String r) { this.role = r; return this; }
        public Builder passwordHash(String h) { this.passwordHash = h; return this; }
        public Builder additionalRoles(String... roles) { this.additionalRoles = String.join(",", roles); return this; }

        public UserEntity build() {
            UserEntity user = new UserEntity(username, name, email, groupName, role);
            user.passwordHash = passwordHash;
            user.additionalRoles = additionalRoles;
            return user;
        }
    }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getAdditionalRoles() { return additionalRoles; }
    public void setAdditionalRoles(String additionalRoles) { this.additionalRoles = additionalRoles; }

    /** All roles, primary role first (the UI opens the dashboard of the first role). */
    @JsonIgnore
    public List<String> getAllRoles() {
        List<String> roles = new ArrayList<>();
        if (role != null && !role.isBlank()) roles.add(role);
        if (additionalRoles != null && !additionalRoles.isBlank()) {
            Arrays.stream(additionalRoles.split(","))
                .map(String::trim)
                .filter(r -> !r.isEmpty() && !roles.contains(r))
                .forEach(roles::add);
        }
        return roles;
    }
}
