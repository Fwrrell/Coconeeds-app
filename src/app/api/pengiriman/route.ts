import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { namaKapal, rute, totalBiaya, batchIds } = body;

    // validate
    if (
      !namaKapal ||
      !rute ||
      !totalBiaya ||
      !batchIds ||
      batchIds.length === 0
    ) {
      return NextResponse.json(
        { error: "Data tidak lengkap. Pastikan semua data terisi." },
        { status: 400 },
      );
    }

    // ambil data batch beserta data panen dan lokasi petani
    const batches = await prisma.batch.findMany({
      where: { id: { in: batchIds } },
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

    if (batches.length === 0) {
      return NextResponse.json(
        { error: "Batch tidak ditemukan." },
        { status: 404 },
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

    // execute db
    const result = await prisma.$transaction(async (tx) => {
      // record pengiriman kapal
      const kapal = await tx.pengirimanKapal.create({
        data: {
          namaKapal,
          rute,
          totalBiaya: Number(totalBiaya),
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

      // hitung proporsi tagihan (split bill sesuai beban yang disumbang) + bikni record
      const splitBillsData = Object.entries(locationWeights).map(
        ([lokasi, weightDesa]) => {
          // rumus: (berat desa / total berat) * total biaya
          const amountToPay =
            (weightDesa / totalWeightKapal) * Number(totalBiaya);

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
