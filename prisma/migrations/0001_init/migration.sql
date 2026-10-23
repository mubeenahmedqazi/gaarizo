-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AdStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Fuel" AS ENUM ('Petrol', 'Diesel', 'Hybrid', 'Electric', 'CNG');

-- CreateEnum
CREATE TYPE "Transmission" AS ENUM ('Manual', 'Automatic');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ad" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "price" BIGINT NOT NULL,
    "mileage" INTEGER NOT NULL,
    "city" TEXT NOT NULL,
    "fuel" "Fuel" NOT NULL,
    "transmission" "Transmission" NOT NULL,
    "engineCC" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "images" JSONB NOT NULL DEFAULT '[]',
    "status" "AdStatus" NOT NULL DEFAULT 'PENDING',
    "rejectReason" TEXT,
    "isSold" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "sellerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Ad_status_idx" ON "Ad"("status");

-- CreateIndex
CREATE INDEX "Ad_brand_idx" ON "Ad"("brand");

-- CreateIndex
CREATE INDEX "Ad_city_idx" ON "Ad"("city");

-- CreateIndex
CREATE INDEX "Ad_price_idx" ON "Ad"("price");

-- AddForeignKey
ALTER TABLE "Ad" ADD CONSTRAINT "Ad_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

