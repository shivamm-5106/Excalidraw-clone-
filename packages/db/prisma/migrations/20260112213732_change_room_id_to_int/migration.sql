/*
  Warnings:

  - Changed the type of `roomId` on the `Shape` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Shape" DROP COLUMN "roomId",
ADD COLUMN     "roomId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Shape_roomId_idx" ON "Shape"("roomId");
