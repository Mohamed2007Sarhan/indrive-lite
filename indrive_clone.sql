-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: 06 ديسمبر 2025 الساعة 23:55
-- إصدار الخادم: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `indrive_clone`
--

-- --------------------------------------------------------

--
-- بنية الجدول `offers`
--

CREATE TABLE `offers` (
  `id` int(11) NOT NULL,
  `ride_id` int(11) NOT NULL,
  `driver_id` int(11) NOT NULL,
  `offer_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- إرجاع أو استيراد بيانات الجدول `offers`
--

INSERT INTO `offers` (`id`, `ride_id`, `driver_id`, `offer_amount`, `status`, `created_at`) VALUES
(1, 3, 6, 50.00, 'accepted', '2025-12-06 21:53:36'),
(2, 1, 6, 68.00, 'pending', '2025-12-06 21:57:48'),
(3, 4, 6, 20.00, 'accepted', '2025-12-06 21:59:47'),
(4, 5, 6, 2345.00, 'accepted', '2025-12-06 22:00:38'),
(5, 6, 2, 50.00, 'accepted', '2025-12-06 22:52:29');

-- --------------------------------------------------------

--
-- بنية الجدول `reports`
--

CREATE TABLE `reports` (
  `id` int(11) NOT NULL,
  `ride_id` int(11) NOT NULL,
  `reporter_id` int(11) NOT NULL,
  `reason` text NOT NULL,
  `status` enum('open','resolved') DEFAULT 'open',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- إرجاع أو استيراد بيانات الجدول `reports`
--

INSERT INTO `reports` (`id`, `ride_id`, `reporter_id`, `reason`, `status`, `created_at`) VALUES
(1, 5, 4, 'spam', 'open', '2025-12-06 22:00:50');

-- --------------------------------------------------------

--
-- بنية الجدول `rides`
--

CREATE TABLE `rides` (
  `id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `driver_id` int(11) DEFAULT NULL,
  `pickup_address` varchar(255) NOT NULL,
  `dropoff_address` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `status` enum('pending','accepted','in_progress','completed','cancelled') DEFAULT 'pending',
  `client_otp_code` varchar(10) DEFAULT NULL,
  `driver_otp_code` varchar(10) DEFAULT NULL,
  `client_confirmed` tinyint(1) DEFAULT 0,
  `driver_confirmed` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `pickup_lat` decimal(10,8) DEFAULT NULL,
  `pickup_lng` decimal(10,8) DEFAULT NULL,
  `dropoff_lat` decimal(10,8) DEFAULT NULL,
  `dropoff_lng` decimal(10,8) DEFAULT NULL,
  `final_price` decimal(10,8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- إرجاع أو استيراد بيانات الجدول `rides`
--

INSERT INTO `rides` (`id`, `client_id`, `driver_id`, `pickup_address`, `dropoff_address`, `price`, `status`, `client_otp_code`, `driver_otp_code`, `client_confirmed`, `driver_confirmed`, `created_at`, `pickup_lat`, `pickup_lng`, `dropoff_lat`, `dropoff_lng`, `final_price`) VALUES
(1, 3, NULL, 'Sharm Al Sheikh, Al Tour Road, At Tur, South Sinai, 46511, Egypt', 'New Domitta', 0.00, 'pending', NULL, NULL, 0, 0, '2025-12-06 21:26:30', NULL, NULL, NULL, NULL, NULL),
(2, 1, NULL, 'طريق شرم الشيخ, الطور, الطور, جنوب سيناء, 46511, مصر', 'New Domitaa', 0.00, 'pending', NULL, NULL, 0, 0, '2025-12-06 21:31:41', NULL, NULL, NULL, NULL, NULL),
(3, 4, 6, 'الطور, جنوب سيناء, 46511, مصر', 'الطور, جنوب سيناء, مصر', 0.00, 'completed', '1105', '6553', 0, 1, '2025-12-06 21:49:02', NULL, NULL, NULL, NULL, 50.00000000),
(4, 4, 6, 'طريق شرم الشيخ, الطور, الطور, جنوب سيناء, 46511, مصر', 'مساكن مبارك الجديدة, الطور, جنوب سيناء, 46511, مصر', 0.00, 'completed', '7120', '9565', 1, 1, '2025-12-06 21:59:40', NULL, NULL, NULL, NULL, 20.00000000),
(5, 4, 6, 'حى النصر, الطور, جنوب سيناء, 46511, مصر', 'شارع الشهيد احمد حمدى, الطور, جنوب سيناء, 46511, مصر', 0.00, 'accepted', '4889', '5131', 0, 0, '2025-12-06 22:00:32', NULL, NULL, NULL, NULL, 99.99999999),
(6, 11, 2, 'طريق شرم الشيخ, الطور, الطور, جنوب سيناء, 46511, مصر', 'الطور, جنوب سيناء, 46511, مصر', 0.00, 'cancelled', '1421', '5577', 1, 1, '2025-12-06 22:51:14', NULL, NULL, NULL, NULL, 50.00000000);

-- --------------------------------------------------------

--
-- بنية الجدول `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `national_id` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('client','driver','admin') NOT NULL,
  `balance` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `national_id_image` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `vehicle_type` varchar(100) DEFAULT NULL,
  `device_type` varchar(100) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- إرجاع أو استيراد بيانات الجدول `users`
--

INSERT INTO `users` (`id`, `name`, `phone`, `national_id`, `password`, `role`, `balance`, `created_at`, `national_id_image`, `email`, `vehicle_type`, `device_type`, `avatar_url`, `is_active`) VALUES
(1, 'Mohamed sarhan', '201040922321', '3456756845734', '$2b$10$x4TgSwfvq3HJKzTpVVgYNuRwf9hXlQl7saTyv63KGETkC2RaMrlbW', 'client', 0.00, '2025-12-06 21:05:18', NULL, NULL, NULL, NULL, NULL, 1),
(2, 'Mohamed Sarhan', '01096777381', '234564756', '$2b$10$cW8b3yErK5boQWJ7ipfqzeVKWkYWi730vlYfq6Z6Ej1sm4EIELhTu', 'driver', 0.00, '2025-12-06 21:12:09', NULL, NULL, NULL, NULL, NULL, 1),
(3, 'Test User', '12345', '9876543210', '$2b$10$ScGCCPm0s1FQBg9/khUh6uglNv35zpleo5l4pOkjSXJQ9kLFvmNwW', 'client', 0.00, '2025-12-06 21:14:52', NULL, NULL, NULL, NULL, NULL, 1),
(4, 'Mohamed Sarhan', '+201040922321', '12345678912345', '$2b$10$dEvTp8DcyRiSQbbOWIDfJ.UuhVjl1w0ZGNBWbJ7YnOApkxoj6D02a', 'client', 0.00, '2025-12-06 21:48:26', 'id-1765057706021.jpg', NULL, '', 'smsss', NULL, 1),
(5, 'Mohamed Sarhan', '201041922321', '12345678912349', '$2b$10$m9/.xuGdgwUqLFDBvZ158e7K.tBzM5cVqMmEDqonKGqJ7DxRHyKvG', 'driver', 0.00, '2025-12-06 21:49:43', 'id-1765057783793.png', NULL, 'smaaaa', '', NULL, 1),
(6, 'Mohamed Sarhan', '+201096777381', '12345678912354', '$2b$10$Re2KX.kqJ9HUE8S00unj/ODyEH4wqe5K57P4AWMH2sKfRi5AMG3I.', 'driver', 0.00, '2025-12-06 21:50:37', 'id-1765057837003.jpg', '', 'Sedan', '', NULL, 1),
(7, 'Super Admin', '00000', 'ADMIN001', '$2b$10$mY8XPYm8QpXKzF/pFZqGxOSg1cRCfkCw7gfrwpaxu./J7q3.1/PLi', 'admin', 0.00, '2025-12-06 22:04:50', NULL, NULL, NULL, NULL, NULL, 1),
(10, 'Valued Client', '+201041922321', '', '$2b$10$KMCqqkV5n8tMZ.yxnDIAM.p.yhnKV/aQozPE4bpfFwBt8kWmN4tFC', 'client', 0.00, '2025-12-06 22:40:19', NULL, NULL, NULL, NULL, NULL, 1),
(11, 'Mohamed Sarhan', '+2010123456789', '3287497357248975', '$2b$10$EA1EqH2/JRMQy9Np2V/WieXQ3k9SRu5NgFmliRg1hiUbg4WxrC4fW', 'client', 0.00, '2025-12-06 22:43:02', 'id-1765060982183.jpg', NULL, '', 'asdxas', NULL, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `offers`
--
ALTER TABLE `offers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ride_id` (`ride_id`),
  ADD KEY `driver_id` (`driver_id`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ride_id` (`ride_id`),
  ADD KEY `reporter_id` (`reporter_id`);

--
-- Indexes for table `rides`
--
ALTER TABLE `rides`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `driver_id` (`driver_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD UNIQUE KEY `national_id` (`national_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `offers`
--
ALTER TABLE `offers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `rides`
--
ALTER TABLE `rides`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- قيود الجداول المُلقاة.
--

--
-- قيود الجداول `offers`
--
ALTER TABLE `offers`
  ADD CONSTRAINT `offers_ibfk_1` FOREIGN KEY (`ride_id`) REFERENCES `rides` (`id`),
  ADD CONSTRAINT `offers_ibfk_2` FOREIGN KEY (`driver_id`) REFERENCES `users` (`id`);

--
-- قيود الجداول `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`ride_id`) REFERENCES `rides` (`id`),
  ADD CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`);

--
-- قيود الجداول `rides`
--
ALTER TABLE `rides`
  ADD CONSTRAINT `rides_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `rides_ibfk_2` FOREIGN KEY (`driver_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
