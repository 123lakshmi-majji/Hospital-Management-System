package com.hospital.config;

import com.hospital.entity.*;
import com.hospital.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedUsers(UserRepository userRepo,
                                DoctorRepository doctorRepo,
                                PatientRepository patientRepo,
                                MedicalStoreRepository storeRepo,
                                PasswordEncoder encoder) {
        return args -> {
            createUser(userRepo, encoder, "admin",     "admin123",     Role.ADMIN);
            createUser(userRepo, encoder, "reception", "reception123", Role.RECEPTIONIST);

            User doctorUser  = createUser(userRepo, encoder, "doctor",  "doctor123",  Role.DOCTOR);
            User patientUser = createUser(userRepo, encoder, "patient", "patient123", Role.PATIENT);

            if (doctorRepo.findByUserId(doctorUser.getId()).isEmpty()) {
                Doctor d = new Doctor();
                d.setName("Dr. Demo");
                d.setSpecialization("General Medicine");
                d.setDepartment("General");
                d.setPhone("9999999999");
                d.setEmail("demo@hospital.com");
                d.setExperience(5);
                d.setUser(doctorUser);
                doctorRepo.save(d);
            }

            if (patientRepo.findByUserId(patientUser.getId()).isEmpty()) {
                Patient p = new Patient();
                p.setName("Demo Patient");
                p.setAge(30);
                p.setGender("Female");
                p.setPhone("8888888888");
                p.setEmail("demo.patient@example.com");
                p.setBloodGroup("O+");
                p.setUser(patientUser);
                patientRepo.save(p);
            }

            // ---------- Seed Medical Stores across Andhra Pradesh ----------
            if (storeRepo.count() == 0) {
                seedStore(storeRepo, "Hospivexa Visakhapatnam", "Visakhapatnam",
                    "12-1-45, Beach Road, Near RTC Complex", "0891234567",
                    17.6868, 83.2185, "8:00 AM - 11:00 PM", true);

                seedStore(storeRepo, "Hospivexa Vijayawada", "Vijayawada",
                    "MG Road, Opposite PWD Grounds", "0866234567",
                    16.5062, 80.6480, "Open 24 Hours", true);

                seedStore(storeRepo, "Hospivexa Guntur", "Guntur",
                    "4/2 Arundelpet, Near Bus Stand", "0863234567",
                    16.3067, 80.4365, "9:00 AM - 9:00 PM", false);

                seedStore(storeRepo, "Hospivexa Tirupati", "Tirupati",
                    "Near Railway Station, Tiruchanoor Road", "0877234567",
                    13.6288, 79.4192, "Open 24 Hours", true);

                seedStore(storeRepo, "Hospivexa Nellore", "Nellore",
                    "Grand Trunk Road, Near Gandhi Statue", "0861234567",
                    14.4426, 79.9865, "8:00 AM - 10:00 PM", false);

                seedStore(storeRepo, "Hospivexa Rajahmundry", "Rajahmundry",
                    "Main Road, Danavaipeta", "0883234567",
                    17.0005, 81.8040, "9:00 AM - 9:00 PM", false);

                seedStore(storeRepo, "Hospivexa Kurnool", "Kurnool",
                    "Bellary Road, Near Old Bus Stand", "0851834567",
                    15.8281, 78.0373, "8:00 AM - 11:00 PM", true);

                seedStore(storeRepo, "Hospivexa Anantapur", "Anantapur",
                    "Subhash Road, Near Clock Tower", "0855434567",
                    14.6819, 77.6006, "9:00 AM - 8:00 PM", false);

                System.out.println("=== 8 Medical Stores seeded across Andhra Pradesh ===");
            }

            System.out.println("=== Sample users ready (BCrypt hashed) ===");
            System.out.println("admin / admin123");
            System.out.println("reception / reception123");
            System.out.println("doctor / doctor123");
            System.out.println("patient / patient123");
        };
    }

    private void seedStore(MedicalStoreRepository repo, String name, String city,
                           String address, String phone, double lat, double lng,
                           String hours, boolean is24h) {
        MedicalStore s = new MedicalStore();
        s.setName(name);
        s.setCity(city);
        s.setAddress(address);
        s.setPhone(phone);
        s.setLatitude(lat);
        s.setLongitude(lng);
        s.setOpeningHours(hours);
        s.setHas24Hours(is24h);
        s.setIsActive(true);
        repo.save(s);
    }

    private User createUser(UserRepository repo, PasswordEncoder encoder,
                            String username, String password, Role role) {
        return repo.findByUsername(username).orElseGet(() ->
                repo.save(new User(username, encoder.encode(password), role))
        );
    }
}