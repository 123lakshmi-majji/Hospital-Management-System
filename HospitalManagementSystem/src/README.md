# Hospital Management System

## Stack
Java + Spring Boot 4.1.1 + MySQL + Spring Data JPA + REST + Validation + Transactions + AOP + SOAP + Maven.

## Setup

1. Create the database:
```sql
CREATE DATABASE hospital_management;
```

2. Open `src/main/resources/application.properties`.

3. Replace:
```properties
spring.datasource.password=YOUR_MYSQL_PASSWORD
```
with your real MySQL password.

4. In Eclipse:
- Import as Existing Maven Project.
- Right-click project -> Maven -> Update Project.
- Run `HospitalManagementSystemApplication.java` as Spring Boot App.

REST base URL:
`http://localhost:8080`

SOAP WSDL:
`http://localhost:8080/ws/reports.wsdl`

## Demo users

| Username | Password | Role |
|---|---|---|
| admin | admin123 | ADMIN |
| reception | reception123 | RECEPTIONIST |
| doctor | doctor123 | DOCTOR |
| patient | patient123 | PATIENT |

The demo login is intentionally simple. For production, replace it with Spring Security/JWT.

## Main APIs

### Patient
POST `/api/patients`
GET `/api/patients`
GET `/api/patients/{id}`
PUT `/api/patients/{id}`
DELETE `/api/patients/{id}`

### Doctor
POST `/api/doctors`
GET `/api/doctors`
GET `/api/doctors/{id}`
PUT `/api/doctors/{id}`
DELETE `/api/doctors/{id}`

### Appointment
POST `/api/appointments?patientId=1&doctorId=1`
GET `/api/appointments`
GET `/api/appointments/{id}`
GET `/api/appointments/doctor/{doctorId}`
GET `/api/appointments/patient/{patientId}`
GET `/api/appointments/date/{yyyy-MM-dd}`
PUT `/api/appointments/{id}`
PATCH `/api/appointments/{id}/status`

### Medical record
POST `/api/medical-records?appointmentId=1`
GET `/api/medical-records/patient/{patientId}`

### Prescription
POST `/api/prescriptions?appointmentId=1`
GET `/api/prescriptions/patient/{patientId}`

### Admin
GET `/api/admin/dashboard`

### Login
POST `/api/auth/login`

## Patient JSON
```json
{
  "name": "Lakshmi",
  "age": 21,
  "gender": "Female",
  "phone": "9876543210",
  "email": "lakshmi@example.com",
  "address": "Andhra Pradesh",
  "bloodGroup": "O+",
  "emergencyContact": "9876500000"
}
```

## Doctor JSON
```json
{
  "name": "Dr. Ravi Kumar",
  "specialization": "Cardiologist",
  "phone": "9876543211",
  "email": "ravi@example.com",
  "experience": 10,
  "department": "Cardiology"
}
```

## Appointment JSON
```json
{
  "appointmentDate": "2026-09-25",
  "appointmentTime": "10:30:00",
  "reason": "Fever"
}
```

## Medical record JSON
```json
{
  "diagnosis": "Viral fever",
  "treatment": "Rest and medication",
  "notes": "Review after 3 days"
}
```

## Prescription JSON
```json
{
  "medicine": "Paracetamol",
  "dosage": "500 mg twice daily",
  "duration": "3 days",
  "instructions": "Take after food"
}
```
