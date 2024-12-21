CREATE DATABASE  IF NOT EXISTS `helpdesk` /*!40100 DEFAULT CHARACTER SET utf8mb3 */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `helpdesk`;
-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: helpdesk
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `manager_acc`
--

DROP TABLE IF EXISTS `manager_acc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `manager_acc` (
  `manager_ID` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(16) NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `role` enum('User','Technician','Manager','Admin') NOT NULL DEFAULT 'Manager',
  `date_modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`manager_ID`),
  UNIQUE KEY `manager_ID_UNIQUE` (`manager_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `manager_acc`
--

LOCK TABLES `manager_acc` WRITE;
/*!40000 ALTER TABLE `manager_acc` DISABLE KEYS */;
/*!40000 ALTER TABLE `manager_acc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket`
--

DROP TABLE IF EXISTS `ticket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket` (
  `ticket_ID` int NOT NULL AUTO_INCREMENT,
  `user_ID` int NOT NULL,
  `department` varchar(200) CHARACTER SET utf8mb3 NOT NULL,
  `ticket_subject` varchar(300) CHARACTER SET utf8mb3 DEFAULT NULL,
  `ticket_category` enum('Software','Hardware','Network') CHARACTER SET utf8mb3 NOT NULL,
  `ticket_urgency` enum('Rendah','Sedang','Urgent') CHARACTER SET utf8mb3 DEFAULT NULL,
  `tech_name` varchar(255) CHARACTER SET utf8mb3 DEFAULT NULL,
  `ticket_status` enum('Open','In Progress','Done','Closed') CHARACTER SET utf8mb3 DEFAULT 'Open',
  `ticket_desc` varchar(300) CHARACTER SET utf8mb3 DEFAULT NULL,
  `ticket_attach` varchar(255) CHARACTER SET utf8mb3 DEFAULT NULL,
  `date_created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_done` datetime DEFAULT NULL,
  `date_closed` datetime DEFAULT NULL,
  PRIMARY KEY (`ticket_ID`),
  UNIQUE KEY `ticket_ID_UNIQUE` (`ticket_ID`),
  KEY `user_ID_idx` (`user_ID`),
  KEY `category_idx` (`ticket_category`),
  CONSTRAINT `fk_ticket_category` FOREIGN KEY (`ticket_category`) REFERENCES `user_acc` (`category`),
  CONSTRAINT `user_ID_fk` FOREIGN KEY (`user_ID`) REFERENCES `user_acc` (`user_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket`
--

LOCK TABLES `ticket` WRITE;
/*!40000 ALTER TABLE `ticket` DISABLE KEYS */;
INSERT INTO `ticket` VALUES (12,5,'Accounting','Tes Jon','Hardware','Rendah','Yoga','Closed','Cuman ngetes',NULL,'2024-10-09 14:23:22','2024-12-18 15:08:01','2024-12-18 15:08:01'),(15,5,'Accounting','Word error','Software','Sedang','Albertus Febi','In Progress','Ms word error setelah update',NULL,'2024-10-11 15:26:02',NULL,NULL),(16,5,'Accounting','Tes 2','Network','Urgent','Basyid','Open','Rusak apalah',NULL,'2024-10-18 21:09:33',NULL,NULL),(17,5,'Accounting','Tes file','Software','Urgent','Albertus Febi','Open','tes mutler','attachment-1729300075255-596167717.pdf','2024-10-19 08:07:55',NULL,NULL),(18,5,'Accounting','Jaringan putus','Network','Sedang','Basit','Done','gatau kenapa putus nyambung',NULL,'2024-10-26 11:19:01','2024-12-19 15:11:36',NULL),(19,5,'Accounting','Tes tiket','Hardware','Urgent','Yoga','Closed','rusak rusak rusak','attachment-1734488568326-592762059.txt','2024-12-18 09:22:48','2024-12-19 15:02:20','2024-12-19 15:02:20'),(20,5,'Accounting','cek tiket','Network','Sedang','Basit','Closed','Lemot lemot',NULL,'2024-12-18 09:23:24',NULL,'2024-12-18 14:44:54'),(21,5,'Accounting','Tes 123333','Hardware','Rendah','Yoga','Closed','Tes done',NULL,'2024-12-18 14:34:24','2024-12-19 14:32:48','2024-12-19 14:32:48'),(22,9,'Personalia','tes tiketttt','Hardware','Sedang','Yoga','In Progress','gataudah',NULL,'2024-12-18 14:50:30',NULL,NULL),(23,5,'Accounting','printer rusak parah','Hardware','Sedang','Yoga','Closed','kesenggol abis itu jatoh',NULL,'2024-12-18 19:57:08','2024-12-19 14:31:21','2024-12-19 14:31:21'),(24,9,'Personalia','tes','Network','Sedang','Basit','Done','adadadad',NULL,'2024-12-18 19:59:48','2024-12-19 15:14:28',NULL),(25,5,'Accounting','adada','Hardware','Rendah','Yoga','In Progress','adadad',NULL,'2024-12-18 20:01:39',NULL,NULL);
/*!40000 ALTER TABLE `ticket` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_acc`
--

DROP TABLE IF EXISTS `user_acc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_acc` (
  `user_ID` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `category` enum('Software','Hardware','Network') DEFAULT NULL,
  `department` varchar(50) NOT NULL,
  `role` enum('User','Technician','Manager','Admin','Supervisor') NOT NULL DEFAULT 'User',
  `date_modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_ID`),
  UNIQUE KEY `user_ID_UNIQUE` (`user_ID`),
  KEY `username_idx` (`username`),
  KEY `category_idx` (`category`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_acc`
--

LOCK TABLES `user_acc` WRITE;
/*!40000 ALTER TABLE `user_acc` DISABLE KEYS */;
INSERT INTO `user_acc` VALUES (1,'useradmin','$2b$10$OMD5XTZ6bb2Sy.J1tr8phO/yUphz61fT/e5wZp16qaEj7iT5XvPG6','User Admin','nicholas@lyman.co.id',NULL,'IT','Admin','2024-09-20 10:53:05'),(2,'masfebi','$2b$10$eP0ksVZRRcO8s5APU0oFbuKiTqrlLi/idFYf0dj0FPpo4eBELXcjC','Albertus Febi','edp-srki@lyman.co.id','Software','IT','Supervisor','2024-09-23 15:08:50'),(3,'tech1','$2b$10$OMD5XTZ6bb2Sy.J1tr8phO/yUphz61fT/e5wZp16qaEj7iT5XvPG6','Yoga','edp-srki@lyman.co.id','Hardware','IT','Technician','2024-09-24 14:59:10'),(4,'tech2','$2b$10$OMD5XTZ6bb2Sy.J1tr8phO/yUphz61fT/e5wZp16qaEj7iT5XvPG6','Basit','edp-srki@lyman.co.id','Network','IT','Technician','2024-09-24 14:59:42'),(5,'jondoe','$2b$10$eP0ksVZRRcO8s5APU0oFbuKiTqrlLi/idFYf0dj0FPpo4eBELXcjC','Jon Doe','jon@gmail.com',NULL,'Accounting','User','2024-09-30 15:35:58'),(7,'farhanproduction','$2b$10$jWJ.rqnJfnNOBaVqUaS6ser4yCtFB3gavUsXs4G8IcXXk8kGAaUsm','Farhan','production@lyman.co.id',NULL,'Production','User','2024-10-26 05:47:23'),(8,'manager','$2b$10$uVBrtE8Lm1tBz9kd4B8vUe20/JzdxKv/erPv.vv6F3hUqU.pzz5hu','Suryo Basuindro','suryob@gmail.com',NULL,'IT','Manager','2024-10-26 10:02:38'),(9,'adhit','$2b$10$Uz/cMZhi88PPal9tjZEZT.7NPO2nO6IWL2uBfelm3MiAS8wUG6KsG','Adhit','adhityanicholas@gmail.com',NULL,'Personalia','User','2024-12-18 14:48:47');
/*!40000 ALTER TABLE `user_acc` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-12-21 10:36:57
