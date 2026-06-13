-- CreateTable
CREATE TABLE "PartnerSpecialization" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "verifiedByAdmin" BOOLEAN NOT NULL DEFAULT false,
    "yearsExperience" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerSpecialization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PartnerSpecialization_serviceId_verifiedByAdmin_isActive_idx" ON "PartnerSpecialization"("serviceId", "verifiedByAdmin", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerSpecialization_partnerId_serviceId_key" ON "PartnerSpecialization"("partnerId", "serviceId");

-- AddForeignKey
ALTER TABLE "PartnerSpecialization" ADD CONSTRAINT "PartnerSpecialization_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerSpecialization" ADD CONSTRAINT "PartnerSpecialization_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
