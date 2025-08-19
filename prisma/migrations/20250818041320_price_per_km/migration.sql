/*
  Warnings:

  - You are about to drop the column `pricePerHour` on the `car` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `car` DROP COLUMN `pricePerHour`,
    ADD COLUMN `pricePerKm` DOUBLE NULL DEFAULT 0;
