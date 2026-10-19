package com.hospital.service;

import com.hospital.entity.Doctor;
import com.hospital.entity.User;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class DoctorService {
    private final DoctorRepository repository;
    private final UserRepository userRepository;

    public DoctorService(DoctorRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Doctor create(Doctor doctor) { return repository.save(doctor); }

    public List<Doctor> getAll() { return repository.findAll(); }

    public Doctor getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Doctor with ID " + id + " not found"));
    }

    @Transactional(readOnly = true)
    public Doctor findByUsername(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return repository.findByUserId(user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not linked to this user"));
    }

    @Transactional
    public Doctor update(Long id, Doctor input) {
        Doctor d = getById(id);
        d.setName(input.getName());
        d.setSpecialization(input.getSpecialization());
        d.setPhone(input.getPhone());
        d.setEmail(input.getEmail());
        d.setExperience(input.getExperience());
        d.setDepartment(input.getDepartment());
        return repository.save(d);
    }

    @Transactional
    public void delete(Long id) { repository.delete(getById(id)); }
}