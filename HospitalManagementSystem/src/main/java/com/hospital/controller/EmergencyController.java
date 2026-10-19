package com.hospital.controller;

import com.hospital.dto.EmergencyRequestDTO;
import com.hospital.entity.Patient;
import com.hospital.service.EmergencyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emergency")
public class EmergencyController {

    private final EmergencyService service;

    public EmergencyController(EmergencyService service) {
        this.service = service;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public Patient registerEmergency(@Valid @RequestBody EmergencyRequestDTO dto) {
        return service.registerEmergency(dto);
    }

    @GetMapping("/cases")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','DOCTOR')")
    public List<Patient> getAllEmergencyCases() {
        return service.getAllEmergencyCases();
    }
}