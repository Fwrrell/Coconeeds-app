import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkAdminAccess } from "@/lib/admin-guard";

// admin atur tgl penjemputan armada (tanpa jam)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ panenId: string }> }
) {
  const isAllowed = await checkAdminAccess();
  if (!isAllowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { panenId } = await params;
    const body = await req.json();
    const { pickupScheduledAt } = body;

    if (!pickupScheduledAt || isNaN(new Date(pickupScheduledAt).getTime())) {
      return NextResponse.json(
        { error: "Tanggal penjemputan tidak valid." },
        { status: 400 },
      );
    }

    const scheduledDate = new Date(pickupScheduledAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const panen = await prisma.panen.findUnique({
      where: { id: panenId },
      select: { tanggalPanen: true },
    });

    if (!panen) {
      return NextResponse.json({ error: "Data panen tidak ditemukan." }, { status: 404 });
    }

    const farmerRequestDate = panen.tanggalPanen;
    farmerRequestDate.setHours(0, 0, 0, 0);
    
    const minDate = farmerRequestDate > today ? farmerRequestDate : today;

    if (scheduledDate < minDate) {
      return NextResponse.json(
        {
          error: `Tanggal penjemputan tidak boleh kurang dari ${minDate.toLocaleDateString(
            "id-ID",
          )}.`,
        },
        { status: 400 },
      );
    }

    const updated = await prisma.panen.update({
      where: { id: panenId },
      data: {
        pickupScheduledAt: scheduledDate,
      },
    });

    return NextResponse.json({
      message: "Jadwal penjemputan berhasil diperbarui.",
      data: updated,
    });
  } catch (err) {
    console.error("Error setting pickup schedule:", err);
    return NextResponse.json(
      { error: "Gagal memperbarui jadwal penjemputan." },
      { status: 500 }
    );
  }
}
