-- phpMyAdmin SQL Dump
-- version 4.0.10deb1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Feb 05, 2016 at 01:59 PM
-- Server version: 5.5.46-0ubuntu0.14.04.2
-- PHP Version: 5.5.9-1ubuntu4.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `game`
--

-- --------------------------------------------------------

--
-- Table structure for table `token`
--

CREATE TABLE IF NOT EXISTS `token` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `refresh_token` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `ip` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `full_token` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `create_token` datetime NOT NULL,
  `create_refresh` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=17 ;

--
-- Dumping data for table `token`
--

INSERT INTO `token` (`id`, `user_id`, `token`, `refresh_token`, `ip`, `full_token`, `create_token`, `create_refresh`) VALUES
(1, 2, '1e706a91157fe495b73a7161d8834f28', 'ad3a0219ada244fb102a787a9f9f0a18', '127.0.0.1:59991', '8aa0b3addbb21b2f798fb54e8e00ddf8', '2016-02-04 15:46:17', '2016-02-04 15:46:17'),
(2, 2, '4afab8d9675a325deff38fb7011b60e5', '75999dbfcd5284c9de4ad99c8b37aa86', '127.0.0.1:60039', 'a38ef377c756bd5b67153e7cad9a10a2', '2016-02-04 15:50:31', '2016-02-04 15:50:31'),
(3, 2, 'df030ccc9e69bf7986f64537e30b904c', '8004a807ac09c5a8bd5755e1aa2feef8', '127.0.0.1:55231', '2af1a36865aa5c4935cabcb128d06cd6', '2016-02-05 12:04:06', '2016-02-05 12:04:06'),
(4, 2, 'bd3aa089a19fe8783f5ff96ac4b6789b', '46417b362e3c44e7e99fcb63a56996f3', '127.0.0.1:55258', '2cb8173a1f5825091d4fb6822a76ec91', '2016-02-05 12:04:40', '2016-02-05 12:04:40'),
(5, 2, '30b6da9c5d725a84982e87f490a4a8d4', 'e45a2c8c2a0f09ed40b80938d0a32fa1', '127.0.0.1:55295', '0f017b562c055c425a8f7b0ddbd1dda0', '2016-02-05 12:05:35', '2016-02-05 12:05:35'),
(6, 2, '9b309eb44b7df019b4a42eaeea09a8c1', '93ccff046d36ff344e0cb1669ad887a9', '127.0.0.1:55323', 'f2eea1961399bab8b614f2bec77a1b72', '2016-02-05 12:06:02', '2016-02-05 12:06:02'),
(7, 2, '96fa74a824101229928051fb18f3451c', '18e2c9ce17011ecc03391c3c32aeb53f', '127.0.0.1:55358', 'd365cfecc98b943ba442db84fc69c986', '2016-02-05 12:07:13', '2016-02-05 12:07:13'),
(8, 2, '94131e5e10fe473535870555fc9e27a2', 'c9e382ac65af58bb2382b11416f14c91', '127.0.0.1:55388', 'a62d0a99d183c006fc4f646e442d6a76', '2016-02-05 12:07:39', '2016-02-05 12:07:39'),
(10, 14, '73bddd7fd77b6349b5a24189f4fdd12a', '3b9bc9389591ba6eee01c1f5036cbc50', '127.0.0.1:55782', '0cd97d32886dc5798943069a35cb3e70', '2016-02-05 12:29:09', '2016-02-05 12:29:09'),
(11, 2, 'edbe0d75863916beb81773e387ce368d', '4e3fb8ae9958d88d2fa05c1a3ca0e0bc', '127.0.0.1:56829', '7e38a396281365a006d909d0b2a0ec88', '2016-02-05 13:32:50', '2016-02-05 13:32:41'),
(12, 2, '97fe6e018e11bac3700d2182d366d9cd', '8e916c65915c351ac49ac2b714511bc7', '127.0.0.1:56865', '7a0856d2f61a4a6fc045b8a8ef26706e', '2016-02-05 13:34:22', '2016-02-05 13:34:15'),
(15, 15, '4b1ac67bebde8c8757dbde336593dfcc', '7e2641cf0de666d1a2db344f5548ed29', '127.0.0.1:57000', '42aac03d8473b954ab4081d1ff5f2213', '2016-02-05 13:40:03', '2016-02-05 13:39:59');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `pass` varchar(255) NOT NULL,
  `login` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=16 ;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `pass`, `login`) VALUES
(1, 'test@test.ru', '0000', 'user'),
(2, 'eeee', 'eee', 'eee'),
(4, 'www', 'www', 'www'),
(5, 'dd', 'qqq', 'qqq'),
(7, 'rrr', 'rrr', 'rrr'),
(11, 'bbb', 'bbb', 'bbb'),
(12, 'nnn', 'nnn', 'nnn'),
(13, 'jkjk', 'jkjk', 'jkjk'),
(14, 'sssddd', 'sssddd', 'sssddd'),
(15, 'dfg', 'dfg', 'dfg');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
