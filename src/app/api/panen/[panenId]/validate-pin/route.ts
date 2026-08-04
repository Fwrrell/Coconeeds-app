import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkAdminAccess } from "@/lib/admin-guard";
import { PanenStatus } from "@prisma/client";

// admin validasi pin penjemputan petani
export async function POST(
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
    const { pin } = body;

    if (!pin) {
      return NextResponse.json({ error: "PIN wajib diisi." }, { status: 400 });
    }

    const panen = await prisma.panen.findUnique({
      where: { id: panenId },
    });

    if (!panen) {
      return NextResponse.json(
        { error: "Data panen tidak ditemukan." },
        { status: 404 }
      );
    }

    // cocokin pin penjemputan petani (fallback code 884219 klo null)
    const expectedPin = panen.handoverPin || "884219";
    if (pin !== expectedPin) {
      return NextResponse.json(
        { error: "Kode PIN penyerahan tidak cocok!" },
        { status: 400 }
      );
    }

    const updated = await prisma.panen.update({
      where: { id: panenId },
      data: {
        handoverValidatedAt: new Date(),
        status: PanenStatus.QC_IN_PROGRESS,
      },
    });

    return NextResponse.json({
      message: "PIN valid! Status berubah ke QC In Progress.",
      data: updated,
    });
  } catch (err) {
    console.error("Error validating PIN:", err);
    return NextResponse.json(
      { error: "Gagal memvalidasi PIN penyerahan." },
      { status: 500 }
    );
  }
}
