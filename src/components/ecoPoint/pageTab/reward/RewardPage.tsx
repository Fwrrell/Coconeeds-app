"use client";
import React, { useMemo, useState } from "react";
import { Receipt } from "lucide-react";
import { RewardCategory } from "./RewardTypes";
import { Reward } from "./RewardTypes";
import RewardCard from "./RewardCard";
import RewardFilter from "./RewardFilter";
import RedeemCard from "./redeemCard";
export const rewardData: Reward[] = [
  {
    id: 1,
    title: "Token listrik Rp. 20.000",
    description: "Token listrik untuk mendukung operasionalmu",
    poin: "500 EcoPoints",
    image: "/icon/token.png",
    category: "digital",
  },
  {
    id: 2,
    title: "Token listrik Rp. 50.000",
    description: "Token listrik untuk mendukung operasionalmu",
    poin: "1200 EcoPoints",
    image: "/icon/token.png",
    category: "digital",
  },
  {
    id: 3,
    title: "Voucher Gopay Rp. 10.000",
    description: "Voucher Gopay senilai 10.000",
    poin: "1000 EcoPoints",
    image: "/icon/gopay.png",
    category: "digital",
  },
  {
    id: 4,
    title: "Voucher ShopeePay Rp.10.000",
    description: "Voucher ShopeePay senilai 10.000",
    poin: "+1000 EcoPoints",
    image: "/icon/shopeepay.png",
    category: "digital",
  },
  {
    id: 5,
    title: "Paket data internet 5 GB",
    description: "catat observasi kondisi lahanmu hari ini",
    poin: "900 EcoPoints",
    image: "/laporanHarian.png",
    category: "digital",
  },
  {
    id: 6,
    title: "Voucher pulsa Rp. 20.000",
    description: "catat hasil perawatan lahanmu hari ini",
    poin: "900 EcoPoints",
    image: "/icon/dataPerawatan.png",
    category: "digital",
  },
  {
    id: 7,
    title: "Pupuk Organik 10 Kg",
    description: "Pupuk organik berkualitas",
    poin: "1500 EcoPoints",
    image: "/icon/pupuk.png",
    category: "pertanian",
  },
  {
    id: 8,
    title: "Bibit kelapa genjah",
    description: "Bibit kelapa genjah siap tanam 100 bibit",
    poin: "500 EcoPoints",
    image: "/icon/bibit.png",
    category: "pertanian",
  },
];

export default function RewardPage() {
  const [category, setCategory] = useState<RewardCategory>("all");
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  const [open, setOpen] = useState(false);
  const filteredRewards = useMemo(() => {
    if (category === "all") return rewardData;

    return rewardData.filter((reward) => reward.category === category);
  }, [category]);
  return (
    <div className="rounded-2xl bg-white px-3 py-4 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h2 className="font-semibold text-xl flex items-center gap-2 text-[#606C38]">
            <Receipt className="w-7 h-7" />
            Penukaran poin
          </h2>
          <p className="text-sm font-medium font-gray-600">
            Tukarkan EcoPointmu menjadi berbagai hadiah bernilai ekonomi!
          </p>
        </div>
      </div>
      <RewardFilter value={category} onChange={setCategory} />
      <div className="space-y-4">
        {filteredRewards.map((reward) => (
          <RewardCard
            key={reward.id}
            reward={reward}
            onRedeem={(reward) => {
              setSelectedReward(reward);
              setOpen(true);
            }}
          />
        ))}
      </div>
      <RedeemCard reward={selectedReward} open={open} onOpenChange={setOpen} />
    </div>
  );
}
