-- CreateEnum
CREATE TYPE "ConcessionCategory" AS ENUM ('COMBO', 'POPCORN', 'BEVERAGE', 'SNACK', 'CANDY');

-- CreateTable
CREATE TABLE "ConcessionProduct" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "ConcessionCategory" NOT NULL,
    "imageUrl" TEXT,
    "priceCents" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'PEN',
    "available" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConcessionProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConcessionProduct_slug_key" ON "ConcessionProduct"("slug");
CREATE INDEX "ConcessionProduct_available_featured_priority_idx" ON "ConcessionProduct"("available", "featured", "priority");
CREATE INDEX "ConcessionProduct_category_available_idx" ON "ConcessionProduct"("category", "available");
