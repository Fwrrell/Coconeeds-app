import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET eco points summary for a user
export async function GET(req: Request) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const [user, rewards, history] = await Promise.all([
            prisma.user.findUnique({
                where: { id: session.user.id },
                select: { ecoPoints: true }
            }),
            prisma.rewardCatalog.findMany({
                where: { isActive: true },
                orderBy: { costPoints: 'asc' }
            }),
            prisma.ecoPointTx.findMany({
                where: { petaniId: session.user.id },
                orderBy: { createdAt: 'desc' },
                take: 20,
            })
        ]);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Mocked data for now as per plan
        const MOCK_ECO_SUMMARY = {
            totalCo2ReducedKg: 840,
            wasteExchangedKg: 3200,
            nextTierPoints: 2000,
            tier: "Gold Farmer"
        };

        return NextResponse.json({
            balance: user.ecoPoints,
            summary: MOCK_ECO_SUMMARY,
            rewards,
            history
        });

    } catch (error) {
        console.error("Error getting eco points data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
