-- CreateTable
CREATE TABLE "PartnerLocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partnerId" TEXT NOT NULL,
    "partnerName" TEXT,
    "lat" REAL,
    "lng" REAL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "isOnJob" BOOLEAN NOT NULL DEFAULT false,
    "lastSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceType" TEXT NOT NULL,
    "serviceId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "price" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "timeSlot" TEXT,
    "address" TEXT,
    "city" TEXT,
    "notes" TEXT,
    "couponCode" TEXT,
    "discountAmount" REAL NOT NULL DEFAULT 0,
    "paymentMethod" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "consumerId" TEXT NOT NULL,
    "partnerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_consumerId_fkey" FOREIGN KEY ("consumerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("address", "city", "consumerId", "couponCode", "createdAt", "date", "discountAmount", "id", "notes", "partnerId", "price", "serviceId", "serviceType", "status", "timeSlot", "updatedAt") SELECT "address", "city", "consumerId", "couponCode", "createdAt", "date", "discountAmount", "id", "notes", "partnerId", "price", "serviceId", "serviceType", "status", "timeSlot", "updatedAt" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PartnerLocation_partnerId_key" ON "PartnerLocation"("partnerId");
