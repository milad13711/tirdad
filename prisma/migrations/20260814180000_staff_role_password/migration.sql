-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'STAFF';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordHash" TEXT;
