import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Skema validasi untuk update, semua field opsional
const updateUserSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").optional(),
  phoneNumber: z
    .string()
    .min(10, "Nomor HP minimal 10 digit")
    .max(15, "Nomor HP maksimal 15 digit")
    .regex(/^(\+62|62|0)8[1-9][0-9]{7,12}$/, "Format nomor HP tidak valid")
    .optional(),
  isVerified: z.boolean().optional(),
  // Tambahkan kopdesId, pastikan itu string UUID jika diberikan
  kopdesId: z.string().uuid("Format ID Kopdes tidak valid").optional(),
});

export async function PATCH(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.pathname.split("/").pop();

    if (!userId) {
      return NextResponse.json(
        { error: "ID User tidak ditemukan di URL" },
        { status: 400 },
      );
    }

    const body = await req.json();
    // Gunakan safeParse untuk menangani validasi secara fleksibel
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        // Ambil pesan error pertama dari Zod
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }
    
    // Cek jika Kopdes ada (jika kopdesId diberikan)
    if (parsed.data.kopdesId) {
        const kopdesExists = await prisma.kopdes.findUnique({
            where: { id: parsed.data.kopdesId }
        });
        if (!kopdesExists) {
            return NextResponse.json({ error: "Kopdes yang dipilih tidak ditemukan." }, { status: 404 });
        }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: parsed.data, // Kirim data yang sudah divalidasi
    });

    return NextResponse.json(
      { message: "Data petani berhasil diperbarui.", data: updatedUser },
      { status: 200 },
    );
  } catch (err) {
    console.error("UPDATE_USER_API_ERROR:", err);
    // Handle error jika nomor HP sudah ada
    if (err instanceof Error && 'code' in err && (err as any).code === 'P2002') {
        return NextResponse.json(
            { error: "Nomor HP ini sudah digunakan oleh akun lain." },
            { status: 409 },
        );
    }
    // Handle error jika user tidak ditemukan
    if (err instanceof Error && 'code' in err && (err as any).code === 'P2025') {
        return NextResponse.json({ error: "Petani tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Terjadi kesalahan pada sistem." },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.pathname.split("/").pop();

    if (!userId) {
      return NextResponse.json(
        { error: "ID User tidak ditemukan di URL" },
        { status: 400 },
      );
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json(
      { message: "Akun petani berhasil dihapus." },
      { status: 200 },
    );
  } catch (err) {
    console.error("DELETE_USER_API_ERROR:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada sistem." },
      { status: 500 },
    );
  }
}
