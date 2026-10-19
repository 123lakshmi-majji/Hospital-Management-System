package com.hospital.service;

import com.hospital.dto.RegisterRequest;
import com.hospital.dto.StaffRegisterRequest;
import com.hospital.entity.*;
import com.hospital.exception.AppointmentConflictException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository repository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.employee.registration-code}")
    private String employeeRegistrationCode;

    public UserService(UserRepository repository,
                       PatientRepository patientRepository,
                       DoctorRepository doctorRepository,
                       PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public User login(String username, String password) {
        User user = repository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid username or password"));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new ResourceNotFoundException("Invalid username or password");
        }
        return user;
    }

    /**
     * Registers a new PATIENT user.
     * 
     * Special case: if a Patient record with the same phone number already exists
     * (e.g., the receptionist registered them during a walk-in), that record is
     * LINKED to the new user — preserving all their medical history.
     */
    @Transactional
    public User registerPatient(RegisterRequest req) {
        // 1. Check username is free
        if (repository.findByUsername(req.getUsername()).isPresent()) {
            throw new AppointmentConflictException(
                    "Username '" + req.getUsername() + "' is already taken.");
        }

        // 2. Create the user with BCrypt-hashed password
        User user = new User(
                req.getUsername(),
                passwordEncoder.encode(req.getPassword()),
                Role.PATIENT
        );
        User savedUser = repository.save(user);

        // 3. Check if a Patient record already exists with the same phone
        //    (registered earlier by the receptionist during a walk-in)
        Optional<Patient> existingPatient = patientRepository.findAll().stream()
                .filter(p -> req.getPhone().equals(p.getPhone()))
                .filter(p -> p.getUser() == null)   // not already linked
                .findFirst();

        if (existingPatient.isPresent()) {
            // LINK the existing patient record to the new user
            Patient p = existingPatient.get();
            p.setUser(savedUser);
            // Update email / address if the patient provided new info
            if (req.getEmail() != null && !req.getEmail().isBlank()) {
                p.setEmail(req.getEmail());
            }
            if (req.getAddress() != null && !req.getAddress().isBlank()) {
                p.setAddress(req.getAddress());
            }
            if (req.getBloodGroup() != null && !req.getBloodGroup().isBlank()) {
                p.setBloodGroup(req.getBloodGroup());
            }
            if (req.getEmergencyContact() != null && !req.getEmergencyContact().isBlank()) {
                p.setEmergencyContact(req.getEmergencyContact());
            }
            patientRepository.save(p);
            System.out.println("[REGISTER] Linked existing patient '" + p.getName() +
                    "' (id=" + p.getId() + ") to new user '" + savedUser.getUsername() + "'");
        } else {
            // CREATE a new Patient profile
            Patient patient = new Patient();
            patient.setName(req.getName());
            patient.setAge(req.getAge());
            patient.setGender(req.getGender());
            patient.setPhone(req.getPhone());
            patient.setEmail(req.getEmail());
            patient.setAddress(req.getAddress());
            patient.setBloodGroup(req.getBloodGroup());
            patient.setEmergencyContact(req.getEmergencyContact());
            patient.setUser(savedUser);
            patientRepository.save(patient);
            System.out.println("[REGISTER] Created new patient for user '" + savedUser.getUsername() + "'");
        }

        return savedUser;
    }

    @Transactional
    public User registerStaff(StaffRegisterRequest req) {
        if (!employeeRegistrationCode.equals(req.getEmployeeCode())) {
            throw new IllegalArgumentException("Invalid employee code.");
        }

        Role role;
        try {
            role = Role.valueOf(req.getRole().toUpperCase());
        } catch (Exception e) {
            throw new IllegalArgumentException("Role must be DOCTOR or RECEPTIONIST.");
        }

        if (role != Role.DOCTOR && role != Role.RECEPTIONIST) {
            throw new IllegalArgumentException(
                    "Only DOCTOR and RECEPTIONIST can self-register.");
        }

        if (repository.findByUsername(req.getUsername()).isPresent()) {
            throw new AppointmentConflictException(
                    "Username '" + req.getUsername() + "' is already taken.");
        }

        User user = new User(
                req.getUsername(),
                passwordEncoder.encode(req.getPassword()),
                role
        );
        User savedUser = repository.save(user);

        if (role == Role.DOCTOR) {
            if (req.getSpecialization() == null || req.getSpecialization().isBlank()) {
                throw new IllegalArgumentException("Specialization is required for doctors.");
            }

            Doctor doctor = new Doctor();
            doctor.setName(req.getName());
            doctor.setSpecialization(req.getSpecialization());
            doctor.setDepartment(req.getDepartment());
            doctor.setPhone(req.getPhone());
            doctor.setEmail(req.getEmail());
            doctor.setExperience(req.getExperience() != null ? req.getExperience() : 0);
            
            // ✅ ADDED: Save the qualification
            doctor.setQualification(req.getQualification()); 
            
            doctor.setUser(savedUser);
            doctorRepository.save(doctor);
        }

        return savedUser;
    }

    @Transactional
    public User register(String username, String rawPassword, Role role) {
        User user = new User(username, passwordEncoder.encode(rawPassword), role);
        return repository.save(user);
    }

    @Transactional(readOnly = true)
    public List<User> findAll() { return repository.findAll(); }

    @Transactional(readOnly = true)
    public User findByUsername(String username) {
        return repository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }
}