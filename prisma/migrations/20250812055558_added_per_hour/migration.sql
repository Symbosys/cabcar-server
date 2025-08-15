/*
  Warnings:

  - You are about to drop the column `pricePerKm` on the `car` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `car` DROP COLUMN `pricePerKm`,
    ADD COLUMN `pricePerHour` DOUBLE NULL DEFAULT 0;
