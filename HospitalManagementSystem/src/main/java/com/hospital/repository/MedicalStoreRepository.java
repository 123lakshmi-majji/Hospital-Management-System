package com.hospital.repository;

import com.hospital.entity.MedicalStore;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicalStoreRepository extends JpaRepository<MedicalStore, Long> {
    List<MedicalStore> findByIsActiveTrue();
}