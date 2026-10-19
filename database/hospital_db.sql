-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: hospital_management
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointments` (
  `appointment_date` date NOT NULL,
  `appointment_time` time NOT NULL,
  `reminder_sent` bit(1) DEFAULT NULL,
  `doctor_id` bigint NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `patient_id` bigint NOT NULL,
  `reason` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('CANCELLED','COMPLETED','CONFIRMED','SCHEDULED') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKmujeo4tymoo98cmf7uj3vsv76` (`doctor_id`),
  KEY `FK8exap5wmg8kmb1g1rx3by21yt` (`patient_id`),
  CONSTRAINT `FK8exap5wmg8kmb1g1rx3by21yt` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`),
  CONSTRAINT `FKmujeo4tymoo98cmf7uj3vsv76` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
INSERT INTO `appointments` VALUES ('2026-10-20','10:00:00',_binary '\0',6,1,4,'Arrhythmia','SCHEDULED'),('2026-10-19','16:00:00',_binary '',10,2,5,'Psoriasis','COMPLETED');
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctors`
--

DROP TABLE IF EXISTS `doctors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctors` (
  `consultation_fee` double DEFAULT NULL,
  `experience` int NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `department` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `specialization` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `qualification` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKt1f6cueqyjwx5ghew9ar1exe3` (`user_id`),
  CONSTRAINT `FKe9pf5qtxxkdyrwibaevo9frtk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `doctors_chk_1` CHECK ((`experience` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctors`
--

LOCK TABLES `doctors` WRITE;
/*!40000 ALTER TABLE `doctors` DISABLE KEYS */;
INSERT INTO `doctors` VALUES (500,11,5,13,'Gynecologist','lakshmi112006u@gmail.com','Lakshmi Majji','9346583466','Gynecology','MBBS, MS (Obstetrics & Gynaecology)'),(500,10,6,14,'Cardio specialist','rahul123@gmail.com','Rahul Pal','9874563211','Cardiology','MBBS, MD, DM (Cardiology)'),(500,12,7,15,'Nephrologist','sivani123@gmail.com','M.V.L.Sivani','9848685672','Nephrology','MBBS, MD, DM (Nephrology)'),(500,13,8,16,'Neurologist','sadvika123@gmail.com','P. Sadvika','9785466125','Neurology','MBBS, MD, DM (Neurology)'),(500,14,9,17,'Orthopedist','jyothi123@gmail.com','Ganta Jyothi Prabha','8341414042','Orthopedic','MBBS MS Orthopaedics'),(500,15,10,18,'Dermatologist','satya123@gmail.com','Y. Satya','7748577854','Dermatology','MBBS, MD (Dermatology, Venereology & Leprosy)');
/*!40000 ALTER TABLE `doctors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medical_records`
--

DROP TABLE IF EXISTS `medical_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medical_records` (
  `appointment_id` bigint DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `doctor_id` bigint NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `patient_id` bigint NOT NULL,
  `diagnosis` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `treatment` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKifeec8p5v06rt258odelw8s7j` (`appointment_id`),
  KEY `FKtny13k9v4o58styd47st3s2l5` (`doctor_id`),
  KEY `FKrav12h9aiw7pegjt62p8owwn3` (`patient_id`),
  CONSTRAINT `FKifeec8p5v06rt258odelw8s7j` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`),
  CONSTRAINT `FKrav12h9aiw7pegjt62p8owwn3` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`),
  CONSTRAINT `FKtny13k9v4o58styd47st3s2l5` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_records`
--

LOCK TABLES `medical_records` WRITE;
/*!40000 ALTER TABLE `medical_records` DISABLE KEYS */;
INSERT INTO `medical_records` VALUES (2,'2026-10-19 15:57:40.637591',10,1,5,'Psoriasis – chronic inflammatory skin condition causing red, scaly patches on the skin.','Attend dermatology follow-up to monitor symptoms and treatment response. Report worsening skin lesions, signs of infection, or joint pain and stiffness.','Recommend regular use of a fragrance-free moisturizer, gentle skin cleansing, and avoiding scratching. Dermatologist to assess severity and prescribe appropriate treatment.');
/*!40000 ALTER TABLE `medical_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medical_stores`
--

DROP TABLE IF EXISTS `medical_stores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medical_stores` (
  `has24_hours` bit(1) DEFAULT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `latitude` double NOT NULL,
  `longitude` double NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `opening_hours` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_stores`
--

LOCK TABLES `medical_stores` WRITE;
/*!40000 ALTER TABLE `medical_stores` DISABLE KEYS */;
INSERT INTO `medical_stores` VALUES (_binary '',_binary '',17.6868,83.2185,1,'12-1-45, Beach Road, Near RTC Complex','Visakhapatnam','Hospivexa Visakhapatnam','8:00 AM - 11:00 PM','0891234567'),(_binary '',_binary '',16.5062,80.648,2,'MG Road, Opposite PWD Grounds','Vijayawada','Hospivexa Vijayawada','Open 24 Hours','0866234567'),(_binary '\0',_binary '',16.3067,80.4365,3,'4/2 Arundelpet, Near Bus Stand','Guntur','Hospivexa Guntur','9:00 AM - 9:00 PM','0863234567'),(_binary '',_binary '',13.6288,79.4192,4,'Near Railway Station, Tiruchanoor Road','Tirupati','Hospivexa Tirupati','Open 24 Hours','0877234567'),(_binary '\0',_binary '',14.4426,79.9865,5,'Grand Trunk Road, Near Gandhi Statue','Nellore','Hospivexa Nellore','8:00 AM - 10:00 PM','0861234567'),(_binary '\0',_binary '',17.0005,81.804,6,'Main Road, Danavaipeta','Rajahmundry','Hospivexa Rajahmundry','9:00 AM - 9:00 PM','0883234567'),(_binary '',_binary '',15.8281,78.0373,7,'Bellary Road, Near Old Bus Stand','Kurnool','Hospivexa Kurnool','8:00 AM - 11:00 PM','0851834567'),(_binary '\0',_binary '',14.6819,77.6006,8,'Subhash Road, Near Clock Tower','Anantapur','Hospivexa Anantapur','9:00 AM - 8:00 PM','0855434567');
/*!40000 ALTER TABLE `medical_stores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `read` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `recipient_id` bigint NOT NULL,
  `type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKqqnsjxlwleyjbxlmm213jaj3f` (`recipient_id`),
  CONSTRAINT `FKqqnsjxlwleyjbxlmm213jaj3f` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (_binary '\0','2026-10-19 15:31:21.471521',1,14,'appointment','New appointment: M. Uday on 2026-10-20'),(_binary '\0','2026-10-19 15:31:26.437558',2,14,'success','Payment received: ₹500.0 from M. Uday'),(_binary '','2026-10-19 15:31:26.444559',3,19,'success','Payment successful: ₹500.0 for Dr. Rahul Pal'),(_binary '','2026-10-19 15:41:10.259735',4,18,'appointment','New appointment: Y. Rushi on 2026-10-19'),(_binary '','2026-10-19 15:41:14.580752',5,18,'success','Payment received: ₹500.0 from Y. Rushi'),(_binary '','2026-10-19 15:41:14.585648',6,20,'success','Payment successful: ₹500.0 for Dr. Y. Satya'),(_binary '','2026-10-19 15:42:06.497197',7,18,'appointment','Your appointment with Y. Rushi has only ~1 hour left (16:00)'),(_binary '\0','2026-10-19 15:42:06.503102',8,20,'appointment','Your appointment with Y. Satya has only ~1 hour left (16:00)'),(_binary '\0','2026-10-19 15:49:31.967696',9,13,'emergency','EMERGENCY: Neha (25 yrs, Female) — MLC MLC-20261019-0003 · Attending: Ganta Jyothi Prabha'),(_binary '\0','2026-10-19 15:49:31.972689',10,14,'emergency','EMERGENCY: Neha (25 yrs, Female) — MLC MLC-20261019-0003 · Attending: Ganta Jyothi Prabha'),(_binary '\0','2026-10-19 15:49:31.976585',11,15,'emergency','EMERGENCY: Neha (25 yrs, Female) — MLC MLC-20261019-0003 · Attending: Ganta Jyothi Prabha'),(_binary '\0','2026-10-19 15:49:31.981597',12,16,'emergency','EMERGENCY: Neha (25 yrs, Female) — MLC MLC-20261019-0003 · Attending: Ganta Jyothi Prabha'),(_binary '','2026-10-19 15:49:31.984579',13,17,'emergency','EMERGENCY: Neha (25 yrs, Female) — MLC MLC-20261019-0003 · Attending: Ganta Jyothi Prabha'),(_binary '','2026-10-19 15:49:31.989685',14,18,'emergency','EMERGENCY: Neha (25 yrs, Female) — MLC MLC-20261019-0003 · Attending: Ganta Jyothi Prabha'),(_binary '','2026-10-19 15:49:32.002315',15,9,'emergency','EMERGENCY: Neha (25 yrs, Female) — MLC MLC-20261019-0003 · Attending: Ganta Jyothi Prabha'),(_binary '','2026-10-19 15:49:32.009436',16,21,'emergency','EMERGENCY: Neha (25 yrs, Female) — MLC MLC-20261019-0003 · Attending: Ganta Jyothi Prabha'),(_binary '','2026-10-19 15:49:32.031324',17,1,'emergency','EMERGENCY: Neha (25 yrs, Female) — MLC MLC-20261019-0003 · Attending: Ganta Jyothi Prabha'),(_binary '\0','2026-10-19 15:55:25.872381',18,20,'prescription','Y. Satya prescribed: Fragrance-free moisturizer'),(_binary '\0','2026-10-19 15:57:40.670061',19,20,'record','Y. Satya added a medical record: Psoriasis – chronic inflammatory skin condition causing red, scaly patches on the skin.');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patients` (
  `age` int NOT NULL,
  `is_emergency` bit(1) NOT NULL,
  `is_medico_legal` bit(1) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `incident_date_time` datetime(6) DEFAULT NULL,
  `registered_at` datetime(6) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `attending_doctor` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `blood_group` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `brought_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `brought_by_phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_notes` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fir_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `incident_location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `informant_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `informant_phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `injury_description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mlc_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `police_station` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK9tbsl3fmey0eofbm2xj69v4qs` (`user_id`),
  UNIQUE KEY `UKcom6cw7d303i4ic3umxcv51j7` (`mlc_number`),
  CONSTRAINT `FKuwca24wcd1tg6pjex8lmc0y7` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `patients_chk_1` CHECK (((`age` <= 120) and (`age` >= 0)))
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
INSERT INTO `patients` VALUES (45,_binary '\0',_binary '\0',4,NULL,NULL,19,'Yeleswaram',NULL,'O+ve',NULL,NULL,'uday123@gmail.com','9704407003',NULL,NULL,'Female',NULL,NULL,NULL,NULL,NULL,'M. Uday','9346583467',NULL),(50,_binary '\0',_binary '\0',5,NULL,NULL,20,'Rajahmundry',NULL,'A+',NULL,NULL,'rushi123@gmail.com','9492164833',NULL,NULL,'Male',NULL,NULL,NULL,NULL,NULL,'Y. Rushi','9848684931',NULL),(25,_binary '',_binary '',6,'2026-10-19 15:44:00.000000','2026-10-19 15:49:31.944687',NULL,'','Ganta Jyothi Prabha','O+ve','Jyothi Sivani','7888945564',NULL,NULL,'Road traffic accidents — Bone fractures, dislocations, and crush injuries.','FIR/2026/001','Female','Vizag','','','Bone Fracture','MLC-20261019-0003','Neha','8855547668','Gajuwaka Police Station');
/*!40000 ALTER TABLE `patients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_transactions`
--

DROP TABLE IF EXISTS `payment_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_transactions` (
  `amount` double NOT NULL,
  `appointment_id` bigint DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `doctor_id` bigint NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `paid_at` datetime(6) DEFAULT NULL,
  `patient_id` bigint NOT NULL,
  `payment_method` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `receipt_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKhpgr30hs64ylfaajrkj5m9iqs` (`receipt_number`),
  UNIQUE KEY `UK2sidedjc2umwxebduummrmij5` (`appointment_id`),
  KEY `FKqm22jx2dsogmapvbdh8ck4uuc` (`doctor_id`),
  KEY `FKpxj31vj8coxl725wv7pr1huy1` (`patient_id`),
  CONSTRAINT `FKlt7moudhgt2jd0pbxiq8739bw` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`),
  CONSTRAINT `FKpxj31vj8coxl725wv7pr1huy1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`),
  CONSTRAINT `FKqm22jx2dsogmapvbdh8ck4uuc` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_transactions`
--

LOCK TABLES `payment_transactions` WRITE;
/*!40000 ALTER TABLE `payment_transactions` DISABLE KEYS */;
INSERT INTO `payment_transactions` VALUES (500,1,'2026-10-19 15:31:21.436517',6,1,'2026-10-19 15:31:26.424104',4,'PhonePe','TXN-20261019-0001','PAID'),(500,2,'2026-10-19 15:41:10.240777',10,2,'2026-10-19 15:41:14.579744',5,'GPay','TXN-20261019-0002','PAID');
/*!40000 ALTER TABLE `payment_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescriptions`
--

DROP TABLE IF EXISTS `prescriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescriptions` (
  `appointment_id` bigint DEFAULT NULL,
  `doctor_id` bigint NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `patient_id` bigint NOT NULL,
  `dosage` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `instructions` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `medicine` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKe2fpvlkkcgcd40k4ufyyju2al` (`appointment_id`),
  KEY `FK24chc88e4so7cd6melh11rv6` (`doctor_id`),
  KEY `FKqydyol76jn1o37k1bdbkjgq74` (`patient_id`),
  CONSTRAINT `FK24chc88e4so7cd6melh11rv6` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`),
  CONSTRAINT `FKe2fpvlkkcgcd40k4ufyyju2al` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`),
  CONSTRAINT `FKqydyol76jn1o37k1bdbkjgq74` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescriptions`
--

LOCK TABLES `prescriptions` WRITE;
/*!40000 ALTER TABLE `prescriptions` DISABLE KEYS */;
INSERT INTO `prescriptions` VALUES (2,10,1,5,'Thin layer','Ongoing skin care','Apply externally to dry skin; avoid irritating products.','Fragrance-free moisturizer');
/*!40000 ALTER TABLE `prescriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('ADMIN','DOCTOR','PATIENT','RECEPTIONIST') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKr43af9ap4edm43mmtq01oddj6` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'$2a$10$BEc7hOpIanwPmMafg7xJSOwdo0xLFJS0K80ASBb6wAXkHYeW82JaO','admin','ADMIN'),(9,'$2a$10$uWrqio4Evl1YOVQvYwpIjO8qsGfkEs6WyXsE4cKl3Ln8TC.KefY8.','reception','RECEPTIONIST'),(13,'$2a$10$WYFw56W2TETqFH.T7vNjCe2r1qqmKuyJQR5MIsvi8FzLJlddcyedy','Dr.Lakshmi','DOCTOR'),(14,'$2a$10$1d14KcaRUInjb/z/oaqfIOFoufTCm7PiQPjmpYXsN9t8WBPeAKn32','Dr.Rahul','DOCTOR'),(15,'$2a$10$Y.W3KWrrs3kwcz4Xf28K8O8gCvJpDiwNR/8MMR0e8w3.Zj8gvoSUu','Dr. Sivani ','DOCTOR'),(16,'$2a$10$hBvOHjYBrQo80eYwkwlUlekgtul/Gfq51z944HTQrxmhDPEooULBS','Dr.Sadvika','DOCTOR'),(17,'$2a$10$SUgShxUTb7mdiIT3Jqfz0O6I9ndz509MfMcd.SYNHDxuwf5yaABeC','Dr.Jyothi','DOCTOR'),(18,'$2a$10$ESsjdC.xhoJq75K81UMiROm.7PCCaZjlTYL/lFU0Lero.y2h99k9q','Dr.Satya','DOCTOR'),(19,'$2a$10$uMGm.Db4m50ZUqewLZTeL.TfHPLl0QkBh1UyfCzFjwmCZkWqr86uK','Uday','PATIENT'),(20,'$2a$10$8i3T8U0zXPiNvz97lHoBUuzilr5alXmRwbkUSFyb/Y5MVNiIL2m2y','Rushi','PATIENT'),(21,'$2a$10$gS7WZZ6uCpK9eG.Fwoqz4urmnlF.voxvVt2yZ5PFENsaNcGmECepu','Akhil','RECEPTIONIST');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-19 20:36:21
