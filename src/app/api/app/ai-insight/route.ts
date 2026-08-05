import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Autentikasi diperlukan." },
        { status: 401 },
      );
    }

    const petaniId = session.user.id;

    // Environment Guard
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ data: null, reason: "not_configured" });
    }

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Data Aggregation from Prisma
    const [lahanList, dailyLogs, panenList, financialTxs] = await Promise.all([
      prisma.lahan.findMany({
        where: { petaniId },
        select: {
          id: true,
          namaLahan: true,
          luasM2: true,
          jumlahPohon: true,
          waktuPanenEstimate: true,
          pupuk: true,
        },
      }),
      prisma.dailyLog.findMany({
        where: {
          petaniId,
          tanggal: { gte: fourteenDaysAgo },
        },
        take: 14,
        orderBy: { tanggal: "desc" },
        select: {
          tanggal: true,
          weatherCondition: true,
          pestType: true,
          isWatered: true,
          fruitDropCount: true,
        },
      }),
      prisma.panen.findMany({
        where: {
          petaniId,
          createdAt: { gte: sixMonthsAgo },
        },
        take: 20,
        orderBy: { createdAt: "desc" },
        select: {
          type: true,
          actualWeight: true,
          expectedWeight: true,
          grade: true,
          moisture: true,
          createdAt: true,
        },
      }),
      prisma.farmerFinancialTx.findMany({
        where: {
          petaniId,
          createdAt: { gte: sixMonthsAgo },
        },
        take: 20,
        orderBy: { createdAt: "desc" },
        select: {
          tipe: true,
          nominalIdr: true,
          kategori: true,
          keterangan: true,
          createdAt: true,
        },
      }),
    ]);

    const totalLuasHa = (
      lahanList.reduce((acc, l) => acc + (l.luasM2 || 0), 0) / 10000
    ).toFixed(2);
    const totalTrees = lahanList.reduce(
      (acc, l) => acc + (l.jumlahPohon || 0),
      0,
    );

    const prompt = `Anda adalah asisten agronomis & keuangan AI spesialis kelapa di Indonesia.
Berdasarkan data berikut milik petani:
- Ringkasan Lahan: ${lahanList.length} plot kebun (Total Luas: ${totalLuasHa} Ha, Total Pohon: ${totalTrees} pohon). Detail pupuk: ${JSON.stringify(lahanList.map((l) => ({ nama: l.namaLahan, pupuk: l.pupuk, estimasiPanen: l.waktuPanenEstimate })))}
- Log Harian Kebun (14 hari terakhir): ${JSON.stringify(
      dailyLogs.map((d) => ({
        tanggal: d.tanggal,
        cuaca: d.weatherCondition,
        hama: d.pestType || "Tidak ada",
        disiram: d.isWatered,
        buahGugur: d.fruitDropCount || 0,
      })),
    )}
- Riwayat Panen (6 bulan terakhir): ${JSON.stringify(
      panenList.map((p) => ({
        komoditas: p.type,
        tonaseKg: p.actualWeight || p.expectedWeight,
        grade: p.grade || "Belum QC",
        kadarAir: p.moisture,
      })),
    )}
- Riwayat Transaksi Keuangan (6 bulan terakhir): ${JSON.stringify(
      financialTxs.map((f) => ({
        tipe: f.tipe,
        nominalIdr: f.nominalIdr,
        kategori: f.kategori,
        keterangan: f.keterangan,
      })),
    )}

Berikan proyeksi agronomis dan finansial yang ringkas dan tepat sasaran untuk petani.
Format balasan HARUS persis JSON yang valid tanpa teks pembuka atau penutup di luar JSON dengan struktur:
{
  "harvestProjection": {
    "percent": 15,
    "summary": "Proyeksi hasil panen kelapa diperkirakan meningkat berkat pola penyiraman dan pemupukan yang konsisten.",
    "estimates": [
      { "type": "Kopra Putih", "kg": 450 },
      { "type": "Sabut Kelapa", "kg": 600 }
    ]
  },
  "profitEstimate": {
    "percent": 12,
    "summary": "Estimasi laba bersih meningkat 12% seiring penurunan biaya operasional dan kualitas grade panen yang stabil."
  },
  "recommendations": [
    "Lakukan pemupukan susulan NPK pada plot utama sebelum memasuki fase puncak panen.",
    "Tingkatkan drainase lahan untuk meminimalkan gugur buah muda saat curah hujan tinggi.",
    "Optimalkan alokasi hasil panen sabut dan batok ke Kopdes untuk menambah pendapatan sampingan."
  ]
}`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(20000),
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      },
    );

    if (!geminiRes.ok) {
      console.error("[GEMINI_API_HTTP_ERROR]", geminiRes.status);
      return NextResponse.json({ data: null, reason: "api_error" });
    }

    const jsonRes = await geminiRes.json();
    const rawText =
      jsonRes?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const cleanedText = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsedData = JSON.parse(cleanedText);

    return NextResponse.json({ data: parsedData });
  } catch (err) {
    console.error("Error in GET /api/app/ai-insight:", err);
    return NextResponse.json({ data: null, reason: "api_error" });
  }
}

