-- phpMyAdmin SQL Dump
-- version 4.0.4
-- http://www.phpmyadmin.net
--
-- Client: localhost
-- Généré le: Lun 02 Juin 2014 à 13:00
-- Version du serveur: 5.6.12-log
-- Version de PHP: 5.4.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Base de données: `cubox`
--
CREATE DATABASE IF NOT EXISTS `cubox` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `cubox`;

-- --------------------------------------------------------

--
-- Structure de la table `plans`
--

CREATE TABLE IF NOT EXISTS `plans` (
  `id` int(8) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  `price` int(9) DEFAULT NULL,
  `description` text,
  `duration` int(2) DEFAULT NULL,
  `storage_space` int(20) DEFAULT NULL,
  `max_up` int(20) DEFAULT NULL,
  `max_down` int(20) DEFAULT NULL,
  `shared_link_quota` int(20) DEFAULT NULL,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=5 ;

--
-- Contenu de la table `plans`
--

INSERT INTO `plans` (`id`, `name`, `price`, `description`, `duration`, `storage_space`, `max_up`, `max_down`, `shared_link_quota`, `updated`) VALUES
(1, 'Free', NULL, 'For Students or educational purposes, our free offer would let you enjoy our services during 50 days !', 50, 5, 500, 400, 25, '2014-06-02 12:36:14'),
(2, 'Membox', 5, 'For freelancers or personal usage, become a member of the Cubox Community !', NULL, 25, NULL, NULL, NULL, '2014-06-02 12:36:37'),
(4, 'Enterprise', 15, 'For small, medium and large company, Cubox have the right offer for your needs', NULL, NULL, NULL, NULL, NULL, '2014-06-02 12:36:49');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(12) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `salt` varchar(16) NOT NULL,
  `active` bit(1) NOT NULL DEFAULT b'1',
  `choosen_plan` int(11) NOT NULL,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `Admin` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `choosen_plan` (`choosen_plan`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=7 ;

--
-- Contenu de la table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `salt`, `active`, `choosen_plan`, `updated`, `Admin`) VALUES
(3, 'Free', 'vic.delaunay@gmail.com', 'freepassword', '', b'1', 1, '2014-06-02 12:49:11', 0),
(4, 'Membox', 'victor.delaunay@neuros.fr', 'memboxpassword', '', b'1', 2, '2014-06-02 12:49:11', 0),
(5, 'Enterprise', 'mail@mail.fr', 'enterprisepassword', '', b'1', 4, '2014-06-02 12:49:11', 0),
(6, 'Admin', '145326@supinfo.com', 'adminpassword', '', b'1', 2, '2014-06-02 12:58:58', 1);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
