import { NextResponse } from "next/server";
import { PengirimanMethod, PanenStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

import { panenSchema } from "@/lib/validations/panen.schema";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Autentikasi diperlukan." },
        { status: 401 },
      );
    }

    const body = await req.json();

    const parsed = panenSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { petaniId, type, expectedWeight, tanggalPanen, pengirimanMethod } =
      parsed.data;
    const kopdesId = (body as { kopdesId?: string }).kopdesId;

    if (session.user.role === "PETANI" && session.user.id !== petaniId) {
      return NextResponse.json(
        {
          error:
            "Anda tidak memiliki akses untuk membuat data panen atas nama user lain.",
        },
        { status: 403 },
      );
    }
    if (session.user.role !== "PETANI" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Anda tidak memiliki izin untuk membuat data panen." },
        { status: 403 },
      );
    }

    const initStatus =
      pengirimanMethod === "SELF_DELIVERY"
        ? PanenStatus.PENDING_DROPOFF
        : PanenStatus.PENDING_PICKUP;

    const newPanen = await prisma.panen.create({
      data: {
        petaniId,
        kopdesId,
        type,
        expectedWeight,
        tanggalPanen,
        pengirimanMethod,
        status: initStatus,
      },
    });

    return NextResponse.json(
      {
        message: "Data panen berhasil disubmit. Menunggu proses QC",
        data: newPanen,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Error in POST /api/panen:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada sistem." },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Autentikasi diperlukan." },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const petaniId = searchParams.get("petaniId");
    const status = searchParams.get("status");
    const kopdesId = searchParams.get("kopdesId");

    if (session.user.role === "PETANI") {
      if (!petaniId || session.user.id !== petaniId) {
        return NextResponse.json(
          {
            error:
              "Anda hanya diperbolehkan melihat riwayat panen Anda sendiri.",
          },
          { status: 403 },
        );
      }
    }

    if (session.user.role === "ADMIN" && kopdesId) {
      const wherePanen: any = {
        status: {
          in: [
            PanenStatus.PENDING_PICKUP,
            PanenStatus.PENDING_DROPOFF,
            PanenStatus.QC_IN_PROGRESS,
          ],
        },
      };

      const whereBatch: any = {
        status: PanenStatus.IN_WAREHOUSE,
      };

      if (kopdesId !== "ALL") {
        wherePanen.kopdesId = kopdesId;
        whereBatch.kopdesId = kopdesId;
      }

      const [pendingRaw, warehouseRaw] = await Promise.all([
        prisma.panen.findMany({
          where: wherePanen,
          include: { petani: { select: { name: true, phoneNumber: true } } },
          orderBy: { createdAt: "desc" },
        }),
        prisma.batch.findMany({
          where: whereBatch,
          include: { panens: { select: { grade: true } } },
          orderBy: { createdAt: "desc" },
        }),
      ]);

      const formattedPending = pendingRaw.map((p) => ({
        id: p.id,
        date: p.tanggalPanen,
        farmerName: p.petani?.name || "Unknown",
        farmerPhone: p.petani?.phoneNumber || "-",
        type: p.type,
        declaredWeight: p.expectedWeight,
        status: p.status,
        handoverPin: p.handoverPin,
        handoverValidatedAt: p.handoverValidatedAt,
        pickupScheduledAt: p.pickupScheduledAt,
        pengirimanMethod: p.pengirimanMethod,
      }));

      const formattedWarehouse = warehouseRaw.map((b) => {
        const batchGrade =
          b.panens && b.panens.length > 0 ? b.panens[0].grade : "N/A";
        return {
          id: b.id,
          type: b.type,
          totalWeight: b.totalWeight,
          grade: batchGrade || "N/A",
          dateProcessed: b.createdAt,
          status: b.status,
        };
      });

      return NextResponse.json(
        {
          pending: formattedPending,
          warehouse: formattedWarehouse,
        },
        { status: 200 },
      );
    }

    const queryOptions: any = {
      orderBy: { createdAt: "desc" },
      include: {
        petani: {
          select: { name: true, phoneNumber: true },
        },
        kopdes: {
          select: { name: true },
        },
      },
    };

    if (petaniId) {
      queryOptions.where = { petaniId: petaniId };
    } else if (status === "pending") {
      queryOptions.where = {
        status: {
          in: [
            PanenStatus.PENDING_PICKUP,
            PanenStatus.PENDING_DROPOFF,
            PanenStatus.QC_IN_PROGRESS,
          ],
        },
      };
    }

    const dataPanen = await prisma.panen.findMany(queryOptions);

    return NextResponse.json(
      { message: "Berhasil mengambil data panen.", data: dataPanen },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error in GET /api/panen:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada sistem." },
      { status: 500 },
    );
  }
}
