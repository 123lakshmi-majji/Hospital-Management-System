package com.hospital.soap;

import com.hospital.entity.AppointmentStatus;
import com.hospital.repository.*;
import org.springframework.ws.server.endpoint.annotation.*;
import javax.xml.transform.Source;
import javax.xml.transform.stream.StreamSource;
import java.io.StringReader;

@Endpoint
public class ReportEndpoint {

    private static final String NAMESPACE = "http://hospital.com/reports";

    private final PatientRepository patients;
    private final DoctorRepository doctors;
    private final AppointmentRepository appointments;
    private final MedicalRecordRepository medicalRecords;
    private final UserRepository users;

    public ReportEndpoint(PatientRepository patients,
                          DoctorRepository doctors,
                          AppointmentRepository appointments,
                          MedicalRecordRepository medicalRecords,
                          UserRepository users) {
        this.patients = patients;
        this.doctors = doctors;
        this.appointments = appointments;
        this.medicalRecords = medicalRecords;
        this.users = users;
    }

    // ---------------------------------------------------
    // REPORT 1: Patient Report
    // ---------------------------------------------------
    @PayloadRoot(namespace = NAMESPACE, localPart = "getPatientReportRequest")
    @ResponsePayload
    public Source getPatientReport(@RequestPayload Source request) {
        long totalPatients = patients.count();
        long totalDoctors = doctors.count();
        long totalUsers = users.count();

        String xml =
            "<tns:getPatientReportResponse xmlns:tns=\"" + NAMESPACE + "\">" +
                "<tns:totalPatients>" + totalPatients + "</tns:totalPatients>" +
                "<tns:message>Total Patients: " + totalPatients +
                    " | Total Doctors: " + totalDoctors +
                    " | Total Users: " + totalUsers + "</tns:message>" +
            "</tns:getPatientReportResponse>";

        return new StreamSource(new StringReader(xml));
    }

    // ---------------------------------------------------
    // REPORT 2: Appointment Report
    // ---------------------------------------------------
    @PayloadRoot(namespace = NAMESPACE, localPart = "getAppointmentReportRequest")
    @ResponsePayload
    public Source getAppointmentReport(@RequestPayload Source request) {
        long total = appointments.count();
        long scheduled = appointments.countByStatus(AppointmentStatus.SCHEDULED);
        long completed = appointments.countByStatus(AppointmentStatus.COMPLETED);
        long cancelled = appointments.countByStatus(AppointmentStatus.CANCELLED);

        String xml =
            "<tns:getAppointmentReportResponse xmlns:tns=\"" + NAMESPACE + "\">" +
                "<tns:totalAppointments>" + total + "</tns:totalAppointments>" +
                "<tns:scheduled>" + scheduled + "</tns:scheduled>" +
                "<tns:completed>" + completed + "</tns:completed>" +
                "<tns:cancelled>" + cancelled + "</tns:cancelled>" +
            "</tns:getAppointmentReportResponse>";

        return new StreamSource(new StringReader(xml));
    }

    // ---------------------------------------------------
    // REPORT 3: Medical Record Report
    // ---------------------------------------------------
    @PayloadRoot(namespace = NAMESPACE, localPart = "getMedicalRecordReportRequest")
    @ResponsePayload
    public Source getMedicalRecordReport(@RequestPayload Source request) {
        long totalRecords = medicalRecords.count();

        String xml =
            "<tns:getMedicalRecordReportResponse xmlns:tns=\"" + NAMESPACE + "\">" +
                "<tns:totalMedicalRecords>" + totalRecords + "</tns:totalMedicalRecords>" +
                "<tns:message>Total Medical Records: " + totalRecords + "</tns:message>" +
            "</tns:getMedicalRecordReportResponse>";

        return new StreamSource(new StringReader(xml));
    }
}