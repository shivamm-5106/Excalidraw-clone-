/*
  Warnings:

  - You are about to drop the column `userId` on the `Shape` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Shape" DROP CONSTRAINT "Shape_userId_fkey";

-- DropIndex
DROP INDEX "Shape_userId_idx";

-- AlterTable
ALTER TABLE "Shape" DROP COLUMN "userId";
