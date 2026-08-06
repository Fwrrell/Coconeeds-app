import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NegosiasiStatus, WtbStatus } from "@prisma/client";

// perusahaan update status negosiasi deal / reject / counter
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; negoId: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Autentikasi diperlukan." },
        { status: 401 },
      );
    }

    const { id: wtbId, negoId } = await params;
    const body = await req.json();
    const { status, counterPrice, note } = body;

    if (!status || !Object.values(NegosiasiStatus).includes(status)) {
      return NextResponse.json(
        { error: "Status negosiasi tidak valid. (ACCEPTED, REJECTED, COUNTER_OFFER)" },
        { status: 400 },
      );
    }

    const wtb = await prisma.wtbListing.findUnique({
      where: { id: wtbId },
    });

    if (!wtb) {
      return NextResponse.json(
        { error: "Data WTB tidak ditemukan." },
        { status: 404 },
      );
    }

    // otorisasi: hanya perusahaan pemilik WTB ato admin yg bsa update nego
    if (session.user.role === "PERUSAHAAN" && wtb.perusahaanId !== session.user.id) {
      return NextResponse.json(
        { error: "Anda tidak memiliki wewenang untuk memperbarui negosiasi WTB ini." },
        { status: 403 },
      );
    }

    const existingNego = await prisma.negosiasi.findUnique({
      where: { id: negoId },
    });

    if (!existingNego || existingNego.wtbId !== wtbId) {
      return NextResponse.json(
        { error: "Data negosiasi tidak ditemukan." },
        { status: 404 },
      );
    }

    const updatedNego = await prisma.negosiasi.update({
      where: { id: negoId },
      data: {
        status: status as NegosiasiStatus,
        offeredPrice: counterPrice ? Number(counterPrice) : existingNego.offeredPrice,
        note: note || existingNego.note,
      },
    });

    // hitung total volume terpenuhi buat cek deal
    if (status === "ACCEPTED") {
      const allAcceptedNegos = await prisma.negosiasi.findMany({
        where: {
          wtbId: wtbId,
          status: NegosiasiStatus.ACCEPTED,
        },
      });

      const totalAcceptedVolume = allAcceptedNegos.reduce(
        (sum, n) => sum + (n.volumeKg || 0),
        0
      );

      const finalPrice = counterPrice ? Number(counterPrice) : updatedNego.offeredPrice;

      // jika total volume terpenuhi melebihi target, ubah status WTB ke DEAL & reject sisa pending
      if (totalAcceptedVolume >= wtb.targetWeight) {
        await prisma.wtbListing.update({
          where: { id: wtbId },
          data: {
            status: WtbStatus.DEAL,
            dealPrice: finalPrice,
          },
        });

        await prisma.negosiasi.updateMany({
          where: {
            wtbId: wtbId,
            status: NegosiasiStatus.PENDING,
            id: { not: negoId },
          },
          data: {
            status: NegosiasiStatus.REJECTED,
          },
        });
      }
    }

    return NextResponse.json({
      message: `Negosiasi berhasil diperbarui menjadi ${status}.`,
      data: updatedNego,
    });
  } catch (err) {
    console.error("Error in PATCH /api/wtb/[id]/negosiasi/[negoId]:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada sistem." },
      { status: 500 },
    );
  }
}
