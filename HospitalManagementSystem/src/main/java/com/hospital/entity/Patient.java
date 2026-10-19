package com.hospital.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "patients")
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    @Column(nullable = false)
    private String name;

    @NotNull(message = "Age is required")
    @Min(value = 0, message = "Age cannot be negative")
    @Max(value = 120, message = "Age must be 120 or below")
    private Integer age;

    @NotBlank(message = "Gender is required")
    private String gender;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "\\d{10}", message = "Phone must contain exactly 10 digits")
    @Column(nullable = false)
    private String phone;

    @Email(message = "Enter a valid email")
    private String email;

    private String address;
    private String bloodGroup;
    private String emergencyContact;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    // ---------- EMERGENCY / MEDICO-LEGAL CASE FIELDS ----------
    @Column(nullable = false)
    private Boolean isEmergency = false;

    @Column(nullable = false)
    private Boolean isMedicoLegal = false;

    @Column(unique = true)
    private String mlcNumber;

    private String broughtBy;
    private String broughtByPhone;
    private String policeStation;
    private String firNumber;
    private String incidentLocation;
    private LocalDateTime incidentDateTime;
    private String informantName;
    private String informantPhone;
    private String injuryDescription;
    private String emergencyNotes;
    private String attendingDoctor;
    private LocalDateTime registeredAt;

    public Patient() {}

    // ---------- Getters & Setters ----------
    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }
    public String getEmergencyContact() { return emergencyContact; }
    public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Boolean getIsEmergency() { return isEmergency; }
    public void setIsEmergency(Boolean isEmergency) { this.isEmergency = isEmergency; }
    public Boolean getIsMedicoLegal() { return isMedicoLegal; }
    public void setIsMedicoLegal(Boolean isMedicoLegal) { this.isMedicoLegal = isMedicoLegal; }
    public String getMlcNumber() { return mlcNumber; }
    public void setMlcNumber(String mlcNumber) { this.mlcNumber = mlcNumber; }
    public String getBroughtBy() { return broughtBy; }
    public void setBroughtBy(String broughtBy) { this.broughtBy = broughtBy; }
    public String getBroughtByPhone() { return broughtByPhone; }
    public void setBroughtByPhone(String broughtByPhone) { this.broughtByPhone = broughtByPhone; }
    public String getPoliceStation() { return policeStation; }
    public void setPoliceStation(String policeStation) { this.policeStation = policeStation; }
    public String getFirNumber() { return firNumber; }
    public void setFirNumber(String firNumber) { this.firNumber = firNumber; }
    public String getIncidentLocation() { return incidentLocation; }
    public void setIncidentLocation(String incidentLocation) { this.incidentLocation = incidentLocation; }
    public LocalDateTime getIncidentDateTime() { return incidentDateTime; }
    public void setIncidentDateTime(LocalDateTime incidentDateTime) { this.incidentDateTime = incidentDateTime; }
    public String getInformantName() { return informantName; }
    public void setInformantName(String informantName) { this.informantName = informantName; }
    public String getInformantPhone() { return informantPhone; }
    public void setInformantPhone(String informantPhone) { this.informantPhone = informantPhone; }
    public String getInjuryDescription() { return injuryDescription; }
    public void setInjuryDescription(String injuryDescription) { this.injuryDescription = injuryDescription; }
    public String getEmergencyNotes() { return emergencyNotes; }
    public void setEmergencyNotes(String emergencyNotes) { this.emergencyNotes = emergencyNotes; }
    public String getAttendingDoctor() { return attendingDoctor; }
    public void setAttendingDoctor(String attendingDoctor) { this.attendingDoctor = attendingDoctor; }
    public LocalDateTime getRegisteredAt() { return registeredAt; }
    public void setRegisteredAt(LocalDateTime registeredAt) { this.registeredAt = registeredAt; }
}