package com.hospital.service;

import com.hospital.entity.Patient;
import com.hospital.entity.User;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PatientService {
    private final PatientRepository repository;
    private final UserRepository userRepository;

    public PatientService(PatientRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Patient create(Patient patient) {
        // Receptionist registers a walk-in patient — no login credentials yet.
        // If the patient later signs up at /signup/patient, the account will be linked.
        return repository.save(patient);
    }

    public List<Patient> getAll() { return repository.findAll(); }

    public Patient getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Patient with ID " + id + " not found"));
    }

    @Transactional(readOnly = true)
    public Patient findByUsername(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return repository.findByUserId(user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Patient profile not linked to this user"));
    }

    @Transactional
    public Patient update(Long id, Patient input) {
        Patient p = getById(id);
        p.setName(input.getName());
        p.setAge(input.getAge());
        p.setGender(input.getGender());
        p.setPhone(input.getPhone());
        p.setEmail(input.getEmail());
        p.setAddress(input.getAddress());
        p.setBloodGroup(input.getBloodGroup());
        p.setEmergencyContact(input.getEmergencyContact());
        return repository.save(p);
    }

    @Transactional
    public void delete(Long id) { repository.delete(getById(id)); }
}