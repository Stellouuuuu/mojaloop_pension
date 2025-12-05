/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.13-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: mysql-rodolphefado.alwaysdata.net    Database: rodolphefado_pension
-- ------------------------------------------------------
-- Server version	10.11.14-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `batches`
--

DROP TABLE IF EXISTS `batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `batches` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `batch_code` varchar(50) NOT NULL,
  `total_amount` decimal(15,2) DEFAULT 0.00,
  `total_payments` int(11) DEFAULT 0,
  `success_rate` decimal(5,2) DEFAULT 0.00,
  `status` varchar(20) DEFAULT 'pending' CHECK (`status` in ('pending','completed','partial')),
  `initiated_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `batch_code` (`batch_code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pensioners`
--

DROP TABLE IF EXISTS `pensioners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pensioners` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `unique_id` varchar(20) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `type_id` varchar(20) NOT NULL,
  `msisdn` varchar(20) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'XOF',
  `comment` varchar(255) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending' CHECK (`status` in ('pending','validated','processing','success','failed')),
  `home_transaction_id` varchar(100) DEFAULT NULL,
  `batch_id` int(10) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_id` (`unique_id`),
  KEY `fk_pensioners_batch` (`batch_id`),
  CONSTRAINT `fk_pensioners_batch` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transfer`
--

DROP TABLE IF EXISTS `transfer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `transfer` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `transfer_id` char(36) NOT NULL,
  `home_transaction_id` char(36) DEFAULT NULL,
  `payer_name` text DEFAULT NULL,
  `payer_id_type` varchar(50) DEFAULT NULL,
  `payer_id_value` varchar(100) DEFAULT NULL,
  `payee_id_type` varchar(50) DEFAULT NULL,
  `payee_id_value` varchar(100) DEFAULT NULL,
  `payee_fsp_id` varchar(100) DEFAULT NULL,
  `payee_first_name` text DEFAULT NULL,
  `payee_last_name` text DEFAULT NULL,
  `payee_date_of_birth` date DEFAULT NULL,
  `amount` decimal(20,2) DEFAULT NULL,
  `currency` varchar(10) DEFAULT NULL,
  `amount_type` varchar(50) DEFAULT NULL,
  `transaction_type` varchar(50) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `initiated_at` datetime DEFAULT NULL,
  `quote_id` char(36) DEFAULT NULL,
  `payee_receive_amount` decimal(20,2) DEFAULT NULL,
  `payee_fsp_fee` decimal(20,2) DEFAULT NULL,
  `payee_fsp_commission` decimal(20,2) DEFAULT NULL,
  `quote_expiration` datetime DEFAULT NULL,
  `ilp_packet` longtext DEFAULT NULL,
  `ilp_condition` longtext DEFAULT NULL,
  `fulfilment` longtext DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `fulfilment_state` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-04 10:17:49
