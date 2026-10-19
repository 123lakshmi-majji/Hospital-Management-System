package com.hospital.service;

import com.hospital.dto.EmergencyRequestDTO;
import com.hospital.entity.Patient;
import com.hospital.entity.Role;
import com.hospital.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class EmergencyService {

    private final PatientRepository patientRepository;
    private final NotificationService notificationService;

    public EmergencyService(PatientRepository patientRepository,
                            NotificationService notificationService) {
        this.patientRepository = patientRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public Patient registerEmergency(EmergencyRequestDTO dto) {
        Patient p = new Patient();
        p.setName(dto.getName() == null || dto.getName().isBlank() ? "Unknown" : dto.getName());
        p.setAge(dto.getAge());
        p.setGender(dto.getGender());
        p.setPhone(dto.getPhone());
        p.setBloodGroup(dto.getBloodGroup());
        p.setAddress(dto.getAddress());
        p.setIsEmergency(true);
        p.setIsMedicoLegal(Boolean.TRUE.equals(dto.getIsMedicoLegal()));
        p.setMlcNumber(generateMlcNumber());
        p.setIncidentLocation(dto.getIncidentLocation());
        p.setIncidentDateTime(dto.getIncidentDateTime());
        p.setInjuryDescription(dto.getInjuryDescription());
        p.setBroughtBy(dto.getBroughtBy());
        p.setBroughtByPhone(dto.getBroughtByPhone());
        p.setInformantName(dto.getInformantName());
        p.setInformantPhone(dto.getInformantPhone());
        p.setPoliceStation(dto.getPoliceStation());
        p.setFirNumber(dto.getFirNumber());
        p.setAttendingDoctor(dto.getAttendingDoctor());
        p.setEmergencyNotes(dto.getEmergencyNotes());
        p.setRegisteredAt(LocalDateTime.now());
        p.setUser(null);

        Patient saved = patientRepository.save(p);

        // 🔔 Notify all DOCTORS + RECEPTIONISTS + ADMINS
        try {
            String msg = "EMERGENCY: " + saved.getName() +
                " (" + saved.getAge() + " yrs, " + saved.getGender() + ") — " +
                (saved.getIsMedicoLegal() ? "MLC " + saved.getMlcNumber() : "Non-MLC") +
                " · Attending: " + saved.getAttendingDoctor();

            notificationService.sendToRole(Role.DOCTOR, msg, "emergency");
            notificationService.sendToRole(Role.RECEPTIONIST, msg, "emergency");
            notificationService.sendToRole(Role.ADMIN, msg, "emergency");
        } catch (Exception e) {
            System.out.println("[NOTIF-ERR] emergency: " + e.getMessage());
        }

        return saved;
    }

    @Transactional(readOnly = true)
    public List<Patient> getAllEmergencyCases() {
        return patientRepository.findAll().stream()
                .filter(x -> Boolean.TRUE.equals(x.getIsEmergency()))
                .toList();
    }

    private String generateMlcNumber() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = patientRepository.count() + 1;
        String candidate = "MLC-" + date + "-" + String.format("%04d", count);
        while (mlcExists(candidate)) {
            count++;
            candidate = "MLC-" + date + "-" + String.format("%04d", count);
        }
        return candidate;
    }

    private boolean mlcExists(String mlcNumber) {
        for (Patient p : patientRepository.findAll()) {
            if (mlcNumber.equals(p.getMlcNumber())) return true;
        }
        return false;
    }
}