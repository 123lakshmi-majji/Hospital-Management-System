package com.hospital.service;

import com.hospital.entity.Appointment;
import com.hospital.entity.AppointmentStatus;
import com.hospital.entity.Doctor;
import com.hospital.entity.Patient;
import com.hospital.entity.User;
import com.hospital.repository.AppointmentRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class AppointmentReminderScheduler {

    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;

    public AppointmentReminderScheduler(AppointmentRepository appointmentRepository,
                                        NotificationService notificationService) {
        this.appointmentRepository = appointmentRepository;
        this.notificationService = notificationService;
    }

    /**
     * Runs every minute (60 seconds).
     * For every SCHEDULED or CONFIRMED appointment whose date/time is in the
     * next ~65 minutes AND hasn't had a reminder yet, it sends a
     * "1 hour left" notification to BOTH the doctor and the patient.
     *
     * Windows:
     *   - Lower bound: appointment must be in the future (not started)
     *   - Upper bound: appointment must be within 65 minutes from now
     *
     * This gives the scheduler a 5-minute tolerance so it doesn't miss an
     * appointment if the app was down for a moment.
     */
    @Scheduled(fixedRate = 60 * 1000, initialDelay = 30 * 1000)
    @Transactional
    public void sendHourBeforeReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime windowEnd = now.plusMinutes(65);

        List<Appointment> candidates = appointmentRepository.findByStatusIn(
                List.of(AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED)
        );

        int sent = 0;

        for (Appointment a : candidates) {
            // Skip if we already sent the reminder
            if (Boolean.TRUE.equals(a.getReminderSent())) continue;

            LocalDateTime apptDateTime = LocalDateTime.of(
                    a.getAppointmentDate(),
                    a.getAppointmentTime()
            );

            // Must be in the future
            if (!apptDateTime.isAfter(now)) continue;

            // Must be within the next 65 minutes
            if (apptDateTime.isAfter(windowEnd)) continue;

            long minutesLeft = ChronoUnit.MINUTES.between(now, apptDateTime);

            try {
                Doctor doctor = a.getDoctor();
                Patient patient = a.getPatient();

                // 🔔 Notify DOCTOR
                if (doctor != null) {
                    User doctorUser = doctor.getUser();
                    if (doctorUser != null) {
                        notificationService.sendToUser(
                                doctorUser,
                                "Your appointment with " + patient.getName() +
                                        " has only ~1 hour left (" + a.getAppointmentTime() + ")",
                                "appointment"
                        );
                    }
                }

                // 🔔 Notify PATIENT
                if (patient != null) {
                    User patientUser = patient.getUser();
                    if (patientUser != null) {
                        notificationService.sendToUser(
                                patientUser,
                                "Your appointment with " + doctor.getName() +
                                        " has only ~1 hour left (" + a.getAppointmentTime() + ")",
                                "appointment"
                        );
                    }
                }

                // Mark as sent so it never repeats
                a.setReminderSent(true);
                appointmentRepository.save(a);
                sent++;

                System.out.println("[REMINDER] Sent 1-hour reminder for appointment #" +
                        a.getId() + " (" + minutesLeft + " min left)");

            } catch (Exception e) {
                System.err.println("[REMINDER] Failed for appointment #" +
                        a.getId() + ": " + e.getMessage());
            }
        }

        if (sent > 0) {
            System.out.println("[REMINDER] ✅ Total reminders sent this run: " + sent);
        }
    }
}