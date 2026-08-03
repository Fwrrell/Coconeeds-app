import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { inventoryReductionSchema } from "@/lib/validations/inventory.schema";

// reduce stock for consumption or spoilage
export async function POST(req: Request) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const parsed = inventoryReductionSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
        }
        
        const { alasan, komoditas, jumlah, satuan } = parsed.data;

        const result = await prisma.$transaction(async (tx) => {
            const currentStock = await tx.farmerInventory.findUnique({
                where: {
                    petaniId_jenisProduk: {
                        petaniId: session.user.id,
                        jenisProduk: komoditas,
                    }
                }
            });

            if (!currentStock || currentStock.jumlah < jumlah) {
                throw new Error(`Stok ${komoditas} tidak mencukupi.`);
            }

            // 1. decrease stock
            await tx.farmerInventory.update({
                where: { id: currentStock.id },
                data: { jumlah: { decrement: jumlah } },
            });

            // 2. log mutation
            await tx.inventoryMutation.create({
                data: {
                    petaniId: session.user.id,
                    komoditas: komoditas,
                    tipe: 'KELUAR',
                    jumlah: jumlah,
                    satuan: satuan,
                    alasan: alasan,
                    keterangan: `Pengurangan stok untuk ${alasan}`,
                }
            });
            
            return { message: "Pengurangan stok berhasil dicatat" };
        });

         return NextResponse.json(result, { status: 201 });

    } catch (error: any) {
        console.error("Error reducing inventory:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
