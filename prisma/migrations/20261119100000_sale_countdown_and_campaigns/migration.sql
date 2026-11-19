-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "campaignRef" TEXT;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "saleCountdownHours" INTEGER;

-- AlterTable
ALTER TABLE "ToolPackage" ADD COLUMN     "saleCountdownHours" INTEGER;

-- CreateTable
CREATE TABLE "PriceCountdownView" (
    "id" TEXT NOT NULL,
    "productKey" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceCountdownView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PriceCountdownView_productKey_ip_key" ON "PriceCountdownView"("productKey", "ip");

-- CreateTable
CREATE TABLE "CampaignLink" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "productKey" TEXT NOT NULL,
    "label" TEXT,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CampaignLink_slug_key" ON "CampaignLink"("slug");

-- CreateIndex
CREATE INDEX "CampaignLink_productKey_idx" ON "CampaignLink"("productKey");

-- CreateTable
CREATE TABLE "CampaignEvent" (
    "id" TEXT NOT NULL,
    "productKey" TEXT NOT NULL,
    "campaignLinkId" TEXT,
    "sessionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "section" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CampaignEvent_productKey_idx" ON "CampaignEvent"("productKey");

-- CreateIndex
CREATE INDEX "CampaignEvent_campaignLinkId_idx" ON "CampaignEvent"("campaignLinkId");

-- CreateIndex
CREATE INDEX "CampaignEvent_sessionId_type_idx" ON "CampaignEvent"("sessionId", "type");

-- CreateTable
CREATE TABLE "CampaignQuestion" (
    "id" TEXT NOT NULL,
    "productKey" TEXT NOT NULL,
    "campaignLinkId" TEXT,
    "phone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "answeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CampaignQuestion_productKey_idx" ON "CampaignQuestion"("productKey");
