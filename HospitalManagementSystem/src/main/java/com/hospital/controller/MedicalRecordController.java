package com.hospital.controller;

import com.hospital.entity.MedicalRecord;
import com.hospital.service.MedicalRecordService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {
    private final MedicalRecordService service;

    public MedicalRecordController(MedicalRecordService service) { this.service = service; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public MedicalRecord create(@RequestParam Long appointmentId,
                                @Valid @RequestBody MedicalRecord record) {
        return service.create(record, appointmentId);
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PATIENT')")
    public List<MedicalRecord> getByPatient(@PathVariable Long patientId) {
        return service.getByPatient(patientId);
    }
}