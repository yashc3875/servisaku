-- Dynamic booking engine (booking-flows.md): per-service Step-A questions +
-- richer pricing types, layered onto the existing catalog. Fully additive — no
-- existing column/table is dropped or altered destructively.

-- ── Service: dynamic pricing-engine fields ───────────────────────────────────
ALTER TABLE "Service" ADD COLUMN     "pricingType" TEXT;
ALTER TABLE "Service" ADD COLUMN     "unitPrice" DOUBLE PRECISION;
ALTER TABLE "Service" ADD COLUMN     "rate" DOUBLE PRECISION;
ALTER TABLE "Service" ADD COLUMN     "visitFee" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Service" ADD COLUMN     "minQty" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Service" ADD COLUMN     "sstEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Service" ADD COLUMN     "convertsToQuote" BOOLEAN NOT NULL DEFAULT false;

-- ── Booking: price + config snapshots (audit trail) ──────────────────────────
ALTER TABLE "Booking" ADD COLUMN     "priceBreakdown" JSONB;
ALTER TABLE "Booking" ADD COLUMN     "configVersion" TEXT;

-- ── BookingQuestion ──────────────────────────────────────────────────────────
CREATE TABLE "BookingQuestion" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "config" JSONB,

    CONSTRAINT "BookingQuestion_pkey" PRIMARY KEY ("id")
);

-- ── QuestionOption ───────────────────────────────────────────────────────────
CREATE TABLE "QuestionOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "priceModifier" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unitPrice" DOUBLE PRECISION,
    "priceModifierPerSqft" DOUBLE PRECISION,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QuestionOption_pkey" PRIMARY KEY ("id")
);

-- ── Indexes & constraints ────────────────────────────────────────────────────
CREATE INDEX "BookingQuestion_serviceId_sortOrder_idx" ON "BookingQuestion"("serviceId", "sortOrder");
CREATE UNIQUE INDEX "BookingQuestion_serviceId_key_key" ON "BookingQuestion"("serviceId", "key");
CREATE UNIQUE INDEX "QuestionOption_questionId_key_key" ON "QuestionOption"("questionId", "key");

ALTER TABLE "BookingQuestion" ADD CONSTRAINT "BookingQuestion_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "BookingQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
