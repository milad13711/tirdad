-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "durationLabel" TEXT;

-- CreateTable
CREATE TABLE "TeaserSample" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "coverImage" TEXT,
    "videoUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeaserSample_pkey" PRIMARY KEY ("id")
);
