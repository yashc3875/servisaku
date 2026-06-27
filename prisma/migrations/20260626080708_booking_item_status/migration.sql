-- AlterTable
ALTER TABLE "BookingItem" ADD COLUMN     "addedBy" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'approved';
