/*
  Warnings:

  - Added the required column `customerId` to the `DriverBooking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `driverbooking` ADD COLUMN `customerId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `DriverBooking` ADD CONSTRAINT `DriverBooking_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
