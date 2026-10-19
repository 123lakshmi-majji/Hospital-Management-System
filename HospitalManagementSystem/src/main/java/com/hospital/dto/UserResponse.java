package com.hospital.dto;

import com.hospital.entity.User;

public class UserResponse {

    private Long id;
    private String username;
    private String role;

    public UserResponse() {}

    public static UserResponse from(User user) {
        UserResponse r = new UserResponse();
        r.id = user.getId();
        r.username = user.getUsername();
        r.role = user.getRole() != null ? user.getRole().name() : null;
        return r;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getRole() { return role; }
}