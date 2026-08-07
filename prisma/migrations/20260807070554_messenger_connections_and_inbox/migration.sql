-- CreateEnum
CREATE TYPE "MessengerProvider" AS ENUM ('TELEGRAM', 'BALE', 'WHATSAPP', 'INSTAGRAM');

-- CreateEnum
CREATE TYPE "InboxDirection" AS ENUM ('IN', 'OUT');

-- CreateTable
CREATE TABLE "MessengerConnection" (
    "id" TEXT NOT NULL,
    "provider" "MessengerProvider" NOT NULL,
    "token" TEXT,
    "botUsername" TEXT,
    "connectedAt" TIMESTAMP(3),
    "pollOffset" INTEGER NOT NULL DEFAULT 0,
    "lastPollAt" TIMESTAMP(3),
    "lastPollError" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessengerConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InboxMessage" (
    "id" TEXT NOT NULL,
    "provider" "MessengerProvider" NOT NULL,
    "externalId" TEXT NOT NULL,
    "senderName" TEXT,
    "senderHandle" TEXT,
    "direction" "InboxDirection" NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InboxMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MessengerConnection_provider_key" ON "MessengerConnection"("provider");

-- CreateIndex
CREATE INDEX "InboxMessage_provider_externalId_idx" ON "InboxMessage"("provider", "externalId");
