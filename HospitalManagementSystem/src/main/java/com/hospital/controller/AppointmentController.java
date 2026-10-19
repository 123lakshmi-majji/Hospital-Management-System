package com.hospital.controller;

import com.hospital.dto.AppointmentRequestDTO;
import com.hospital.entity.*;
import com.hospital.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    private final AppointmentService service;

    public AppointmentController(AppointmentService service) { this.service = service; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','PATIENT')")
    public Appointment create(@Valid @RequestBody AppointmentRequestDTO dto) {
        return service.create(dto);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','DOCTOR')")
    public List<Appointment> getAll() { return service.getAll(); }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','DOCTOR','PATIENT')")
    public Appointment getById(@PathVariable Long id) { return service.getById(id); }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','DOCTOR')")
    public List<Appointment> getByDoctor(@PathVariable Long doctorId) {
        return service.getByDoctor(doctorId);
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','DOCTOR','PATIENT')")
    public List<Appointment> getByPatient(@PathVariable Long patientId) {
        return service.getByPatient(patientId);
    }

    @GetMapping("/date/{date}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','DOCTOR')")
    public List<Appointment> getByDate(@PathVariable LocalDate date) {
        return service.getByDate(date);
    }

    // ✅ ADDED: Endpoint to get booked time slots for a specific doctor on a specific date
    @GetMapping("/doctor/{doctorId}/booked-slots")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','DOCTOR','PATIENT')")
    public List<String> getBookedSlots(
            @PathVariable Long doctorId,
            @RequestParam("date") String date) {
        return service.getBookedSlots(doctorId, LocalDate.parse(date));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','DOCTOR','PATIENT')")
    public Appointment updateStatus(@PathVariable Long id,
                                    @RequestBody Map<String, String> body) {
        return service.updateStatus(id, AppointmentStatus.valueOf(body.get("status").toUpperCase()));
    }
}