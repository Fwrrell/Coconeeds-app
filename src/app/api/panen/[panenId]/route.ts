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

    if (!pickupScheduledAt) {
      return NextResponse.json(
        { error: "Tanggal penjemputan wajib diisi." },
        { status: 400 }
      );
    }

    const scheduledDate = new Date(pickupScheduledAt);

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
