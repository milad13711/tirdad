-- CreateTable
CREATE TABLE "SmsSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "apiKey" TEXT,
    "senderNumber" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsTrigger" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "eventKey" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsTrigger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SmsTrigger_eventKey_idx" ON "SmsTrigger"("eventKey");
