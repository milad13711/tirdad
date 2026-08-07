-- AlterTable
ALTER TABLE "InboxMessage" ADD COLUMN "externalMessageId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "InboxMessage_externalMessageId_key" ON "InboxMessage"("externalMessageId");
