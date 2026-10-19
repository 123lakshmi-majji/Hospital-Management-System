package com.hospital.service;

import com.hospital.entity.*;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.PrescriptionRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;

    public PrescriptionService(PrescriptionRepository prescriptionRepository,
                                AppointmentRepository appointmentRepository,
                                NotificationService notificationService) {
        this.prescriptionRepository = prescriptionRepository;
        this.appointmentRepository = appointmentRepository;
        this.notificationService = notificationService;
    }

    public Prescription create(Prescription prescription, Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + appointmentId));

        prescription.setAppointment(appointment);
        prescription.setPatient(appointment.getPatient());
        prescription.setDoctor(appointment.getDoctor());

        Prescription saved = prescriptionRepository.save(prescription);

        try {
            User patientUser = appointment.getPatient().getUser();
            if (patientUser != null) {
                notificationService.sendToUser(
                    patientUser,
                    appointment.getDoctor().getName() + " prescribed: " + prescription.getMedicine(),
                    "prescription"
                );
            }
        } catch (Exception e) {
            System.out.println("[NOTIF-ERR] prescription: " + e.getMessage());
        }

        return saved;
    }

    public List<Prescription> getByPatient(Long id) {
        return prescriptionRepository.findByPatientId(id);
    }
}