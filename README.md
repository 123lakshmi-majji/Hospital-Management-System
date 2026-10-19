# 🏥 Hospivexa - Hospital Management System

A comprehensive, full-stack Hospital Management System designed to streamline hospital operations. It provides distinct, secure portals for Admins, Doctors, Receptionists, and Patients to manage appointments, medical records, billing, and emergency cases efficiently.

## 🚀 Tech Stack

* **Frontend:** React.js, Vite, React Router, Bootstrap / Custom CSS
* **Backend:** Java, Spring Boot, Spring Security (JWT), Spring Data JPA
* **Database:** MySQL
* **Tools:** VS Code, Eclipse / IntelliJ, MySQL Workbench, Postman

---

## ✨ Key Features

### 👨‍💼 Admin Dashboard
* View hospital-wide statistics (Total Patients, Doctors, Appointments).
* Track Total Revenue and Doctor-wise earnings with interactive filtering.
* Manage Doctors, Patients, and Medical Stores.

### 👨‍⚕️ Doctor Dashboard
* View upcoming and completed appointments.
* Add Medical Records (Diagnosis, Treatment, Notes).
* Write Prescriptions for patients.
* Receive real-time alerts for assigned Emergency / Medico-Legal Cases (MLC).

### 🏢 Receptionist Dashboard
* Register new patients (including walk-ins).
* Book appointments using an interactive Slot Picker (prevents double-booking).
* Register Emergency cases and assign them to specific doctors.
* Collect payments and generate bills.

### 🤒 Patient Dashboard
* Book appointments with real-time slot availability.
* Pay consultation fees securely via the simulated Payment Gateway (PhonePe/GPay/Card).
* View and download Medical Records and Prescriptions as PDF files.
* Track upcoming appointments with a live countdown.

---

## 📂 Project Structure

```text
Hospivexa/
│
├── hospital-frontend/         # React + Vite Frontend
│
├── HospitalManagementSystem/  # Spring Boot Backend (Maven)
│
├── database/                  # MySQL Database dumps
│   └── hospital_db.sql        # Complete DB schema and real-time data
│
└── README.md