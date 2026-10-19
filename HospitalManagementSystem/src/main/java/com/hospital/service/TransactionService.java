package com.hospital.service;

import com.hospital.entity.*;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository repo;
    private final NotificationService notificationService;

    public TransactionService(TransactionRepository repo, NotificationService notificationService) {
        this.repo = repo;
        this.notificationService = notificationService;
    }

    @Transactional
    public Transaction createPendingTransaction(Patient patient, Doctor doctor, Appointment appointment) {
        Transaction t = new Transaction();
        t.setReceiptNumber(generateReceiptNumber());
        t.setPatient(patient);
        t.setDoctor(doctor);
        t.setAppointment(appointment);
        t.setAmount(doctor.getConsultationFee() != null ? doctor.getConsultationFee() : 500.0);
        t.setStatus("PENDING");
        t.setPaymentMethod("PENDING");
        return repo.save(t);
    }

    @Transactional
    public Transaction markAsPaid(Long transactionId, String paymentMethod) {
        Transaction t = repo.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if ("PAID".equals(t.getStatus())) {
            throw new IllegalArgumentException("Transaction already paid");
        }

        t.setStatus("PAID");
        t.setPaymentMethod(paymentMethod);
        t.setPaidAt(LocalDateTime.now());
        Transaction saved = repo.save(t);

        // 🔔 Notify Doctor and Patient
        try {
            if (t.getDoctor().getUser() != null) {
                notificationService.sendToUser(
                    t.getDoctor().getUser(),
                    "Payment received: ₹" + t.getAmount() + " from " + t.getPatient().getName(),
                    "success"
                );
            }
            if (t.getPatient().getUser() != null) {
                notificationService.sendToUser(
                    t.getPatient().getUser(),
                    "Payment successful: ₹" + t.getAmount() + " for Dr. " + t.getDoctor().getName(),
                    "success"
                );
            }
        } catch (Exception e) {
            System.out.println("[NOTIF-ERR] " + e.getMessage());
        }

        return saved;
    }

    @Transactional(readOnly = true)
    public List<Transaction> getPatientHistory(Long patientId) {
        return repo.findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    @Transactional(readOnly = true)
    public List<Transaction> getDoctorHistory(Long doctorId) {
        return repo.findByDoctorIdOrderByCreatedAtDesc(doctorId);
    }

    @Transactional(readOnly = true)
    public List<Transaction> getAllTransactions() {
        return repo.findAllByOrderByCreatedAtDesc();
    }

    // Dashboard stats
    public Double getTotalRevenue() { return repo.getTotalRevenue(); }
    public Double getTodayRevenue() { return repo.getTodayRevenue(LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT)); }
    public Double getDoctorRevenue(Long docId) { return repo.getDoctorTotalRevenue(docId); }
    public Double getDoctorTodayRevenue(Long docId) { return repo.getDoctorTodayRevenue(docId, LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT)); }

    private String generateReceiptNumber() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = repo.count() + 1;
        return "TXN-" + date + "-" + String.format("%04d", count);
    }
}