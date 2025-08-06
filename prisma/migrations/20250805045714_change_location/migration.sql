/*
  Warnings:

  - You are about to drop the column `loaction` on the `driver` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `driver` DROP COLUMN `loaction`,
    ADD COLUMN `location` VARCHAR(191) NULL;
