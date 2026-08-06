-- AlterEnum
ALTER TYPE "OrderItemType" ADD VALUE 'PROMPT';

-- AlterTable
ALTER TABLE "AiTool" ADD COLUMN     "usageInstructions" TEXT,
ADD COLUMN     "price" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "pageUrl" TEXT,
ADD COLUMN     "attachmentUrl" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "aiToolId" TEXT;

-- CreateTable
CREATE TABLE "PromptPurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "aiToolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromptPurchase_userId_aiToolId_key" ON "PromptPurchase"("userId", "aiToolId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_aiToolId_fkey" FOREIGN KEY ("aiToolId") REFERENCES "AiTool"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptPurchase" ADD CONSTRAINT "PromptPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptPurchase" ADD CONSTRAINT "PromptPurchase_aiToolId_fkey" FOREIGN KEY ("aiToolId") REFERENCES "AiTool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
