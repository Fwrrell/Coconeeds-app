import { NextResponse } from "next/server";
import { PanenStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import crypto from "crypto";

import { qcBatchSchema } from "@/lib/validations/qc-batch.schema";

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

    // role check: only ADMIN can perform quality control and batching
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses untuk memproses QC." },
        { status: 403 },
      );
    }

    const body = await req.json();

    // zod validation
    const parsed = qcBatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { type, kopdesId, panenList } = parsed.data;

    // Cek apakah semua panenId yang diberikan ada di database
    const panenIds = panenList.map((p) => p.panenId);
    const existingPanens = await prisma.panen.findMany({
      where: {
        id: { in: panenIds },
      },
    });

    if (existingPanens.length !== panenIds.length) {
      const foundIds = existingPanens.map((p) => p.id);
      const notFoundIds = panenIds.filter((id) => !foundIds.includes(id));
      return NextResponse.json(
        {
          error: `Panen dengan ID berikut tidak ditemukan: ${notFoundIds.join(", ")}`,
        },
        { status: 404 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // total barang aktual dari seluruh barang yang digabung
      const totalWeight = panenList.reduce(
        (acc, curr) => acc + curr.actualWeight,
        0,
      );

      // bikin batch baru
      const newBatch = await tx.batch.create({
        data: {
          type,
          totalWeight,
          status: PanenStatus.IN_WAREHOUSE,
          kopdesId,
        },
      });

      // update data QC untuk setiap hasil panen dan connectin ke batch
      for (const item of panenList) {
        await tx.panen.update({
          where: { id: item.panenId },
          data: {
            actualWeight: item.actualWeight,
            grade: item.grade,
            moisture: item.moisture,
            basePricePerKg: item.basePricePerKg,
            status: PanenStatus.IN_WAREHOUSE,
            batchId: newBatch.id,
          },
        });
      }

      // traceability ledger: cari hash dari batch terakhir agar chaining
      const lastLedger = await tx.ledger.findFirst({
        orderBy: { createdAt: "desc" },
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
      { error: "Terjadi kesalahan pada sistem." },
      { status: 500 },
    );
  }
}
