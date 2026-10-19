package com.hospital.controller;

import com.hospital.entity.Transaction;
import com.hospital.entity.User;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;
import com.hospital.service.TransactionService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService service;
    private final UserRepository userRepo;
    private final PatientRepository patientRepo;
    private final DoctorRepository doctorRepo;

    public TransactionController(TransactionService service, UserRepository userRepo,
                                 PatientRepository patientRepo, DoctorRepository doctorRepo) {
        this.service = service;
        this.userRepo = userRepo;
        this.patientRepo = patientRepo;
        this.doctorRepo = doctorRepo;
    }

    @GetMapping("/my")
    public List<Transaction> getMyPatientHistory(Authentication auth) {
        User user = userRepo.findByUsername(auth.getName()).orElseThrow();
        Long patId = patientRepo.findByUserId(user.getId()).orElseThrow().getId();
        return service.getPatientHistory(patId);
    }

    @GetMapping("/doctor")
    public List<Transaction> getDoctorHistory(Authentication auth) {
        User user = userRepo.findByUsername(auth.getName()).orElseThrow();
        Long docId = doctorRepo.findByUserId(user.getId()).orElseThrow().getId();
        return service.getDoctorHistory(docId);
    }

    @GetMapping("/admin")
    public List<Transaction> getAll() {
        return service.getAllTransactions();
    }

    @GetMapping("/admin/stats")
    public Map<String, Object> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRevenue", service.getTotalRevenue());
        stats.put("todayRevenue", service.getTodayRevenue());
        return stats;
    }

    @GetMapping("/doctor/stats")
    public Map<String, Object> getDoctorStats(Authentication auth) {
        User user = userRepo.findByUsername(auth.getName()).orElseThrow();
        Long docId = doctorRepo.findByUserId(user.getId()).orElseThrow().getId();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRevenue", service.getDoctorRevenue(docId));
        stats.put("todayRevenue", service.getDoctorTodayRevenue(docId));
        return stats;
    }

    @PostMapping("/{id}/pay")
    public Transaction pay(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return service.markAsPaid(id, body.getOrDefault("method", "UPI"));
    }
}