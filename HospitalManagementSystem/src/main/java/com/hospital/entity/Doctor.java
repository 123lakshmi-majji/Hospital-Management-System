package com.hospital.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "doctors")
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Doctor name is required")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Specialization is required")
    private String specialization;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "\\d{10}", message = "Phone must contain exactly 10 digits")
    private String phone;

    @Email(message = "Enter a valid email")
    private String email;

    @Min(value = 0, message = "Experience cannot be negative")
    private int experience;

    private String department;
    
    // ✅ ADDED: Qualification field
    private String qualification; 

    // 💰 NEW: Consultation Fee
    @Column(name = "consultation_fee")
    private Double consultationFee = 500.0;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    public Doctor() {}

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public int getExperience() { return experience; }
    public void setExperience(int experience) { this.experience = experience; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public Double getConsultationFee() { return consultationFee; }
    public void setConsultationFee(Double consultationFee) { this.consultationFee = consultationFee; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    // ✅ ADDED: Getter and Setter for Qualification
    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }
}