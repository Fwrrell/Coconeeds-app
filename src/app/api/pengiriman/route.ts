import { PanenStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

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
        status: PanenStatus.IN_WAREHOUSE,
        pengirimanKapalId: null,
      },
      include: {
        panens: {
          include: {
            petani: {
              select: { location: true },
            },
          },
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

      // hitung berat yang disumbang per lokasi dalam 1 batch
      for (const panen of batch.panens) {
        const lokasiDesa = panen.petani.location || "Lokasi tidak diketahui";

        // pake actualWeight (berat setelah QC), mencegah potensi actualWeight 0 kita bisa ambil berat perhitungan petani
        const beratPanen = panen.actualWeight || panen.expectedWeight;

        if (!locationWeights[lokasiDesa]) {
          locationWeights[lokasiDesa] = 0;
        }
        locationWeights[lokasiDesa] += beratPanen;
      }
    }

    
    // Guard clause to prevent division by zero
    if (totalWeightKapal <= 0) {
      return NextResponse.json(
        { error: "Total berat dari semua batch tidak boleh nol atau negatif." },
        { status: 400 },
      );
    }

    // execute db
    const result = await prisma.$transaction(async (tx) => {
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
          const amountToPay =
            (weightDesa / totalWeightKapal) * totalBiaya;

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
