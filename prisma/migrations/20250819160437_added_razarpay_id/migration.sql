-- DropForeignKey
ALTER TABLE `payment` DROP FOREIGN KEY `Payment_bookingId_fkey`;

-- DropIndex
DROP INDEX `Payment_bookingId_fkey` ON `payment`;

-- AlterTable
ALTER TABLE `booking` ADD COLUMN `razarPayId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `driverbooking` ADD COLUMN `razarPayId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `payment` ADD COLUMN `driverBookingId` INTEGER NULL,
    ADD COLUMN `razarPayId` VARCHAR(191) NULL,
    MODIFY `bookingId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_driverBookingId_fkey` FOREIGN KEY (`driverBookingId`) REFERENCES `DriverBooking`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
