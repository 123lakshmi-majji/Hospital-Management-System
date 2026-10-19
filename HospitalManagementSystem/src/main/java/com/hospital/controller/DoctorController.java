package com.hospital.controller;

import com.hospital.entity.Doctor;
import com.hospital.service.DoctorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {
    private final DoctorService service;

    public DoctorController(DoctorService service) { this.service = service; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public Doctor create(@Valid @RequestBody Doctor doctor) { return service.create(doctor); }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','PATIENT','DOCTOR')")
    public List<Doctor> getAll() { return service.getAll(); }

    @GetMapping("/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public Doctor getMyProfile(Authentication authentication) {
        return service.findByUsername(authentication.getName());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','PATIENT','DOCTOR')")
    public Doctor getById(@PathVariable Long id) { return service.getById(id); }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public Doctor update(@PathVariable Long id, @Valid @RequestBody Doctor doctor) {
        return service.update(id, doctor);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) { service.delete(id); }
}