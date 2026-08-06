import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { EcoPointTxType, PanenStatus, PengirimanMethod } from "@prisma/client";
import { randomBytes } from "crypto";

const generatePin = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateTrackingCode = () => {
  return `ECO-${randomBytes(3).toString("hex").toUpperCase()}`;
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await req.json();
    const { komoditasType, beratKg, catatan, pengirimanMethod } = body;

    const parsedWeight = parseFloat(beratKg);
    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      return NextResponse.json(
        { error: "Berat limbah harus berupa angka positif." },
        { status: 400 },
      );
    }

    const type = (komoditasType || "SABUT").toUpperCase();
    const method: PengirimanMethod =
      pengirimanMethod === "SELF_DELIVERY"
        ? PengirimanMethod.SELF_DELIVERY
        : PengirimanMethod.PICKUP;

    // Hitung perolehan Eco-Points: 1 Kg limbah = 1 EcoPoint (minimum 10 Pts)
    const pointsEarned = Math.max(10, Math.round(parsedWeight * 1));

    const result = await prisma.$transaction(async (tx) => {
      // 1. Dapatkan profil user
      const user = await tx.user.findUnique({
        where: { id: userId },
      });
      if (!user) throw new Error("User tidak ditemukan.");

      // 2. Tambah poin user
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          ecoPoints: { increment: pointsEarned },
        },
      });

      // 3. Catat riwayat transaksi EcoPointTx
      const newTx = await tx.ecoPointTx.create({
        data: {
          petaniId: userId,
          type: EcoPointTxType.EARN,
          points: pointsEarned,
          activity: `Setor Limbah ${type} (${parsedWeight} Kg)`,
        },
      });

      // 4. Kurangi stok inventori jika ada
      const inventory = await tx.farmerInventory.findFirst({
        where: {
          petaniId: userId,
          jenisProduk: { equals: type, mode: "insensitive" },
        },
      });

      if (inventory && inventory.jumlah >= parsedWeight) {
        await tx.farmerInventory.update({
          where: { id: inventory.id },
          data: { jumlah: { decrement: parsedWeight } },
        });

        await tx.inventoryMutation.create({
          data: {
            petaniId: userId,
            komoditas: type,
            tipe: "KELUAR",
            jumlah: parsedWeight,
            satuan: inventory.satuan || "Kg",
            alasan: "PENJUALAN",
            keterangan: `Penyetoran limbah untuk Eco-Points (+${pointsEarned} Pts)`,
          },
        });
      }

      // 5. Catat data Panen / Setor Limbah agar terarsip dan terlacak
      const trackingCode = generateTrackingCode();
      const panenRecord = await tx.panen.create({
        data: {
          petaniId: userId,
          kopdesId: user.kopdesId,
          type: type,
          expectedWeight: parsedWeight,
          actualWeight: parsedWeight,
          tanggalPanen: new Date(),
          pengirimanMethod: method,
          status:
            method === PengirimanMethod.PICKUP
              ? PanenStatus.PENDING_PICKUP
              : PanenStatus.DELIVERED,
          trackingCode: trackingCode,
          qrCodePass: `QR-${trackingCode}`,
          handoverPin: generatePin(),
        },
      });

      return {
        success: true,
        pointsEarned,
        balance: updatedUser.ecoPoints,
        transaction: newTx,
        panen: panenRecord,
      };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Error submitting waste:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
