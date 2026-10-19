package com.hospital.service;

import com.hospital.dto.AppointmentRequestDTO;
import com.hospital.entity.*;
import com.hospital.exception.AppointmentConflictException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final NotificationService notificationService;
    private final TransactionService transactionService;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              PatientRepository patientRepository,
                              DoctorRepository doctorRepository,
                              NotificationService notificationService,
                              TransactionService transactionService) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.notificationService = notificationService;
        this.transactionService = transactionService;
    }

    public Appointment create(AppointmentRequestDTO dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
            .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        if (appointmentRepository.existsDoctorConflict(doctor.getId(), dto.getAppointmentDate(), dto.getAppointmentTime())) {
            throw new AppointmentConflictException("Doctor is already booked at this time.");
        }

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(dto.getAppointmentDate());
        appointment.setAppointmentTime(dto.getAppointmentTime());
        appointment.setReason(dto.getReason());
        appointment.setStatus(AppointmentStatus.SCHEDULED);

        Appointment saved = appointmentRepository.save(appointment);

        try {
            transactionService.createPendingTransaction(patient, doctor, saved);
        } catch (Exception e) {
            System.out.println("[TXN-ERR] Failed to create pending transaction: " + e.getMessage());
        }

        try {
            if (doctor.getUser() != null) {
                notificationService.sendToUser(doctor.getUser(),
                    "New appointment: " + patient.getName() + " on " + dto.getAppointmentDate(),
                    "appointment");
            }
        } catch (Exception e) {}

        return saved;
    }

    public List<Appointment> getAll() { return appointmentRepository.findAll(); }

    public Appointment getById(Long id) {
        return appointmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
    }

    public List<Appointment> getByDoctor(Long id) { return appointmentRepository.findByDoctorId(id); }
    public List<Appointment> getByPatient(Long id) { return appointmentRepository.findByPatientId(id); }
    public List<Appointment> getByDate(LocalDate date) { return appointmentRepository.findByAppointmentDate(date); }

    // ✅ ADDED: Fetch booked slots for a specific doctor on a date
    public List<String> getBookedSlots(Long doctorId, LocalDate date) {
        List<Appointment> appointments = appointmentRepository.findByDoctorIdAndAppointmentDate(doctorId, date);
        return appointments.stream()
                .filter(appt -> appt.getStatus() != AppointmentStatus.CANCELLED)
                .map(appt -> appt.getAppointmentTime().toString())
                .collect(Collectors.toList());
    }

    public Appointment updateStatus(Long id, AppointmentStatus newStatus) {
        Appointment a = getById(id);
        if (a.getStatus() == AppointmentStatus.COMPLETED && newStatus == AppointmentStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot cancel completed appointment");
        }
        a.setStatus(newStatus);
        return appointmentRepository.save(a);
    }
}