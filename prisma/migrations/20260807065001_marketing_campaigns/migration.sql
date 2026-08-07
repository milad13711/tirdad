-- CreateEnum
CREATE TYPE "MarketingChannel" AS ENUM ('PUSH', 'SMS', 'WHATSAPP', 'TELEGRAM', 'BALE', 'INSTAGRAM');

-- CreateTable
CREATE TABLE "MarketingCampaign" (
    "id" TEXT NOT NULL,
    "channel" "MarketingChannel" NOT NULL,
    "message" TEXT NOT NULL,
    "segments" JSONB NOT NULL,
    "recipientCount" INTEGER NOT NULL,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketingCampaign_pkey" PRIMARY KEY ("id")
);
