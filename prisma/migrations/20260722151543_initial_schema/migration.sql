-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PETANI', 'PERUSAHAAN', 'ADMIN');

-- CreateEnum
CREATE TYPE "PengirimanMethod" AS ENUM ('SELF_DELIVERY', 'PICKUP');

-- CreateEnum
CREATE TYPE "PanenStatus" AS ENUM ('PENDING_PICKUP', 'PENDING_DROPOFF', 'IN_WAREHOUSE', 'IN_TRANSIT', 'DELIVERED');

-- CreateEnum
CREATE TYPE "WtbStatus" AS ENUM ('OPEN', 'DEAL', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PengirimanKapalStatus" AS ENUM ('WAITING_DEPARTURE', 'IN_TRANSIT', 'ARRIVED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "phoneNumber" TEXT,
    "pin" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'PETANI',
    "kopdesId" TEXT,
    "ecoPoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Panen" (
    "id" TEXT NOT NULL,
    "petaniId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expectedWeight" DOUBLE PRECISION NOT NULL,
    "tanggalPanen" TIMESTAMP(3) NOT NULL,
    "pengirimanMethod" "PengirimanMethod" NOT NULL,
    "actualWeight" DOUBLE PRECISION,
    "grade" TEXT,
    "moisture" DOUBLE PRECISION,
    "basePricePerKg" DOUBLE PRECISION,
    "profitMargin" DOUBLE PRECISION,
    "status" "PanenStatus" NOT NULL DEFAULT 'PENDING_PICKUP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "batchId" TEXT,

    CONSTRAINT "Panen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "pengirimanKapalId" TEXT,
    "type" TEXT NOT NULL,
    "totalWeight" DOUBLE PRECISION NOT NULL,
    "status" "PanenStatus" NOT NULL DEFAULT 'IN_WAREHOUSE',
    "wtbListingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ledger" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "prevHash" TEXT NOT NULL,
    "currentHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WtbListing" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "komoditas" TEXT NOT NULL,
    "targetWeight" DOUBLE PRECISION NOT NULL,
    "maxPrice" DOUBLE PRECISION NOT NULL,
    "destination" TEXT NOT NULL,
    "status" "WtbStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WtbListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Negosiasi" (
    "id" TEXT NOT NULL,
    "wtbId" TEXT NOT NULL,
    "senderRole" "Role" NOT NULL,
    "offeredPrice" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Negosiasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PengirimanKapal" (
    "id" TEXT NOT NULL,
    "namaKapal" TEXT NOT NULL,
    "rute" TEXT NOT NULL,
    "totalBiaya" DOUBLE PRECISION NOT NULL,
    "totalWeight" DOUBLE PRECISION NOT NULL,
    "status" "PengirimanKapalStatus" NOT NULL DEFAULT 'WAITING_DEPARTURE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PengirimanKapal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SplitBill" (
    "id" TEXT NOT NULL,
    "pengirimanKapalId" TEXT NOT NULL,
    "lokasiKopdes" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "amountToPay" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SplitBill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kopdes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kopdes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL DEFAULT 'global_config',
    "autoVerifyNewUser" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Ledger_batchId_key" ON "Ledger"("batchId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_kopdesId_fkey" FOREIGN KEY ("kopdesId") REFERENCES "Kopdes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Panen" ADD CONSTRAINT "Panen_petaniId_fkey" FOREIGN KEY ("petaniId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Panen" ADD CONSTRAINT "Panen_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_pengirimanKapalId_fkey" FOREIGN KEY ("pengirimanKapalId") REFERENCES "PengirimanKapal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_wtbListingId_fkey" FOREIGN KEY ("wtbListingId") REFERENCES "WtbListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WtbListing" ADD CONSTRAINT "WtbListing_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Negosiasi" ADD CONSTRAINT "Negosiasi_wtbId_fkey" FOREIGN KEY ("wtbId") REFERENCES "WtbListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SplitBill" ADD CONSTRAINT "SplitBill_pengirimanKapalId_fkey" FOREIGN KEY ("pengirimanKapalId") REFERENCES "PengirimanKapal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
