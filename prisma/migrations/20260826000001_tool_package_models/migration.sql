-- Replace the unused PromptPackage model with ToolPackage (downloadable
-- asset packs: font packs, CapCut effects, etc.) and its purchase table.
DROP TABLE "PromptPackage";

CREATE TABLE "ToolPackage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "coverImage" TEXT,
    "fileUrl" TEXT,
    "price" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolPackage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ToolPackage_slug_key" ON "ToolPackage"("slug");

CREATE TABLE "ToolPackagePurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "toolPackageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolPackagePurchase_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ToolPackagePurchase_userId_toolPackageId_key" ON "ToolPackagePurchase"("userId", "toolPackageId");

ALTER TABLE "ToolPackagePurchase" ADD CONSTRAINT "ToolPackagePurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ToolPackagePurchase" ADD CONSTRAINT "ToolPackagePurchase_toolPackageId_fkey" FOREIGN KEY ("toolPackageId") REFERENCES "ToolPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Order" ADD COLUMN "toolPackageId" TEXT;
ALTER TABLE "Order" ADD CONSTRAINT "Order_toolPackageId_fkey" FOREIGN KEY ("toolPackageId") REFERENCES "ToolPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
