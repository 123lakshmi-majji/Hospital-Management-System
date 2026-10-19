package com.hospital.controller;

import com.hospital.dto.*;
import com.hospital.entity.User;
import com.hospital.security.JwtUtil;
import com.hospital.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService service;
    private final JwtUtil jwtUtil;

    public AuthController(UserService service, JwtUtil jwtUtil) {
        this.service = service;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        User user = service.login(request.getUsername(), request.getPassword());
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return ResponseEntity.ok(new LoginResponse(token, user.getUsername(), user.getRole().name()));
    }

    @PostMapping("/register/patient")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse registerPatient(@Valid @RequestBody RegisterRequest request) {
        User saved = service.registerPatient(request);
        return UserResponse.from(saved);
    }

    @PostMapping("/register/staff")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse registerStaff(@Valid @RequestBody StaffRegisterRequest request) {
        User saved = service.registerStaff(request);
        return UserResponse.from(saved);
    }
}