-- MySQL dump 10.13  Distrib 8.0.27, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: quiz_app
-- ------------------------------------------------------
-- Server version	8.0.39

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
-- Dumping data for table `category_versions`
--

LOCK TABLES `category_versions` WRITE;
/*!40000 ALTER TABLE `category_versions` DISABLE KEYS */;
INSERT INTO `category_versions` VALUES ('basics','電気の基礎','2025-09-16','2025-09-17 07:37:04'),('inspection','検査方法','2025-09-16','2025-09-17 07:37:12'),('laws','法令','2025-09-16','2025-09-17 07:37:17'),('methods','施工方法の種類','2025-09-16','2025-09-17 07:37:30'),('symbols','図記号','2025-09-16','2025-09-17 07:37:38'),('tools','道具の名前','2025-09-16','2025-09-17 07:37:44'),('wiring','配線の基礎','2025-09-16','2025-09-17 07:37:57');
/*!40000 ALTER TABLE `category_versions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `question_choices`
--

LOCK TABLES `question_choices` WRITE;
/*!40000 ALTER TABLE `question_choices` DISABLE KEYS */;
INSERT INTO `question_choices` VALUES (1,1,0,'0.5A'),(2,1,1,'1.0A'),(3,1,2,'2.0A'),(4,1,3,'5.0A'),(5,2,1,'0.5A'),(6,2,2,'1.0A'),(7,2,3,'2.0A'),(8,2,4,'5.0A'),(9,3,1,'電気事業法'),(10,3,2,'消防法'),(11,3,3,'電気工事士法'),(12,3,4,'労働基準法'),(13,4,1,'VVFケーブル'),(14,4,2,'IV線'),(15,4,3,'MIケーブル'),(16,4,4,'CVケーブル'),(17,5,1,'5A'),(18,5,2,'10A'),(19,5,3,'15A'),(20,5,4,'20A'),(21,6,1,'15A'),(22,6,2,'27A'),(23,6,3,'40A'),(24,6,4,'60A'),(25,7,1,'コンセント'),(26,7,2,'スイッチ'),(27,7,3,'照明器具'),(28,7,4,'接地極付コンセント'),(29,8,1,'40Hz'),(30,8,2,'45Hz'),(31,8,3,'55Hz'),(32,8,4,'50Hzまたは60Hz'),(33,9,1,'導体抵抗'),(34,9,2,'絶縁抵抗'),(35,9,3,'接触抵抗'),(36,9,4,'電圧降下'),(37,10,1,'VVF'),(38,10,2,'IV'),(39,10,3,'CV'),(40,10,4,'MI'),(41,11,1,'すべての電気工作物の工事'),(42,11,2,'一般用電気工作物の工事'),(43,11,3,'特別高圧の工事'),(44,11,4,'変電所内の電気工事');
/*!40000 ALTER TABLE `question_choices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES (1,'抵抗10Ωに20Vを加えたとき、流れる電流[A]は？',2,'オームの法則 I = V ÷ R を用いる。20 ÷ 10 = 2A となる。','basics',NULL,'2025-09-14 06:02:42'),(2,'抵抗10Ωに20Vを加えたとき、流れる電流[A]は？',3,'オームの法則 I = V ÷ R を用いる。20 ÷ 10 = 2A となる。','basics',NULL,'2025-09-16 10:48:51'),(3,'電気工事士が行える工事の範囲を定めた法律はどれか？',3,'電気工事士の資格制度や業務範囲は「電気工事士法」で規定されている。','laws',NULL,'2025-09-16 10:48:51'),(4,'住宅の屋内配線で最も一般的に使用されるケーブルはどれか？',1,'平形ビニル絶縁ビニルシースケーブル（VVFケーブル）が最も多く使用される。','tools',NULL,'2025-09-16 10:48:51'),(5,'100V, 1000W の電熱器の電流[A]は？',2,'I = P ÷ V = 1000 ÷ 100 = 10A となる。','basics',NULL,'2025-09-16 10:48:52'),(6,'電線の太さ 2.0mm² の許容電流はおよそ何Aか？',2,'一般的に 2.0mm² のVVFケーブルは約27Aが許容電流とされる。','tools',NULL,'2025-09-16 10:48:52'),(7,'配線図で「丸の中に×」の記号は何を表すか？',3,'照明器具（引掛シーリングなど）の接続点を表す記号である。','symbols',NULL,'2025-09-16 10:48:52'),(8,'交流電源の周波数は日本では地域により異なるが、一般的に何Hzか？',4,'東日本は50Hz、西日本は60Hzが標準である。','basics',NULL,'2025-09-16 10:48:52'),(9,'電気工事において、絶縁抵抗計で測定するのは何か？',2,'電路と大地（接地）間の絶縁状態を確認するために測定する。','laws',NULL,'2025-09-16 10:48:52'),(10,'600Vビニル絶縁ビニルシースケーブルの略称はどれか？',1,'600V VVFケーブルは屋内配線で広く使われる。','tools',NULL,'2025-09-16 10:48:52'),(11,'電気工事士法に基づき、第二種電気工事士が行える工事は？',2,'一般用電気工作物の工事が可能であり、自家用電気工作物は対象外。','laws',NULL,'2025-09-16 10:48:52');
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `user_answers`
--

LOCK TABLES `user_answers` WRITE;
/*!40000 ALTER TABLE `user_answers` DISABLE KEYS */;
INSERT INTO `user_answers` VALUES (2,1,1,2,1,'2025-09-16 10:42:43'),(3,1,1,2,1,'2025-09-16 10:42:59'),(4,1,1,1,0,'2025-09-16 10:43:03'),(5,1,1,2,1,'2025-09-16 10:43:08'),(6,1,1,1,0,'2025-09-16 10:44:05'),(7,1,1,2,1,'2025-09-16 10:44:16'),(8,1,1,2,1,'2025-09-16 11:01:56'),(9,1,2,3,1,'2025-09-16 11:02:01'),(10,1,5,2,1,'2025-09-16 11:02:16'),(11,1,7,3,1,'2025-09-16 11:02:29'),(12,1,11,2,1,'2025-09-16 11:02:42'),(13,1,1,0,0,'2025-09-16 11:05:12'),(14,1,1,1,0,'2025-09-16 11:05:14'),(15,1,1,2,1,'2025-09-16 11:05:16'),(16,1,1,3,0,'2025-09-16 11:05:18'),(17,1,1,1,0,'2025-09-16 11:05:20'),(18,1,1,0,0,'2025-09-16 11:05:22'),(19,1,1,2,1,'2025-09-16 11:05:23'),(20,1,2,3,1,'2025-09-16 11:05:57'),(21,1,4,2,0,'2025-09-16 11:06:04'),(22,1,6,4,0,'2025-09-16 11:06:08'),(23,1,7,3,1,'2025-09-16 11:06:22'),(24,1,10,3,0,'2025-09-16 11:06:25'),(25,1,3,1,0,'2025-09-17 02:27:49');
/*!40000 ALTER TABLE `user_answers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `user_progress`
--

LOCK TABLES `user_progress` WRITE;
/*!40000 ALTER TABLE `user_progress` DISABLE KEYS */;
INSERT INTO `user_progress` VALUES (1,1,1,'2025-09-16 11:05:23'),(1,2,1,'2025-09-16 11:05:57'),(1,3,0,'2025-09-17 02:27:49'),(1,4,0,'2025-09-16 11:06:04'),(1,5,1,'2025-09-16 11:02:16'),(1,6,0,'2025-09-16 11:06:08'),(1,7,1,'2025-09-16 11:06:22'),(1,10,0,'2025-09-16 11:06:25'),(1,11,1,'2025-09-16 11:02:42');
/*!40000 ALTER TABLE `user_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'user@exsample.com',0,'2025-09-16 19:42:35');
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

-- Dump completed on 2025-09-27 13:01:28
