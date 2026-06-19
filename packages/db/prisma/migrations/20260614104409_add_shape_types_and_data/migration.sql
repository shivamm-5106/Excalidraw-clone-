/*
  Warnings:

  - The values [CIRCLE] on the enum `ShapeType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `centerX` on the `Shape` table. All the data in the column will be lost.
  - You are about to drop the column `centerY` on the `Shape` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `Shape` table. All the data in the column will be lost.
  - You are about to drop the column `radius` on the `Shape` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `Shape` table. All the data in the column will be lost.
  - You are about to drop the column `x` on the `Shape` table. All the data in the column will be lost.
  - You are about to drop the column `y` on the `Shape` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Shape` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ShapeType_new" AS ENUM ('RECT', 'ELLIPSE', 'DIAMOND', 'LINE', 'ARROW', 'TEXT', 'FREEHAND');
ALTER TABLE "Shape" ALTER COLUMN "type" TYPE "ShapeType_new" USING ("type"::text::"ShapeType_new");
ALTER TYPE "ShapeType" RENAME TO "ShapeType_old";
ALTER TYPE "ShapeType_new" RENAME TO "ShapeType";
DROP TYPE "public"."ShapeType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Shape" DROP COLUMN "centerX",
DROP COLUMN "centerY",
DROP COLUMN "height",
DROP COLUMN "radius",
DROP COLUMN "width",
DROP COLUMN "x",
DROP COLUMN "y",
ADD COLUMN     "data" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Shape" ADD CONSTRAINT "Shape_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shape" ADD CONSTRAINT "Shape_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
