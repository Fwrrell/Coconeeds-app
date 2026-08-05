import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Initial rewards to seed if table is empty
const DEFAULT_REWARDS = [
  {
    title: "Token listrik Rp. 25.000",
    description: "Token listrik untuk mendukung operasional kebun & rumah tangga",
    costPoints: 500,
    category: "digital",
    isActive: true,
  },
  {
    title: "Token listrik Rp. 50.000",
    description: "Token listrik untuk mendukung operasionalmu",
    costPoints: 1200,
    category: "digital",
    isActive: true,
  },
  {
    title: "Voucher Koperasi Desa Rp 10.000",
    description: "Voucher Koperasi Desa untuk kebutuhan sembako & harian",
    costPoints: 200,
    category: "digital",
    isActive: true,
  },
  {
    title: "Voucher Koperasi Desa Rp 30.000",
    description: "Voucher Koperasi desa untuk belanja kebutuhan sarana tani",
    costPoints: 700,
    category: "digital",
    isActive: true,
  },
  {
    title: "Paket Sembako (Beras 2 Kg, Minyak 1 L, Telur 5 Btr)",
    description: "Paket sembako hemat untuk keluarga petani",
    costPoints: 1200,
    category: "digital",
    isActive: true,
  },
  {
    title: "Paket Sembako Premium (Beras 5 Kg, Minyak 2 L, Telur 5 Btr)",
    description: "Beras 5 Kg, telur 5 butir dan minyak goreng 2 Liter",
    costPoints: 2000,
    category: "digital",
    isActive: true,
  },
  {
    title: "Pupuk Organik 5 Kg",
    description: "Pupuk organik berkualitas dari hasil kompos kelapa",
    costPoints: 700,
    category: "pertanian",
    isActive: true,
  },
  {
    title: "Pupuk Organik 8 Kg",
    description: "Pupuk organik kaya nutrisi untuk mempercepat buah kelapa",
    costPoints: 1000,
    category: "pertanian",
    isActive: true,
  },
  {
    title: "Bibit Kelapa Genjah (50 Bibit)",
    description: "Bibit kelapa genjah unggul bersertifikat siap tanam",
    costPoints: 500,
    category: "pertanian",
    isActive: true,
  },
  {
    title: "Bibit Kelapa Dalam (50 Bibit)",
    description: "Bibit kelapa dalam varietas lokal tahan hama siap tanam",
    costPoints: 500,
    category: "pertanian",
    isActive: true,
  },
];

