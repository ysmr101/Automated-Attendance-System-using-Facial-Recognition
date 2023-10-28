-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: localhost    Database: attendancedb
-- ------------------------------------------------------
-- Server version	8.0.34

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
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin` (
  `user_id` int(10) unsigned zerofill NOT NULL,
  `department` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `id_UNIQUE` (`user_id`),
  CONSTRAINT `aid` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `time` time DEFAULT NULL,
  `sid` int(10) unsigned zerofill NOT NULL,
  `refCode` int(10) unsigned zerofill NOT NULL,
  `status` varchar(10) DEFAULT NULL,
  `date` date NOT NULL,
  `StartTime` time NOT NULL,
  PRIMARY KEY (`sid`,`date`,`refCode`,`StartTime`),
  KEY `sid_idx` (`sid`),
  KEY `lkey_idx` (`StartTime`,`refCode`,`date`),
  KEY `lecturkey_idx` (`refCode`,`StartTime`,`date`),
  KEY `lecture_constraint` (`date`,`refCode`,`StartTime`),
  CONSTRAINT `lecture_constraint` FOREIGN KEY (`date`, `refCode`, `StartTime`) REFERENCES `lecture` (`date`, `refCode`, `startTime`) ON DELETE CASCADE,
  CONSTRAINT `sid4` FOREIGN KEY (`sid`) REFERENCES `student` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `authreq`
--

DROP TABLE IF EXISTS `authreq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `authreq` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sid` int(10) unsigned zerofill NOT NULL,
  `status` binary(1) DEFAULT NULL,
  PRIMARY KEY (`id`,`sid`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `sid3_idx` (`sid`),
  CONSTRAINT `sid3` FOREIGN KEY (`sid`) REFERENCES `student` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `classroomdevice`
--

DROP TABLE IF EXISTS `classroomdevice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classroomdevice` (
  `id` int(10) unsigned zerofill NOT NULL,
  `password` varchar(200) NOT NULL,
  `refreshToken` varchar(300) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `encodings`
--

DROP TABLE IF EXISTS `encodings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `encodings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `encoding` varchar(4000) NOT NULL,
  `sid` int(10) unsigned zerofill NOT NULL,
  `name` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `usid_idx` (`sid`),
  CONSTRAINT `usid` FOREIGN KEY (`sid`) REFERENCES `student` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=831 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `enrollment`
--

DROP TABLE IF EXISTS `enrollment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enrollment` (
  `sid` int(10) unsigned zerofill NOT NULL,
  `refCode` int(10) unsigned zerofill NOT NULL,
  PRIMARY KEY (`sid`,`refCode`),
  KEY `refCde_idx` (`refCode`),
  CONSTRAINT `refCde2` FOREIGN KEY (`refCode`) REFERENCES `section` (`refCode`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `sid2` FOREIGN KEY (`sid`) REFERENCES `student` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `facultymember`
--

DROP TABLE IF EXISTS `facultymember`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `facultymember` (
  `user_id` int(10) unsigned zerofill NOT NULL,
  `late` int DEFAULT '50',
  `absent` int DEFAULT '90',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `eid_UNIQUE` (`user_id`),
  CONSTRAINT `fid` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lecture`
--

DROP TABLE IF EXISTS `lecture`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lecture` (
  `date` date NOT NULL,
  `refCode` int(10) unsigned zerofill NOT NULL,
  `startTime` time NOT NULL,
  `endTime` time DEFAULT NULL,
  `numOfPresence` int DEFAULT NULL,
  `classNumber` int(10) unsigned zerofill DEFAULT NULL,
  `day` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`date`,`refCode`,`startTime`),
  KEY `refCode_idx` (`refCode`),
  CONSTRAINT `refCde` FOREIGN KEY (`refCode`) REFERENCES `section` (`refCode`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `section`
--

DROP TABLE IF EXISTS `section`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `section` (
  `refCode` int(10) unsigned zerofill NOT NULL,
  `courseName` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `studentsFaceEncoding` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `sectionNum` int(10) unsigned zerofill NOT NULL,
  PRIMARY KEY (`refCode`),
  UNIQUE KEY `refCode_UNIQUE` (`refCode`),
  UNIQUE KEY `studentsFaceEncoding_UNIQUE` (`studentsFaceEncoding`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `student`
--

DROP TABLE IF EXISTS `student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student` (
  `user_id` int(10) unsigned zerofill NOT NULL,
  `facePic` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Authenticated` decimal(1,0) DEFAULT NULL,
  `oldFacePic` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `sid_UNIQUE` (`user_id`),
  UNIQUE KEY `facePic_UNIQUE` (`facePic`),
  UNIQUE KEY `oldFacePic_UNIQUE` (`oldFacePic`),
  CONSTRAINT `sid` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `teach`
--

DROP TABLE IF EXISTS `teach`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teach` (
  `eid` int(10) unsigned zerofill NOT NULL,
  `refCode` int(10) unsigned zerofill NOT NULL,
  PRIMARY KEY (`eid`,`refCode`),
  KEY `refCde3_idx` (`refCode`),
  CONSTRAINT `eid` FOREIGN KEY (`eid`) REFERENCES `facultymember` (`user_id`),
  CONSTRAINT `refCde3` FOREIGN KEY (`refCode`) REFERENCES `section` (`refCode`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(10) unsigned zerofill NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(10000) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `refreshToken` varchar(400) DEFAULT NULL,
  `type` enum('student','faculty','admin') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `userscol_UNIQUE` (`refreshToken`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-10-26  1:29:59
