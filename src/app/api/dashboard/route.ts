
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// Helper to calculate percentage change
function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return parseFloat((((current - previous) / previous) * 100).toFixed(1));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kopdesId = searchParams.get("kopdesId");

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(now.getDate() - 60);

    // --- 1. KPI Aggregation ---
    const whereKopdes: any = kopdesId && kopdesId !== "ALL" ? { petani: { kopdesId } } : {};

    const [
        totalPetani,
        prevTotalPetani,
        kargoGudang,
        kargoBerlayar,
        totalDeals,
        prevTotalDeals
    ] = await Promise.all([
        // Total Petani
        prisma.user.count({ where: { role: "PETANI", ...whereKopdes } }),
        prisma.user.count({ where: { role: "PETANI", createdAt: { lt: thirtyDaysAgo }, ...whereKopdes } }),

        // Kargo Gudang (Sum of totalWeight)
        prisma.batch.aggregate({
            where: { status: "IN_WAREHOUSE", ...whereKopdes },
            _sum: { totalWeight: true },
        }),

        // Kargo Berlayar (Sum of totalWeight)
        prisma.batch.aggregate({
            where: { status: "IN_TRANSIT", ...whereKopdes },
            _sum: { totalWeight: true },
        }),

        // Total Deals (WTB Listing)
        prisma.wtbListing.count({ where: { status: "DEAL" } }),
        prisma.wtbListing.count({ where: { status: "DEAL", updatedAt: { lt: thirtyDaysAgo } } })
    ]);
    
    // --- 2. Chart Data Aggregation ---
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const rawBatches = await prisma.batch.findMany({
      where: {
        createdAt: { gte: ninetyDaysAgo },
        ...whereKopdes,
      },
      select: { createdAt: true, totalWeight: true, type: true },
      orderBy: { createdAt: "asc" },
    });

    const dateMap = new Map<string, { kopra: number; sabut: number }>();
    for (const batch of rawBatches) {
        const dateKey = batch.createdAt.toISOString().split("T")[0]; // "YYYY-MM-DD"
        const existing = dateMap.get(dateKey) || { kopra: 0, sabut: 0 };
        if (batch.type.toUpperCase() === "KOPRA") existing.kopra += batch.totalWeight;
        else if (batch.type.toUpperCase() === "SABUT") existing.sabut += batch.totalWeight;
        dateMap.set(dateKey, existing);
    }

    const filledChartData = [];
    for (let d = new Date(ninetyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split("T")[0];
        const values = dateMap.get(dateKey) || { kopra: 0, sabut: 0 };
        filledChartData.push({ date: dateKey, ...values });
    }

    // --- 3. Recent Activity Logs ---
    const [recentBatches, recentPengiriman, recentDeals] = await Promise.all([
        prisma.batch.findMany({
            where: { status: { in: ["IN_WAREHOUSE", "DELIVERED"] } },
            orderBy: { updatedAt: "desc" },
            take: 2,
            select: { id: true, updatedAt: true, type: true, totalWeight: true, status: true },
        }),
        prisma.pengirimanKapal.findMany({
            orderBy: { createdAt: "desc" },
            take: 2,
            select: { id: true, namaKapal: true, status: true, createdAt: true, rute: true },
        }),
        prisma.wtbListing.findMany({
            where: { status: "DEAL" },
            orderBy: { updatedAt: "desc" },
            take: 2,
            select: { id: true, komoditas: true, targetWeight: true, dealPrice: true, updatedAt: true },
        }),
    ]);

    const activities = [
        ...recentBatches.map(b => ({
            id: b.id, date: b.updatedAt, type: "qc" as const,
            title: `QC ${b.type}`, description: `${b.totalWeight} kg — ${b.status}`
        })),
        ...recentPengiriman.map(p => ({
            id: p.id, date: p.createdAt, type: "logistics" as const,
            title: `Kapal ${p.namaKapal}`, description: `${p.rute} — ${p.status}`
        })),
        ...recentDeals.map(d => ({
            id: d.id, date: d.updatedAt, type: "deal" as const,
            title: `Deal ${d.komoditas}`, description: `${(d.targetWeight / 1000).toFixed(1)} Ton @ Rp${d.dealPrice?.toLocaleString('id-ID')}`
        })),
    ];
    activities.sort((a, b) => b.date.getTime() - a.date.getTime());
    const top5Activities = activities.slice(0, 5);

    // --- Final Response Shape ---
    return NextResponse.json({
        kpi: {
            totalPetani: { value: totalPetani, growth: calculateGrowth(totalPetani, prevTotalPetani) },
            kargoGudang: { value: kargoGudang._sum?.totalWeight ?? 0, growth: 0 }, // Growth logic placeholder
            kargoBerlayar: { value: kargoBerlayar._sum?.totalWeight ?? 0, growth: 0 }, // Growth logic placeholder
            totalDeals: { value: totalDeals, growth: totalDeals - prevTotalDeals }, // Simple count increase
        },
        chart: filledChartData,
        activity: top5Activities,
    });

  } catch (error) {
    console.error("Error in GET /api/dashboard:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return NextResponse.json({ error: "Database error." }, { status: 500 });
    }
    return NextResponse.json({ error: "Terjadi kesalahan internal pada server." }, { status: 500 });
  }
}
