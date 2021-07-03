-- --------------------------------------------------------
-- Servidor:                     localhost
-- Versão do servidor:           10.4.6-MariaDB - mariadb.org binary distribution
-- OS do Servidor:               Win64
-- HeidiSQL Versão:              11.2.0.6213
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Copiando estrutura do banco de dados para pula_pirata
CREATE DATABASE IF NOT EXISTS `pula_pirata` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;
USE `pula_pirata`;

-- Copiando estrutura para tabela pula_pirata.room
CREATE TABLE IF NOT EXISTS `room` (
  `id` bigint(20) DEFAULT NULL,
  `owner` bigint(20) DEFAULT NULL,
  `pass` varchar(50) DEFAULT NULL,
  `status` enum('REGISTER','INPROGRESS','FINISH','EXPIRED') DEFAULT 'REGISTER',
  `date_register` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Exportação de dados foi desmarcado.

-- Copiando estrutura para tabela pula_pirata.room_slot
CREATE TABLE IF NOT EXISTS `room_slot` (
  `id` bigint(20) DEFAULT NULL,
  `idroom` bigint(20) DEFAULT NULL,
  `iduser` bigint(20) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `jump` int(11) DEFAULT NULL,
  `checked` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Exportação de dados foi desmarcado.

-- Copiando estrutura para tabela pula_pirata.room_user
CREATE TABLE IF NOT EXISTS `room_user` (
  `id` bigint(20) DEFAULT NULL,
  `iduser` bigint(20) DEFAULT NULL,
  `idroom` bigint(20) DEFAULT NULL,
  `points` int(11) DEFAULT 0,
  `color` varchar(50) DEFAULT NULL,
  `move` int(11) DEFAULT NULL,
  `date_register` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Exportação de dados foi desmarcado.

-- Copiando estrutura para tabela pula_pirata.user
CREATE TABLE IF NOT EXISTS `user` (
  `id` int(11) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `pass` varchar(100) DEFAULT NULL,
  `date_register` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Exportação de dados foi desmarcado.

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
