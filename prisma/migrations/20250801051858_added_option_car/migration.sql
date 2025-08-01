-- AlterTable
ALTER TABLE `car` ADD COLUMN `ac` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `fuel` VARCHAR(191) NULL,
    MODIFY `transmission` VARCHAR(191) NULL,
    MODIFY `location` VARCHAR(191) NULL,
    MODIFY `features` JSON NULL,
    MODIFY `benefits` JSON NULL,
    MODIFY `convenienceFee` DOUBLE NULL DEFAULT 0,
    MODIFY `tripProtectionFee` DOUBLE NULL DEFAULT 0,
    MODIFY `deposit` DOUBLE NULL;
