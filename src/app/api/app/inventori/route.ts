import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { inventoryAdditionSchema } from "@/lib/validations/inventory.schema";
import { getDefaultSatuan } from "@/lib/satuan";
import { InventoryMutationReason } from "@prisma/client";

// get all inventory for a user
export async function GET(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [stocks, rawMutations, user] = await Promise.all([
      prisma.farmerInventory.findMany({
        where: { petaniId: session.user.id },
        orderBy: { kategori: "asc" },
      }),
      prisma.inventoryMutation.findMany({
        where: { petaniId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        include: { kopdes: true },
      }),
    ]);

    const kopdesName = user?.kopdes?.name || "Koperasi Desa";
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

    const mutations = rawMutations.map((m) => {
      let ket = m.keterangan || "";
      if (uuidRegex.test(ket)) {
        ket = `Pengiriman ${m.komoditas} ke ${kopdesName}`;
      } else if (ket === "Pengurangan stok untuk KONSUMSI_PRIBADI") {
        ket = `Konsumsi pribadi ${m.komoditas}`;
      } else if (ket === "Pengurangan stok untuk RUSAK_SUSUT") {
        ket = `Penyusutan / kerusakan stok ${m.komoditas}`;
      }
      return {
        ...m,
        keterangan: ket,
      };
    });

    return NextResponse.json({ stocks, mutations });
  } catch (error) {
    console.error("Error getting inventory:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// add new inventory
export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = inventoryAdditionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.format() },
        { status: 400 },
      );
    }

    const { kategori, jenisProduk, jumlah, satuan, keterangan } = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      // 1. check for existing inventory
      const existingStock = await tx.farmerInventory.findUnique({
        where: {
          petaniId_jenisProduk: {
            petaniId: session.user.id,
            jenisProduk: jenisProduk,
          },
        },
      });

      // 2. upsert inventory stock
      const updatedStock = await tx.farmerInventory.upsert({
        where: {
          petaniId_jenisProduk: {
            petaniId: session.user.id,
            jenisProduk: jenisProduk,
          },
        },
        update: {
          jumlah: {
            increment: jumlah,
          },
        },
        create: {
          petaniId: session.user.id,
          kategori,
          jenisProduk,
          jumlah,
          satuan: satuan || getDefaultSatuan(jenisProduk),
        },
      });

      // 3. create mutation log with consistent satuan
      const mutation = await tx.inventoryMutation.create({
        data: {
          petaniId: session.user.id,
          komoditas: jenisProduk,
          tipe: "MASUK",
          jumlah: jumlah,
          satuan: existingStock?.satuan || updatedStock.satuan,
          alasan: InventoryMutationReason.HASIL_PANEN, // default reason for direct add
          keterangan: keterangan || "Penambahan stok manual",
        },
      });

      return { updatedStock, mutation };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error adding inventory:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
