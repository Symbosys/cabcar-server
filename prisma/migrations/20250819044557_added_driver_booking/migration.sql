-- AlterTable
ALTER TABLE `driverbooking` ADD COLUMN `paymentMethod` ENUM('Cash', 'Razapay') NOT NULL DEFAULT 'Cash',
    ADD COLUMN `paymentStatus` ENUM('Pending', 'Paid', 'Failed', 'Refunded') NOT NULL DEFAULT 'Pending',
    ADD COLUMN `status` ENUM('Upcoming', 'Ongoing', 'Completed') NOT NULL DEFAULT 'Upcoming';
