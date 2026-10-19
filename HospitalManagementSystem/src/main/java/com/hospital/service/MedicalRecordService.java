package com.hospital.service;

import com.hospital.entity.*;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.MedicalRecordRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MedicalRecordService {
    private final MedicalRecordRepository recordRepository;
    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;

    public MedicalRecordService(MedicalRecordRepository recordRepository,
                                AppointmentRepository appointmentRepository,
                                NotificationService notificationService) {
        this.recordRepository = recordRepository;
        this.appointmentRepository = appointmentRepository;
        this.notificationService = notificationService;
    }

    public MedicalRecord create(MedicalRecord record, Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment with ID " + appointmentId + " not found"));

        record.setAppointment(appointment);
        record.setPatient(appointment.getPatient());
        record.setDoctor(appointment.getDoctor());

        MedicalRecord saved = recordRepository.save(record);

        try {
            if (appointment.getPatient().getUser() != null) {
                notificationService.sendToUser(
                    appointment.getPatient().getUser(),
                    appointment.getDoctor().getName() + " added a medical record: " + record.getDiagnosis(),
                    "record"
                );
            }
        } catch (Exception e) {
            System.out.println("[NOTIF-ERR] record: " + e.getMessage());
        }

        return saved;
    }

    public List<MedicalRecord> getByPatient(Long id) {
        return recordRepository.findByPatientId(id);
    }
}