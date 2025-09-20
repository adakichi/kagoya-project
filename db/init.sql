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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 初期データ
INSERT INTO `questions` VALUES
(1,'抵抗10Ωに20Vを加えたとき、流れる電流[A]は？',2,
 'オームの法則 I = V ÷ R を用いる。20 ÷ 10 = 2A となる。','電気の基礎',NULL,'2025-09-14 06:02:42');

-- ==============================
-- 3. question_choices (questions に依存)
-- ==============================
DROP TABLE IF EXISTS `question_choices`;
CREATE TABLE `question_choices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question_id` int NOT NULL,
  `choice_index` int NOT NULL,
  `choice_text` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `question_id` (`question_id`,`choice_index`),
  CONSTRAINT `question_choices_ibfk_1`
    FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `question_choices` VALUES
(1,1,0,'0.5A'),
(2,1,1,'1.0A'),
(3,1,2,'2.0A'),
(4,1,3,'5.0A');

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

-- Q1
INSERT INTO questions (question, answer_index, explanation, category, image_url)
VALUES ('抵抗10Ωに20Vを加えたとき、流れる電流[A]は？', 3, 'オームの法則 I = V ÷ R を用いる。20 ÷ 10 = 2A となる。', '理論', NULL);
INSERT INTO question_choices (question_id, choice_index, choice_text) VALUES
(LAST_INSERT_ID(), 1, '0.5A'),
(LAST_INSERT_ID(), 2, '1.0A'),
(LAST_INSERT_ID(), 3, '2.0A'),
(LAST_INSERT_ID(), 4, '5.0A');

-- Q2
INSERT INTO questions (question, answer_index, explanation, category, image_url)
VALUES ('電気工事士が行える工事の範囲を定めた法律はどれか？', 3, '電気工事士の資格制度や業務範囲は「電気工事士法」で規定されている。', '法令', NULL);
INSERT INTO question_choices (question_id, choice_index, choice_text) VALUES
(LAST_INSERT_ID(), 1, '電気事業法'),
(LAST_INSERT_ID(), 2, '消防法'),
(LAST_INSERT_ID(), 3, '電気工事士法'),
(LAST_INSERT_ID(), 4, '労働基準法');

-- Q3
INSERT INTO questions (question, answer_index, explanation, category, image_url)
VALUES ('住宅の屋内配線で最も一般的に使用されるケーブルはどれか？', 1, '平形ビニル絶縁ビニルシースケーブル（VVFケーブル）が最も多く使用される。', '配線材料', NULL);
INSERT INTO question_choices (question_id, choice_index, choice_text) VALUES
(LAST_INSERT_ID(), 1, 'VVFケーブル'),
(LAST_INSERT_ID(), 2, 'IV線'),
(LAST_INSERT_ID(), 3, 'MIケーブル'),
(LAST_INSERT_ID(), 4, 'CVケーブル');

-- Q4
INSERT INTO questions (question, answer_index, explanation, category, image_url)
VALUES ('100V, 1000W の電熱器の電流[A]は？', 2, 'I = P ÷ V = 1000 ÷ 100 = 10A となる。', '理論', NULL);
INSERT INTO question_choices (question_id, choice_index, choice_text) VALUES
(LAST_INSERT_ID(), 1, '5A'),
(LAST_INSERT_ID(), 2, '10A'),
(LAST_INSERT_ID(), 3, '15A'),
(LAST_INSERT_ID(), 4, '20A');

-- Q5
INSERT INTO questions (question, answer_index, explanation, category, image_url)
VALUES ('電線の太さ 2.0mm² の許容電流はおよそ何Aか？', 2, '一般的に 2.0mm² のVVFケーブルは約27Aが許容電流とされる。', '配線材料', NULL);
INSERT INTO question_choices (question_id, choice_index, choice_text) VALUES
(LAST_INSERT_ID(), 1, '15A'),
(LAST_INSERT_ID(), 2, '27A'),
(LAST_INSERT_ID(), 3, '40A'),
(LAST_INSERT_ID(), 4, '60A');

-- Q6
INSERT INTO questions (question, answer_index, explanation, category, image_url)
VALUES ('配線図で「丸の中に×」の記号は何を表すか？', 3, '照明器具（引掛シーリングなど）の接続点を表す記号である。', '記号', NULL);
INSERT INTO question_choices (question_id, choice_index, choice_text) VALUES
(LAST_INSERT_ID(), 1, 'コンセント'),
(LAST_INSERT_ID(), 2, 'スイッチ'),
(LAST_INSERT_ID(), 3, '照明器具'),
(LAST_INSERT_ID(), 4, '接地極付コンセント');

-- Q7
INSERT INTO questions (question, answer_index, explanation, category, image_url)
VALUES ('交流電源の周波数は日本では地域により異なるが、一般的に何Hzか？', 4, '東日本は50Hz、西日本は60Hzが標準である。', '理論', NULL);
INSERT INTO question_choices (question_id, choice_index, choice_text) VALUES
(LAST_INSERT_ID(), 1, '40Hz'),
(LAST_INSERT_ID(), 2, '45Hz'),
(LAST_INSERT_ID(), 3, '55Hz'),
(LAST_INSERT_ID(), 4, '50Hzまたは60Hz');

-- Q8
INSERT INTO questions (question, answer_index, explanation, category, image_url)
VALUES ('電気工事において、絶縁抵抗計で測定するのは何か？', 2, '電路と大地（接地）間の絶縁状態を確認するために測定する。', '法令', NULL);
INSERT INTO question_choices (question_id, choice_index, choice_text) VALUES
(LAST_INSERT_ID(), 1, '導体抵抗'),
(LAST_INSERT_ID(), 2, '絶縁抵抗'),
(LAST_INSERT_ID(), 3, '接触抵抗'),
(LAST_INSERT_ID(), 4, '電圧降下');

-- Q9
INSERT INTO questions (question, answer_index, explanation, category, image_url)
VALUES ('600Vビニル絶縁ビニルシースケーブルの略称はどれか？', 1, '600V VVFケーブルは屋内配線で広く使われる。', '配線材料', NULL);
INSERT INTO question_choices (question_id, choice_index, choice_text) VALUES
(LAST_INSERT_ID(), 1, 'VVF'),
(LAST_INSERT_ID(), 2, 'IV'),
(LAST_INSERT_ID(), 3, 'CV'),
(LAST_INSERT_ID(), 4, 'MI');

-- Q10
INSERT INTO questions (question, answer_index, explanation, category, image_url)
VALUES ('電気工事士法に基づき、第二種電気工事士が行える工事は？', 2, '一般用電気工作物の工事が可能であり、自家用電気工作物は対象外。', '法令', NULL);
INSERT INTO question_choices (question_id, choice_index, choice_text) VALUES
(LAST_INSERT_ID(), 1, 'すべての電気工作物の工事'),
(LAST_INSERT_ID(), 2, '一般用電気工作物の工事'),
(LAST_INSERT_ID(), 3, '特別高圧の工事'),
(LAST_INSERT_ID(), 4, '変電所内の電気工事');
