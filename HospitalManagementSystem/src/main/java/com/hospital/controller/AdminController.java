package com.hospital.controller;

import com.hospital.entity.AppointmentStatus;
import com.hospital.repository.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final PatientRepository patients;
    private final DoctorRepository doctors;
    private final AppointmentRepository appointments;
    private final UserRepository users;

    public AdminController(PatientRepository patients, DoctorRepository doctors,
                           AppointmentRepository appointments, UserRepository users) {
        this.patients = patients;
        this.doctors = doctors;
        this.appointments = appointments;
        this.users = users;
    }

    @GetMapping("/dashboard")
    public Map<String, Long> dashboard() {
        Map<String, Long> result = new LinkedHashMap<>();
        result.put("totalUsers", users.count());
        result.put("totalDoctors", doctors.count());
        result.put("totalPatients", patients.count());
        result.put("totalAppointments", appointments.count());
        result.put("scheduledAppointments", appointments.countByStatus(AppointmentStatus.SCHEDULED));
        result.put("completedAppointments", appointments.countByStatus(AppointmentStatus.COMPLETED));
        result.put("cancelledAppointments", appointments.countByStatus(AppointmentStatus.CANCELLED));
        return result;
    }
}