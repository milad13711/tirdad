-- DropForeignKey
ALTER TABLE "ServiceRequest" DROP CONSTRAINT IF EXISTS "ServiceRequest_userId_fkey";

-- DropTable
DROP TABLE IF EXISTS "ServiceRequest";

-- DropTable
DROP TABLE IF EXISTS "TeaserSample";

-- DropEnum
DROP TYPE IF EXISTS "ServiceRequestType";

-- DropEnum
DROP TYPE IF EXISTS "ServiceRequestStatus";
