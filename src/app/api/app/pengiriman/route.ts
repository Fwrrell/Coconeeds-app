import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { shipmentRequestSchema } from "@/lib/validations/pengiriman.schema";
import { PanenStatus } from "@prisma/client";
import { randomBytes } from "crypto";

// Function to generate a random 6-digit PIN
const generatePin = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Function to generate a random tracking code
const generateTrackingCode = () => {
  return `TRK-${randomBytes(3).toString("hex").toUpperCase()}`;
};

// GET all shipments for the logged-in user
export async function GET(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const shipments = await prisma.panen.findMany({
      where: {
        petaniId: session.user.id,
        // Only fetch records created as shipments, not all panen
        NOT: {
          trackingCode: null,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        kopdes: {
          select: { name: true },
        },
      },
    });

    const activeShipments = shipments.filter((s) => s.status !== "DELIVERED");
    const historyShipments = shipments.filter((s) => s.status === "DELIVERED");

    return NextResponse.json({ activeShipments, historyShipments });
  } catch (error) {
    console.error("Error getting shipments:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST to create a new shipment request
export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = shipmentRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.format() },
        { status: 400 },
      );
    }

    const {
      kopdesId,
      komoditasType,
      beratKg,
      hargaDasar,
      catatanPickup,
      pengirimanMethod,
      tanggalPanen,
    } = parsed.data;

    // check available stock
    const stock = await prisma.farmerInventory.findFirst({
      where: {
        petaniId: session.user.id,
        jenisProduk: komoditasType,
      },
    });

    if (!stock || stock.jumlah < beratKg) {
      throw new Error(`Stok ${komoditasType} tidak mencukupi.`);
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. reduce stock
      await tx.farmerInventory.update({
        where: { id: stock.id },
        data: { jumlah: { decrement: beratKg } },
      });

      // 2. create mutation log
      await tx.inventoryMutation.create({
        data: {
          petaniId: session.user.id,
          komoditas: komoditasType,
          tipe: "KELUAR",
          jumlah: beratKg,
          satuan: stock.satuan,
          alasan: "PENJUALAN",
          keterangan: `Pengiriman ke ${kopdesId}`,
        },
      });

      // 3. create Panen/Shipment record
      const newShipment = await tx.panen.create({
        data: {
          petaniId: session.user.id,
          kopdesId,
          type: komoditasType,
          expectedWeight: beratKg,
          tanggalPanen: new Date(tanggalPanen),
          pengirimanMethod,
          basePricePerKg: hargaDasar,
          status:
            pengirimanMethod === "PICKUP"
              ? PanenStatus.PENDING_PICKUP
              : PanenStatus.PENDING_DROPOFF,
          trackingCode: generateTrackingCode(),
          qrCodePass: `QR-${generateTrackingCode()}`, // simple qr data
          handoverPin: generatePin(),
        },
      });
      return newShipment;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Error creating shipment:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
