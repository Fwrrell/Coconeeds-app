import { NextResponse } from "next/server";
import { PanenStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, panenList } = body;

    // validate
    if (
      !type ||
      !panenList ||
      !Array.isArray(panenList) ||
      panenList.length === 0
    ) {
      return NextResponse.json(
        { error: "Data tidak valid. Pastikan semua data terisi." },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // total barang aktual dari seluruh barang yang digabung
      const totalWeight = panenList.reduce(
        (acc, curr) => acc + parseFloat(curr.actualWeight),
        0,
      );

      // bikin batch baru
      const newBatch = await tx.batch.create({
        data: {
          type,
          totalWeight,
          status: PanenStatus.IN_WAREHOUSE,
        },
      });

      // update data QC untuk setiap hasil panen dan connectin ke batch
      for (const item of panenList) {
        await tx.panen.update({
          where: { id: item.panenId },
          data: {
            actualWeight: parseFloat(item.actualWeight),
            grade: item.grade,
            moisture: parseFloat(item.moisture),
            basePricePerKg: parseFloat(item.basePricePerKg),
            status: PanenStatus.IN_WAREHOUSE,
            batchId: newBatch.id,
          },
        });
      }

      // traceability ledger: cari hash dari batch terakhir agar chaining
      const lastLedger = await tx.ledger.findFirst({
        orderBy: { createdAt: "asc" },
      });

      const prevHash = lastLedger ? lastLedger.currentHash : "GENESIS_BLOCK";

      // merge data krusial untuk di hash
      const timestamp = new Date().toISOString();
      const dataToHash = `${newBatch.id}-${type}-${totalWeight}-${timestamp}-${prevHash}`;

      // encrypt SHA-256
      const currentHash = crypto
        .createHash("sha256")
        .update(dataToHash)
        .digest("hex");

      // simpen ke ledger
      const newLedger = await tx.ledger.create({
        data: {
          batchId: newBatch.id,
          prevHash,
          currentHash,
        },
      });

      return { newBatch, newLedger };
    });

    return NextResponse.json(
      {
        message: "QC Berhasil. Batch dan Traceability Ledger berhasil dibuat.",
        data: result,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Error in POST /api/qc-batch:", err);
    return NextResponse.json(
      { error: "Terjadi kesalah pada sistem." },
      { status: 500 },
    );
  }
}
