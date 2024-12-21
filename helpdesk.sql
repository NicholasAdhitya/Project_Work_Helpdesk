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
  `department` varchar(200) NOT NULL,
  `ticket_subject` varchar(300) DEFAULT NULL,
  `ticket_category` enum('Software','Hardware','Network') NOT NULL,
  `ticket_urgency` enum('Rendah','Sedang','Urgent') DEFAULT NULL,
  `tech_name` varchar(255) DEFAULT NULL,
  `ticket_status` enum('Open','In Progress','Done','Closed') DEFAULT 'Open',
  `ticket_desc` varchar(300) DEFAULT NULL,
  `ticket_attach` varchar(255) DEFAULT NULL,
  `date_created` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ticket_ID`),
  UNIQUE KEY `ticket_ID_UNIQUE` (`ticket_ID`),
  KEY `user_ID_idx` (`user_ID`),
  KEY `category_idx` (`ticket_category`),
  CONSTRAINT `fk_ticket_category` FOREIGN KEY (`ticket_category`) REFERENCES `user_acc` (`category`),
  CONSTRAINT `user_ID_fk` FOREIGN KEY (`user_ID`) REFERENCES `user_acc` (`user_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket`
--

LOCK TABLES `ticket` WRITE;
/*!40000 ALTER TABLE `ticket` DISABLE KEYS */;
INSERT INTO `ticket` VALUES (12,5,'Accounting','Tes Jon','Hardware','Rendah','Yoga','Closed','Cuman ngetes',NULL,'2024-10-09 14:23:22'),(15,5,'Accounting','Word error','Software','Sedang','Albertus Febi','In Progress','Ms word error setelah update',NULL,'2024-10-11 15:26:02'),(16,5,'Accounting','Tes 2','Network','Urgent','Basyid','Open','Rusak apalah',NULL,'2024-10-18 21:09:33'),(17,5,'Accounting','Tes file','Software','Urgent','Albertus Febi','Open','tes mutler','attachment-1729300075255-596167717.pdf','2024-10-19 08:07:55'),(18,5,'Accounting','Jaringan putus','Network','Sedang','Basit','Open','gatau kenapa putus nyambung',NULL,'2024-10-26 11:19:01');
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_acc`
--

LOCK TABLES `user_acc` WRITE;
/*!40000 ALTER TABLE `user_acc` DISABLE KEYS */;
INSERT INTO `user_acc` VALUES (1,'useradmin','$2b$10$OMD5XTZ6bb2Sy.J1tr8phO/yUphz61fT/e5wZp16qaEj7iT5XvPG6','User Admin','nicholas@lyman.co.id',NULL,'IT','Admin','2024-09-20 10:53:05'),(2,'masfebi','$2b$10$eP0ksVZRRcO8s5APU0oFbuKiTqrlLi/idFYf0dj0FPpo4eBELXcjC','Albertus Febi','edp-srki@lyman.co.id','Software','IT','Supervisor','2024-09-23 15:08:50'),(3,'tech1','$2b$10$OMD5XTZ6bb2Sy.J1tr8phO/yUphz61fT/e5wZp16qaEj7iT5XvPG6','Yoga','edp-srki@lyman.co.id','Hardware','IT','Technician','2024-09-24 14:59:10'),(4,'tech2','$2b$10$OMD5XTZ6bb2Sy.J1tr8phO/yUphz61fT/e5wZp16qaEj7iT5XvPG6','Basit','edp-srki@lyman.co.id','Network','IT','Technician','2024-09-24 14:59:42'),(5,'jondoe','$2b$10$eP0ksVZRRcO8s5APU0oFbuKiTqrlLi/idFYf0dj0FPpo4eBELXcjC','Jon Doe','jon@gmail.com',NULL,'Accounting','User','2024-09-30 15:35:58'),(7,'farhanproduction','$2b$10$jWJ.rqnJfnNOBaVqUaS6ser4yCtFB3gavUsXs4G8IcXXk8kGAaUsm','Farhan','production@lyman.co.id',NULL,'Production','User','2024-10-26 05:47:23'),(8,'manager','$2b$10$GI3BQRFpcEQSeymdbYi5heZjpI6YJPpUvrQBm/hmElQoQNCuF1cWu','Suryo Basuindro','suryob@gmail.com',NULL,'IT','Manager','2024-10-26 10:02:38');
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

-- Dump completed on 2024-11-30 12:48:16
