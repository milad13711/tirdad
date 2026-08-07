-- CreateTable
CREATE TABLE "VpnConfig" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "configUrl" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VpnConfig_pkey" PRIMARY KEY ("id")
);
