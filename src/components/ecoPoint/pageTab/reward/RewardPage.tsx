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
    title: "Token listrik Rp. 25.000",
    description: "Token listrik untuk mendukung operasionalmu",
    poin: "500 EcoPoints",
    image: "/icon/TokenListrik.png",
    category: "digital",
  },
  {
    id: 2,
    title: "Token listrik Rp. 50.000",
    description: "Token listrik untuk mendukung operasionalmu",
    poin: "1200 EcoPoints",
    image: "/icon/TokenListrik.png",
    category: "digital",
  },
  {
    id: 3,
    title: "Voucher Koperasi Desa Rp 10.000",
    description: "Voucher Koperasi Desa untuk kebutuhan harian",
    poin: "200 EcoPoints",
    image: "/icon/voucherKopdes.png",
    category: "digital",
  },
  {
    id: 4,
    title: "Voucher Koperasi Desa Rp.30.000",
    description: "Voucher Koperasi desa untuk kebutuhan harian",
    poin: "700 EcoPoints",
    image: "/icon/voucherKopdes.png",
    category: "digital",
  },
  {
    id: 5,
    title: "Paket Sembako (Beras, Minyak, dan telur)",
    description: "Beras 5 Kg, telur 5 butir dan minyak 2 Liter",
    poin: "2000 EcoPoints",
    image: "/icon/sembako.png",
    category: "digital",
  },
  {
    id: 6,
    title: "Paket Sembako (Beras, Minyak, dan telur)",
    description: "Beras 2 Kg, telur 5 butir dan minyak 1 Liter",
    poin: "1200 EcoPoints",
    image: "/icon/sembako.png",
    category: "digital",
  },
  {
    id: 7,
    title: "Pupuk Organik 5 Kg",
    description: "Pupuk organik berkualitas",
    poin: "700 EcoPoints",
    image: "/icon/pupuk.png",
    category: "pertanian",
  },
  {
    id: 8,
    title: "Pupuk Organik 8 Kg",
    description: "Pupuk organik berkualitas",
    poin: "1000 EcoPoints",
    image: "/icon/pupuk.png",
    category: "pertanian",
  },
  {
    id: 9,
    title: "Bibit kelapa genjah",
    description: "Bibit kelapa genjah siap tanam 50 bibit",
    poin: "500 EcoPoints",
    image: "/icon/bibit.png",
    category: "pertanian",
  },
  {
    id: 10,
    title: "Bibit kelapa dalam",
    description: "Bibit kelapa dalam siap tanam 50 bibit",
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
