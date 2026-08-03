import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { financialTxSchema } from "@/lib/validations/financial.schema";
import { FarmerFinancialTxType, Panen } from "@prisma/client";

// get aggregated financial stats
export async function GET(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [financialTxs, panenRecords, lahanData] = await Promise.all([
        prisma.farmerFinancialTx.findMany({
            where: { petaniId: session.user.id, createdAt: { gte: sixMonthsAgo } },
            orderBy: { createdAt: 'asc' }
        }),
        prisma.panen.findMany({
            where: { petaniId: session.user.id, createdAt: { gte: sixMonthsAgo }, NOT: { basePricePerKg: null, actualWeight: null } },
            orderBy: { createdAt: 'asc' }
        }),
        prisma.lahan.aggregate({
            where: { petaniId: session.user.id },
            _sum: { luasM2: true, jumlahPohon: true },
            _count: { id: true }
        })
    ]);

    // 1. KPI Stats
    const totalPendapatan = panenRecords.reduce((sum, p) => sum + (p.basePricePerKg! * p.actualWeight!), 0) 
        + financialTxs.filter(tx => tx.tipe === 'PEMASUKAN').reduce((sum, tx) => sum + tx.nominalIdr, 0);
    
    const totalPengeluaran = financialTxs.filter(tx => tx.tipe === 'PENGELUARAN').reduce((sum, tx) => sum + tx.nominalIdr, 0);

    const totalLahan = lahanData._count.id;
    const totalLuasHa = ((lahanData._sum.luasM2 || 0) / 10000).toFixed(1);
    const totalPohon = lahanData._sum.jumlahPohon || 0;
    const totalHasilPanen = panenRecords.reduce((sum, p) => sum + p.actualWeight!, 0);

    // 2. Chart Data
    const monthlyData: { [key: string]: { income: number, expense: number } } = {};
    const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short' });

    const processRecords = (records: (Panen | { createdAt: Date, nominalIdr: number, tipe: FarmerFinancialTxType})[]) => {
        for (const record of records) {
            const month = monthFormatter.format(new Date(record.createdAt));
            if (!monthlyData[month]) {
                monthlyData[month] = { income: 0, expense: 0 };
            }
            if ('basePricePerKg' in record) { // is Panen
                monthlyData[month].income += record.basePricePerKg! * record.actualWeight!;
            } else { // is financial tx
                if (record.tipe === 'PEMASUKAN') monthlyData[month].income += record.nominalIdr;
                else monthlyData[month].expense += record.nominalIdr;
            }
        }
    };
    
    processRecords(panenRecords);
    processRecords(financialTxs);
    
    const profitChartData = Object.entries(monthlyData).map(([month, {income, expense}]) => ({
        month,
        profit: income - expense,
        income,
        expense,
    }));

    const salesComposition = panenRecords.reduce((acc, p) => {
        const type = p.type || 'Lainnya';
        acc[type] = (acc[type] || 0) + (p.basePricePerKg! * p.actualWeight!);
        return acc;
    }, {} as Record<string, number>);

    const donutChartData = Object.entries(salesComposition).map(([name, value]) => ({ name, value }));

    return NextResponse.json({
        kpi: {
            totalPendapatan,
            totalPengeluaran,
            totalLahan,
            totalLuasHa,
            totalPohon,
            totalHasilPanen,
        },
        charts: {
            profitChartData,
            donutChartData
        }
    });

  } catch (error) {
    console.error("Error getting stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


// add new manual financial transaction
export async function POST(req: Request) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const parsed = financialTxSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
        }

        const newTx = await prisma.farmerFinancialTx.create({
            data: {
                petaniId: session.user.id,
                ...parsed.data
            }
        });

        return NextResponse.json(newTx, { status: 201 });

    } catch (error) {
        console.error("Error creating financial tx:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
