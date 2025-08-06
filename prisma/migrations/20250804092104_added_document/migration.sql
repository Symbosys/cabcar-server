/*
  Warnings:

  - You are about to drop the column `filePath` on the `document` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `document` table. All the data in the column will be lost.
  - You are about to drop the column `number` on the `document` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `document` table. All the data in the column will be lost.
  - You are about to drop the column `uploadedAt` on the `document` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `document` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Document` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[aadhaarNumber]` on the table `Document` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[drivingLicenseNumber]` on the table `Document` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `document` DROP COLUMN `filePath`,
    DROP COLUMN `image`,
    DROP COLUMN `number`,
    DROP COLUMN `type`,
    DROP COLUMN `uploadedAt`,
    DROP COLUMN `verified`,
    ADD COLUMN `aadhaarNumber` VARCHAR(191) NULL,
    ADD COLUMN `aadhaarVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `drivingLicenseNumber` VARCHAR(191) NULL,
    ADD COLUMN `drivingLicenseVerified` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX `Document_userId_key` ON `Document`(`userId`);

-- CreateIndex
CREATE UNIQUE INDEX `Document_aadhaarNumber_key` ON `Document`(`aadhaarNumber`);

-- CreateIndex
CREATE UNIQUE INDEX `Document_drivingLicenseNumber_key` ON `Document`(`drivingLicenseNumber`);

-- CreateIndex
CREATE INDEX `Document_aadhaarNumber_idx` ON `Document`(`aadhaarNumber`);

-- CreateIndex
CREATE INDEX `Document_drivingLicenseNumber_idx` ON `Document`(`drivingLicenseNumber`);
