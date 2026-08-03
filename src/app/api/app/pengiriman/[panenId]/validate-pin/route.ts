import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { handoverValidationSchema } from "@/lib/validations/pengiriman.schema";
import { PanenStatus } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ panenId: string }> },
) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { panenId } = await params;
    const body = await req.json();
    const parsed = handoverValidationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.format() },
        { status: 400 },
      );
    }

    const { pin } = parsed.data;

    const shipment = await prisma.panen.findFirst({
      where: {
        id: panenId,
        petaniId: session.user.id,
      },
    });

    if (!shipment) {
      return NextResponse.json(
        { error: "Pengiriman tidak ditemukan" },
        { status: 404 },
      );
    }

    if (shipment.handoverPin !== pin) {
      return NextResponse.json({ error: "PIN salah" }, { status: 400 });
    }

    if (shipment.handoverValidatedAt) {
      return NextResponse.json(
        { error: "Sudah divalidasi sebelumnya" },
        { status: 400 },
      );
    }

    const updatedShipment = await prisma.panen.update({
      where: { id: panenId },
      data: {
        handoverValidatedAt: new Date(),
        status: PanenStatus.QC_IN_PROGRESS,
      },
    });

    return NextResponse.json(updatedShipment);
  } catch (error) {
    console.error("Error validating handover:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
