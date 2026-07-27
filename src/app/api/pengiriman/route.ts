import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

import { pengirimanSchema } from "@/lib/validations/pengiriman.schema";

export async function POST(req: Request) {
  try {
    // auth check
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Autentikasi diperlukan." },
        { status: 401 },
      );
    }

    // role check: only ADMIN can manage shipments
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses untuk membuat pengiriman." },
        { status: 403 },
      );
    }

    const body = await req.json();

    // zod validation
    const parsed = pengirimanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { namaKapal, rute, totalBiaya, batchIds } = parsed.data;

    // ambil data batch beserta data panen dan lokasi petani
    const batches = await prisma.batch.findMany({
      where: {
        id: { in: batchIds },
        status: "IN_WAREHOUSE",
        pengirimanKapalId: null,
      },
      include: {
        kopdes: {
          select: { name: true },
        },
      },
    });

    // Validasi jika ada batch yang tidak valid atau sudah dikirim
    if (batches.length !== batchIds.length) {
      return NextResponse.json(
        {
          error:
            "Beberapa Batch ID tidak valid, tidak ditemukan, atau sudah dalam pengiriman lain. Hanya batch dengan status 'IN_WAREHOUSE' yang dapat diproses.",
        },
        { status: 400 },
      );
    }

    // logic calculate: kelompokkan berat berdasarkan lokasi
    let totalWeightKapal = 0;
    const locationWeights: Record<string, number> = {};

    for (const batch of batches) {
      totalWeightKapal += batch.totalWeight;

      // ambil nama KOpdes, jika null set ke "Global"
      const lokasiDesa =
        batch.kopdes?.name || "Kopdes Global / Tidak Diketahui";

      if (!locationWeights[lokasiDesa]) {
        locationWeights[lokasiDesa] = 0;
      }
      // Tambahkan berat satu batch penuh ke tagihan Kopdes tersebut
      locationWeights[lokasiDesa] += batch.totalWeight;
    }

    // Guard clause to prevent division by zero
    if (totalWeightKapal <= 0) {
      return NextResponse.json(
        { error: "Total berat dari semua batch tidak boleh nol atau negatif." },
        { status: 400 },
      );
    }

    // execute db
    const result = await prisma.$transaction(async (tx: any) => {
      // record pengiriman kapal
      const kapal = await tx.pengirimanKapal.create({
        data: {
          namaKapal,
          rute,
          totalBiaya: totalBiaya,
          totalWeight: totalWeightKapal,
          status: "WAITING_DEPARTURE",
        },
      });

      // update batch masukkin id kapal ke batch dan ubah statusnya
      await tx.batch.updateMany({
        where: { id: { in: batchIds } },
        data: {
          pengirimanKapalId: kapal.id,
          status: "IN_TRANSIT",
        },
      });

      // hitung proporsi tagihan (split bill sesuai beban yang disumbang) + bikin record
      const splitBillsData = Object.entries(locationWeights).map(
        ([lokasi, weightDesa]) => {
          // rumus: (berat desa / total berat) * total biaya
          const amountToPay = (weightDesa / totalWeightKapal) * totalBiaya;

          return {
            pengirimanKapalId: kapal.id,
            lokasiKopdes: lokasi,
            weight: weightDesa,
            amountToPay: amountToPay,
          };
        },
      );

      // insert semua data tagihan
      await tx.splitBill.createMany({
        data: splitBillsData,
      });

      return kapal;
    });

    return NextResponse.json(
      {
        message: "Pengiriman dan Split Bill berhasil dibuat.",
        data: result,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Error in POST /api/pengiriman:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada sistem." },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    // Auth & Role Check
    const session = await auth();
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Autentikasi diperlukan atau akses ditolak." },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const kopdesId = searchParams.get("kopdesId");

    // Filter Dinamis untuk Kapal & Batch
    const whereShipment: any = {};
    const whereBatch: any = {
      status: "IN_WAREHOUSE",
      pengirimanKapalId: null,
    };

    if (kopdesId && kopdesId !== "ALL") {
      // Jika bukan ALL, filter kapal yang HANYA membawa barang milik Kopdes ini
      whereShipment.batches = {
        some: { kopdesId: kopdesId },
      };
      whereBatch.kopdesId = kopdesId;
    }

    const [shipmentsRaw, availableBatchesRaw] = await Promise.all([
      prisma.pengirimanKapal.findMany({
        where: whereShipment,
        orderBy: { createdAt: "desc" },
      }),
      prisma.batch.findMany({
        where: whereBatch,
        include: {
          kopdes: { select: { name: true } },
          panens: { select: { grade: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // mapping Data Batch agar sesuai dengan tabel UI
    const formattedBatches = availableBatchesRaw.map((b: any) => {
      const batchGrade =
        b.panens && b.panens.length > 0 ? b.panens[0].grade : "N/A";
      return {
        id: b.id,
        type: b.type,
        weight: b.totalWeight,
        grade: batchGrade || "N/A",
        dateProcessed: b.createdAt,
        originKopdes: b.kopdes?.name || "Global",
      };
    });

    return NextResponse.json(
      {
        shipments: shipmentsRaw,
        availableBatches: formattedBatches,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error in GET /api/pengiriman:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan sistem." },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Autentikasi diperlukan atau akses ditolak." },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { shipmentId, status } = body;

    if (!shipmentId || !status) {
      return NextResponse.json(
        { error: "Data shipmentId dan status wajib dikirim." },
        { status: 400 },
      );
    }

    // Update status di tabel PengirimanKapal
    const updatedShipment = await prisma.pengirimanKapal.update({
      where: { id: shipmentId },
      data: { status: status },
    });

    if (status === "IN_TRANSIT") {
      await prisma.batch.updateMany({
        where: { pengirimanKapalId: shipmentId },
        data: { status: "IN_TRANSIT" },
      });
    }

    return NextResponse.json(
      {
        message: "Status pengiriman berhasil diperbarui",
        data: updatedShipment,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error in PATCH /api/pengiriman:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada sistem." },
      { status: 500 },
    );
  }
}
