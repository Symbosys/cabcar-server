/*
  Warnings:

  - You are about to alter the column `role` on the `admin` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `admin` MODIFY `role` ENUM('admin', 'sub_admin') NOT NULL DEFAULT 'sub_admin';

-- RenameIndex
ALTER TABLE `admin` RENAME INDEX `Admin_email_idx` TO `admin_email_idx`;

-- RenameIndex
ALTER TABLE `admin` RENAME INDEX `Admin_email_key` TO `admin_email_key`;
