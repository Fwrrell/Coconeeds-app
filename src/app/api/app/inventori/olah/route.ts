import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { inventoryProcessSchema } from "@/lib/validations/inventory.schema";
import { InventoryMutationReason } from "@prisma/client";

// process raw material into finished product
export async function POST(req: Request) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const parsed = inventoryProcessSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
        }

        const { bahanBaku, jumlahBahan, hasilOlahan, jumlahHasil } = parsed.data;

        const result = await prisma.$transaction(async (tx) => {
            // 1. check and decrease raw material stock
            const bahanBakuStock = await tx.farmerInventory.findUnique({
                where: {
                    petaniId_jenisProduk: {
                        petaniId: session.user.id,
                        jenisProduk: bahanBaku,
                    }
                }
            });

            if (!bahanBakuStock || bahanBakuStock.jumlah < jumlahBahan) {
                throw new Error(`Stok ${bahanBaku} tidak mencukupi.`);
            }

            const updatedBahanBaku = await tx.farmerInventory.update({
                where: { id: bahanBakuStock.id },
                data: { jumlah: { decrement: jumlahBahan } },
            });
            
            // 2. create mutation log for raw material reduction
            await tx.inventoryMutation.create({
                data: {
                    petaniId: session.user.id,
                    komoditas: bahanBaku,
                    tipe: 'KELUAR',
                    jumlah: jumlahBahan,
                    satuan: updatedBahanBaku.satuan,
                    alasan: InventoryMutationReason.PRODUKSI_OLAHAN,
                    keterangan: `Diolah menjadi ${hasilOlahan}`,
                }
            });

            // 3. upsert processed product stock
            const hasilOlahanStock = await tx.farmerInventory.upsert({
                where: {
                     petaniId_jenisProduk: {
                        petaniId: session.user.id,
                        jenisProduk: hasilOlahan,
                    }
                },
                update: { jumlah: { increment: jumlahHasil } },
                create: {
                    petaniId: session.user.id,
                    jenisProduk: hasilOlahan,
                    jumlah: jumlahHasil,
                    satuan: 'Kg', // default to Kg, bisa disesuaikan
                    kategori: 'PRODUK_OLAHAN' // asumsi
                }
            });

            // 4. create mutation log for processed product addition
             await tx.inventoryMutation.create({
                data: {
                    petaniId: session.user.id,
                    komoditas: hasilOlahan,
                    tipe: 'MASUK',
                    jumlah: jumlahHasil,
                    satuan: hasilOlahanStock.satuan,
                    alasan: InventoryMutationReason.PRODUKSI_OLAHAN,
                    keterangan: `Hasil olahan dari ${bahanBaku}`,
                }
            });

            return { message: "Proses olah berhasil dicatat" };
        });

        return NextResponse.json(result, { status: 201 });

    } catch (error: any) {
        console.error("Error processing inventory:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
