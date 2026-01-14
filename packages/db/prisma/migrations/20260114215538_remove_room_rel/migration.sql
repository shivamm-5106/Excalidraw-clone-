-- DropForeignKey
ALTER TABLE "Shape" DROP CONSTRAINT "Shape_roomId_fkey";

-- DropIndex
DROP INDEX "Shape_roomId_idx";
