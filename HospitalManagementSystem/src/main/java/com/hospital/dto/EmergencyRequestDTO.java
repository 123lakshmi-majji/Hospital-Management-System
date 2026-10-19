package com.hospital.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public class EmergencyRequestDTO {

    // ---------- Patient identity ----------
    @NotBlank(message = "Patient name is required (use 'Unknown' if unidentified)")
    private String name;

    @NotNull(message = "Estimated age is required")
    @Min(value = 0, message = "Age cannot be negative")
    @Max(value = 120, message = "Age must be 120 or below")
    private Integer age;

    @NotBlank(message = "Gender is required")
    private String gender;

    @NotBlank(message = "A contact number is required (use hospital or informant number)")
    @Pattern(regexp = "\\d{10}", message = "Phone must contain exactly 10 digits")
    private String phone;

    private String bloodGroup;
    private String address;

    // ---------- Incident details ----------
    private String incidentLocation;
    private LocalDateTime incidentDateTime;
    private String injuryDescription;

    // ---------- Informant / Brought by ----------
    private String broughtBy;
    private String broughtByPhone;
    private String informantName;
    private String informantPhone;

    // ---------- Medico-legal ----------
    private Boolean isMedicoLegal = true;
    private String policeStation;
    private String firNumber;

    // ---------- Attending ----------
    @NotBlank(message = "Attending doctor is required for emergency cases")
    private String attendingDoctor;
    private String emergencyNotes;

    // ---------- Getters & Setters ----------
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getIncidentLocation() { return incidentLocation; }
    public void setIncidentLocation(String incidentLocation) { this.incidentLocation = incidentLocation; }
    public LocalDateTime getIncidentDateTime() { return incidentDateTime; }
    public void setIncidentDateTime(LocalDateTime incidentDateTime) { this.incidentDateTime = incidentDateTime; }
    public String getInjuryDescription() { return injuryDescription; }
    public void setInjuryDescription(String injuryDescription) { this.injuryDescription = injuryDescription; }
    public String getBroughtBy() { return broughtBy; }
    public void setBroughtBy(String broughtBy) { this.broughtBy = broughtBy; }
    public String getBroughtByPhone() { return broughtByPhone; }
    public void setBroughtByPhone(String broughtByPhone) { this.broughtByPhone = broughtByPhone; }
    public String getInformantName() { return informantName; }
    public void setInformantName(String informantName) { this.informantName = informantName; }
    public String getInformantPhone() { return informantPhone; }
    public void setInformantPhone(String informantPhone) { this.informantPhone = informantPhone; }
    public Boolean getIsMedicoLegal() { return isMedicoLegal; }
    public void setIsMedicoLegal(Boolean isMedicoLegal) { this.isMedicoLegal = isMedicoLegal; }
    public String getPoliceStation() { return policeStation; }
    public void setPoliceStation(String policeStation) { this.policeStation = policeStation; }
    public String getFirNumber() { return firNumber; }
    public void setFirNumber(String firNumber) { this.firNumber = firNumber; }
    public String getAttendingDoctor() { return attendingDoctor; }
    public void setAttendingDoctor(String attendingDoctor) { this.attendingDoctor = attendingDoctor; }
    public String getEmergencyNotes() { return emergencyNotes; }
    public void setEmergencyNotes(String emergencyNotes) { this.emergencyNotes = emergencyNotes; }
}