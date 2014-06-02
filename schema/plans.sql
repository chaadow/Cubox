DROP TABLE IF EXISTS `plans`;
CREATE TABLE `plans` (
  `id` int(8) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  `price` int(9) NOT NULL,
  `description` text,
  `duration` int(2) NOT NULL,
  `storage_space` int(20) NOT NULL,
  `max_up` int(20) NOT NULL,
  `max_down` int(20) NOT NULL,
  `shared_link_quota` int(20) NOT NULL,
  `updated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
);