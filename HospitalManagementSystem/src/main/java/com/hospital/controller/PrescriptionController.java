package com.hospital.controller;

import com.hospital.entity.Prescription;
import com.hospital.service.PrescriptionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {
    private final PrescriptionService service;

    public PrescriptionController(PrescriptionService service) { this.service = service; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public Prescription create(@RequestParam Long appointmentId,
                               @Valid @RequestBody Prescription prescription) {
        return service.create(prescription, appointmentId);
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PATIENT')")
    public List<Prescription> getByPatient(@PathVariable Long patientId) {
        return service.getByPatient(patientId);
    }
}