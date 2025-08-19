/*
  Warnings:

  - You are about to drop the column `bookingId` on the `driverbooking` table. All the data in the column will be lost.
  - Added the required column `pickupDate` to the `DriverBooking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `returnDate` to the `DriverBooking` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `DriverBooking_bookingId_idx` ON `driverbooking`;

-- AlterTable
ALTER TABLE `driverbooking` DROP COLUMN `bookingId`,
    ADD COLUMN `pickupDate` DATETIME(3) NOT NULL,
    ADD COLUMN `returnDate` DATETIME(3) NOT NULL;
