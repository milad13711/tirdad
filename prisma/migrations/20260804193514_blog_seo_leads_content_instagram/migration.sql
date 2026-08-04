-- AlterEnum
ALTER TYPE "LeadSource" ADD VALUE 'WEBSITE';

-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "message" TEXT;

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "content" JSONB NOT NULL DEFAULT '{}';

-- CreateTable
CREATE TABLE "InstagramConnection" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "accessToken" TEXT,
    "businessAccountId" TEXT,
    "connectedAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "lastSyncError" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstagramConnection_pkey" PRIMARY KEY ("id")
);