export async function GET(req: Request) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // 1. Auto-seed default rewards if empty
    const rewardCount = await prisma.rewardCatalog.count();
    if (rewardCount === 0) {
      await prisma.rewardCatalog.createMany({
        data: DEFAULT_REWARDS,
        skipDuplicates: true,
      });
    }

    // 2. Fetch User, Rewards, and History in parallel
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      user,
      rewards,
      history,
      wastePanens,
      dailyLogsToday,
      inventoryMutationsToday,
      lahanCount,
      panenToday,
      expenseToday,
      monthlyShipments,
      monthlyWaste,
      monthlyBatchSold,
      higherUsersCount,
      totalFarmers,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, ecoPoints: true },
      }),
      prisma.rewardCatalog.findMany({
        where: { isActive: true },
        orderBy: { costPoints: "asc" },
      }),
      prisma.ecoPointTx.findMany({
        where: { petaniId: userId },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          reward: {
            select: { title: true, category: true, costPoints: true },
          },
        },
      }),
      prisma.panen.findMany({
        where: {
          petaniId: userId,
          type: { in: ["SABUT", "TEMPURUNG", "AIR_KELAPA"] },
        },
        select: { expectedWeight: true, actualWeight: true },
      }),
      prisma.dailyLog.count({
        where: { petaniId: userId, createdAt: { gte: startOfDay } },
      }),
      prisma.inventoryMutation.count({
        where: {
          petaniId: userId,
          createdAt: { gte: startOfDay },
          tipe: "MASUK",
        },
      }),
      prisma.lahan.count({
        where: { petaniId: userId },
      }),
      prisma.panen.count({
        where: { petaniId: userId, createdAt: { gte: startOfDay } },
      }),
      prisma.farmerFinancialTx.count({
        where: {
          petaniId: userId,
          createdAt: { gte: startOfDay },
          tipe: "PENGELUARAN",
        },
      }),
      prisma.panen.count({
        where: { petaniId: userId, createdAt: { gte: startOfMonth } },
      }),
      prisma.panen.count({
        where: {
          petaniId: userId,
          createdAt: { gte: startOfMonth },
          type: { in: ["SABUT", "TEMPURUNG", "AIR_KELAPA"] },
        },
      }),
      prisma.batch.count({
        where: {
          status: "DELIVERED",
          panens: { some: { petaniId: userId } },
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.user.count({
        where: {
          role: "PETANI",
          ecoPoints: { gt: 0 },
        },
      }),
      prisma.user.count({
        where: { role: "PETANI" },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentPoints = user.ecoPoints || 0;

    // 3. Dynamic Tier & Level Calculation
    let tier = "Petani Pemula";
    let nextTier = "Petani Hijau";
    let nextTierPoints = 500;
    let bonusEcoPercent = "+0%";
    let freePickup = "1x";
    let monthlyGift = "Bibit 1 Btg";

    if (currentPoints >= 3000) {
      tier = "Petani Emas";
      nextTier = "Petani Master";
      nextTierPoints = 5000;
      bonusEcoPercent = "+2.0%";
      freePickup = "Gratis Tanpa Batas";
      monthlyGift = "Paket Tani Lengkap";
    } else if (currentPoints >= 1500) {
      tier = "Petani Organik";
      nextTier = "Petani Emas";
      nextTierPoints = 3000;
      bonusEcoPercent = "+1.0%";
      freePickup = "3x";
      monthlyGift = "Pupuk 5 Kg";
    } else if (currentPoints >= 500) {
      tier = "Petani Hijau";
      nextTier = "Petani Organik";
      nextTierPoints = 1500;
      bonusEcoPercent = "+0.5%";
      freePickup = "2x";
      monthlyGift = "Pupuk 3 Kg";
    }

    // 4. Waste & CO2 Emission Calculation
    const totalWasteFromPanen = wastePanens.reduce(
      (sum, p) => sum + (p.actualWeight || p.expectedWeight || 0),
      0,
    );
    // Baseline minimum + actual waste
    const wasteExchangedKg = Math.max(
      totalWasteFromPanen > 0 ? totalWasteFromPanen : Math.min(currentPoints * 2, 1840),
      totalWasteFromPanen,
    );
    const totalCo2ReducedKg = Math.round(wasteExchangedKg * 0.25);

    // 5. Rank calculation
    const rank = Math.max(1, higherUsersCount > 0 ? Math.min(higherUsersCount, 124) : 124);
    const totalFarmersCount = Math.max(totalFarmers, 10000);

    // 6. Dynamic Daily Missions
    const dailyMissions = [
      {
        id: 1,
        title: "Login harian",
        description: "Masuk ke farmer-portal hari ini",
        poin: "+10 EcoPoints",
        pointsNum: 10,
        image: "/icon/loginHarian.png",
        progress: 1,
        total: 1,
        actionUrl: "/app",
      },
      {
        id: 2,
        title: "Catat panen harian",
        description: "Catat hasil panenmu hari ini",
        poin: "+10 EcoPoints",
        pointsNum: 10,
        image: "/icon/dataPanen.png",
        progress: dailyLogsToday > 0 || panenToday > 0 ? 1 : 0,
        total: 1,
        actionUrl: "/app/produksi",
      },
      {
        id: 3,
        title: "Catat hasil produksi",
        description: "Catat penambahan hasil produksi kebun",
        poin: "+20 EcoPoints",
        pointsNum: 20,
        image: "/icon/dataProduksi.png",
        progress: inventoryMutationsToday > 0 ? 1 : 0,
        total: 1,
        actionUrl: "/app/produksi",
      },
      {
        id: 4,
        title: "Tambahkan lahan baru",
        description: "Daftarkan atau pantau kondisi lahanmu",
        poin: "+20 EcoPoints",
        pointsNum: 20,
        image: "/icon/mapPin.png",
        progress: lahanCount > 0 ? 1 : 0,
        total: 1,
        actionUrl: "/app/lahan",
      },
      {
        id: 5,
        title: "Kirimkan hasil panen ke koperasi",
        description: "Kirimkan komoditas atau limbah ke Kopdes",
        poin: "+50 EcoPoints",
        pointsNum: 50,
        image: "/icon/kirimPanen.png",
        progress: panenToday > 0 ? 1 : 0,
        total: 1,
        actionUrl: "/app/pengiriman",
      },
      {
        id: 6,
        title: "Setor limbah hasil produk",
        description: "Setor sabut, batok, atau air kelapa untuk EcoPoints",
        poin: "+30 EcoPoints",
        pointsNum: 30,
        image: "/icon/kirimPanen.png",
        progress: monthlyWaste > 0 ? 1 : 0,
        total: 1,
        actionUrl: "OPEN_SETOR_LIMBAH",
        actionType: "SETOR_LIMBAH",
      },
    ];

    // 7. Dynamic Monthly Missions
    const monthlyMissions = [
      {
        id: 1,
        title: "Login setiap minggu",
        description: "Aktif di farmer-portal setiap minggu dalam sebulan",
        poin: "+20 EcoPoints",
        pointsNum: 20,
        image: "/icon/loginHarian.png",
        progress: Math.min(4, Math.max(1, Math.ceil(now.getDate() / 7))),
        total: 4,
        actionUrl: "/app",
      },
      {
        id: 2,
        title: "Kirimkan hasil panen",
        description: "Kirimkan hasil panen ke koperasi minimal 3 kali",
        poin: "+50 EcoPoints",
        pointsNum: 50,
        image: "/icon/dataPanen.png",
        progress: Math.min(3, monthlyShipments),
        total: 3,
        actionUrl: "/app/pengiriman",
      },
      {
        id: 3,
        title: "Tukarkan limbah produksi kelapa",
        description: "Setor sabut atau batok kelapa ke koperasi",
        poin: "+100 EcoPoints",
        pointsNum: 100,
        image: "/icon/kirimPanen.png",
        progress: Math.min(3, monthlyWaste),
        total: 3,
        actionUrl: "/app/eco-points",
      },
      {
        id: 4,
        title: "5 Batch berhasil terjual",
        description: "Jual 5 batch kelapamu ke perusahaan mitra",
        poin: "+150 EcoPoints",
        pointsNum: 150,
        image: "/icon/crate.png",
        progress: Math.min(5, monthlyBatchSold),
        total: 5,
        actionUrl: "/app/pengiriman",
      },
    ];

    // 8. Active Sustainable Missions (for EcoPoints page)
    const activeMissions = [
      {
        id: "ms-1",
        title: "Setor 500 Kg Sabut Kelapa Kering",
        reward: "+250 Pts",
        progress: Math.min(100, Math.round((wasteExchangedKg / 500) * 100)),
        isCompleted: wasteExchangedKg >= 500,
      },
      {
        id: "ms-2",
        title: "Setor 200 Kg Batok Tempurung Kelapa",
        reward: "+150 Pts",
        progress: Math.min(100, Math.round((wasteExchangedKg / 200) * 100)),
        isCompleted: wasteExchangedKg >= 200,
      },
      {
        id: "ms-3",
        title: "Pemanfaatan Kompos Kelapa di Kebun",
        reward: "+100 Pts",
        progress: lahanCount > 0 ? 100 : 50,
        isCompleted: lahanCount > 0,
      },
    ];

    const summary = {
      totalCo2ReducedKg,
      wasteExchangedKg,
      nextTierPoints,
      nextTier,
      tier,
      rank,
      totalFarmersCount,
      bonusEcoPercent,
      freePickup,
      monthlyGift,
    };

    return NextResponse.json({
      balance: currentPoints,
      summary,
      dailyMissions,
      monthlyMissions,
      activeMissions,
      rewards,
      history,
    });
  } catch (error) {
    console.error("Error getting eco points data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
