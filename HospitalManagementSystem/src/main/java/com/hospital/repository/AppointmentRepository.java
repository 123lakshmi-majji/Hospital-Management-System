package com.hospital.repository;

import com.hospital.entity.Appointment;
import com.hospital.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByDoctorId(Long doctorId);
    List<Appointment> findByPatientId(Long patientId);
    List<Appointment> findByAppointmentDate(LocalDate date);
    List<Appointment> findByStatus(AppointmentStatus status);

    List<Appointment> findByStatusIn(List<AppointmentStatus> statuses);

    long countByStatus(AppointmentStatus status);

    // ✅ ADDED: Used by the frontend to show which slots are already booked
    List<Appointment> findByDoctorIdAndAppointmentDate(Long doctorId, LocalDate appointmentDate);

    @Query("SELECT COUNT(a) > 0 FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate = :date AND a.appointmentTime = :time AND a.status <> 'CANCELLED'")
    boolean existsDoctorConflict(@Param("doctorId") Long doctorId, @Param("date") LocalDate date, @Param("time") LocalTime time);

    @Query("SELECT COUNT(a) > 0 FROM Appointment a WHERE a.patient.id = :patientId AND a.appointmentDate = :date AND a.appointmentTime = :time AND a.status <> 'CANCELLED'")
    boolean existsPatientConflict(@Param("patientId") Long patientId, @Param("date") LocalDate date, @Param("time") LocalTime time);
}