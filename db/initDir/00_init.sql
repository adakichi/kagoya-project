SET NAMES utf8mb4;

-- ==============================
-- データベース作成
-- ==============================
CREATE DATABASE IF NOT EXISTS test_app;
CREATE DATABASE IF NOT EXISTS quiz_app;

-- 対象DBを選択
USE quiz_app;

-- ==============================
-- 1. users (親)
-- ==============================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `is_paid` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================
-- 1-1. category_versions
-- ==============================

CREATE TABLE `category_versions` (
	`category` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`title` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`version` VARCHAR(20) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`category`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================
-- 2. questions (親)
-- ==============================
DROP TABLE IF EXISTS `questions`;
CREATE TABLE `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question` text NOT NULL,
  `answer_index` int NOT NULL,
  `explanation` text,
  `category` varchar(50) DEFAULT NULL,
  `image_url` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `source_type` ENUM('past_exam','original') NOT NULL DEFAULT 'original' COMMENT '過去問 or オリジナル',
	`source_detail` VARCHAR(100) NULL DEFAULT NULL COMMENT '例: 2023-下期, R5-上期',
  `source_note` VARCHAR(255) NULL DEFAULT NULL COMMENT '出典や注意点など',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ==============================
-- 3. question_choices (questions に依存)
-- ==============================
DROP TABLE IF EXISTS `question_choices`;
CREATE TABLE `question_choices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question_id` int NOT NULL,
  `choice_index` int NOT NULL,
  `choice_text` varchar(255) NOT NULL,
  `image_url` VARCHAR(255) NULL DEFAULT NULL COMMENT '選択肢用の画像URL',
  PRIMARY KEY (`id`),
  UNIQUE KEY `question_id` (`question_id`,`choice_index`),
  CONSTRAINT `question_choices_ibfk_1`
    FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================
-- 4. user_answers (users, questions に依存)
-- ==============================
DROP TABLE IF EXISTS `user_answers`;
CREATE TABLE `user_answers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `question_id` int NOT NULL,
  `choice_index` int NOT NULL,
  `is_correct` tinyint(1) NOT NULL,
  `answered_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_question` (`question_id`),
  CONSTRAINT `user_answers_ibfk_1`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `user_answers_ibfk_2`
    FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================
-- 5. user_progress (users, questions に依存)
-- ==============================
DROP TABLE IF EXISTS `user_progress`;
CREATE TABLE `user_progress` (
  `user_id` int NOT NULL,
  `question_id` int NOT NULL,
  `is_correct` tinyint(1) NOT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`question_id`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `user_progress_ibfk_1`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `user_progress_ibfk_2`
    FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================
-- ユーザ作成と権限付与
-- ==============================
CREATE USER IF NOT EXISTS 'test_user'@'%' IDENTIFIED BY 'test_pass';
GRANT ALL PRIVILEGES ON test_app.* TO 'test_user'@'%';

CREATE USER IF NOT EXISTS 'quiz_user'@'%' IDENTIFIED BY 'm4DQHqNr';
GRANT ALL PRIVILEGES ON quiz_app.* TO 'quiz_user'@'%';

FLUSH PRIVILEGES;
