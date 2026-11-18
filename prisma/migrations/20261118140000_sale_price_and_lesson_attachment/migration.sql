-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "salePrice" INTEGER;

-- AlterTable
ALTER TABLE "ToolPackage" ADD COLUMN     "salePrice" INTEGER;

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "attachmentUrl" TEXT,
ADD COLUMN     "attachmentName" TEXT;
