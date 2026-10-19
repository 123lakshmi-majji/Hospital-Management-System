package com.hospital.repository;

import com.hospital.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    List<Transaction> findByDoctorIdOrderByCreatedAtDesc(Long doctorId);
    List<Transaction> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.status = 'PAID'")
    Double getTotalRevenue();

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.status = 'PAID' AND t.doctor.id = :doctorId")
    Double getDoctorTotalRevenue(Long doctorId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.status = 'PAID' AND t.paidAt >= :startOfDay")
    Double getTodayRevenue(LocalDateTime startOfDay);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.status = 'PAID' AND t.doctor.id = :doctorId AND t.paidAt >= :startOfDay")
    Double getDoctorTodayRevenue(Long doctorId, LocalDateTime startOfDay);
}