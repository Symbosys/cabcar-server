/*
  Warnings:

  - You are about to alter the column `status` on the `booking` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `booking` MODIFY `status` ENUM('Upcoming', 'Ongoing', 'Completed') NOT NULL DEFAULT 'Upcoming';
