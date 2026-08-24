-- Course access expiry: packages can grant time-limited playback access.
ALTER TABLE "Course" ADD COLUMN "accessDurationDays" INTEGER;
ALTER TABLE "Enrollment" ADD COLUMN "expiresAt" TIMESTAMP(3);
