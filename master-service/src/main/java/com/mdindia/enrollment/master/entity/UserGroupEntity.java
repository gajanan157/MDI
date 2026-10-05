package com.mdindia.enrollment.master.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@Table(name = "user_groups")
public class UserGroupEntity {
    @Id
    private String groupName;
    private String description;

    public UserGroupEntity() {}

    public UserGroupEntity(String groupName, String description) {
        this.groupName = groupName;
        this.description = description;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String groupName;
        private String description;
        public Builder groupName(String gn) { this.groupName = gn; return this; }
        public Builder description(String d) { this.description = d; return this; }
        public UserGroupEntity build() { return new UserGroupEntity(groupName, description); }
    }

    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }
    /**
     * The UI looks groups up by {@code name} (the Keycloak group field) and calls
     * /groups/{name}/members with it. Expose groupName under that key as well.
     * JPA uses field access here (@Id is on the field), so these getters are not persisted.
     */
    @JsonProperty(value = "name", access = JsonProperty.Access.READ_ONLY)
    public String getName() { return groupName; }

    @JsonProperty(value = "id", access = JsonProperty.Access.READ_ONLY)
    public String getId() { return groupName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
