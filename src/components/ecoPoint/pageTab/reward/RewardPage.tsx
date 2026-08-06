"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Receipt, Loader2 } from "lucide-react";
import { RewardCategory, Reward } from "./RewardTypes";
import RewardCard from "./RewardCard";
import RewardFilter from "./RewardFilter";
import RedeemCard from "./redeemCard";

const getRewardImage = (title: string, category?: string) => {
  const lower = (title || "").toLowerCase();
  if (lower.includes("listrik")) return "/icon/TokenListrik.png";
  if (lower.includes("voucher") || lower.includes("koperasi")) return "/icon/voucherKopdes.png";
  if (lower.includes("sembako") || lower.includes("beras") || lower.includes("minyak")) return "/icon/sembako.png";
  if (lower.includes("pupuk")) return "/icon/pupuk.png";
  if (lower.includes("bibit")) return "/icon/bibit.png";
  return category === "pertanian" ? "/icon/pupuk.png" : "/icon/TokenListrik.png";
};

interface RewardPageProps {
  rewards?: any[];
  userBalance?: number;
  onBalanceChange?: (newBalance: number) => void;
}

export default function RewardPage({
  rewards: propRewards,
  userBalance: propBalance,
  onBalanceChange,
}: RewardPageProps) {
  const [category, setCategory] = useState<RewardCategory>("all");
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [open, setOpen] = useState(false);
  const [internalRewards, setInternalRewards] = useState<Reward[]>([]);
  const [balance, setBalance] = useState<number>(propBalance ?? 0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRewards = () => {
    setIsLoading(true);
    fetch("/api/app/eco-points")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (data.balance !== undefined && propBalance === undefined) {
            setBalance(data.balance);
          }
          if (data.rewards) {
            const mapped: Reward[] = data.rewards.map((r: any) => ({
              id: r.id,
              title: r.title,
              description: r.description,
              poin: `${r.costPoints.toLocaleString("id-ID")} EcoPoints`,
              costPoints: r.costPoints,
              image: getRewardImage(r.title, r.category),
              category: r.category === "pertanian" ? "pertanian" : "digital",
            }));
            setInternalRewards(mapped);
          }
        }
      })
      .catch((err) => console.error("Error fetching rewards:", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (propBalance !== undefined) {
      setBalance(propBalance);
    }
  }, [propBalance]);

  useEffect(() => {
    if (propRewards && propRewards.length > 0) {
      const mapped: Reward[] = propRewards.map((r: any) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        poin: `${r.costPoints?.toLocaleString("id-ID") || r.poin} EcoPoints`,
        costPoints: r.costPoints,
        image: r.image || getRewardImage(r.title, r.category),
        category: r.category === "pertanian" ? "pertanian" : "digital",
      }));
      setInternalRewards(mapped);
    } else {
      fetchRewards();
    }
  }, [propRewards]);

  const filteredRewards = useMemo(() => {
    if (category === "all") return internalRewards;
    return internalRewards.filter((reward) => reward.category === category);
  }, [category, internalRewards]);

  const handleRedeemSuccess = (newBalance: number) => {
    setBalance(newBalance);
    onBalanceChange?.(newBalance);
    fetchRewards();
  };

  return (
    <div className="rounded-2xl bg-white px-4 py-6 shadow-sm border border-gray-100 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h2 className="font-bold text-xl flex items-center gap-2 text-[#606C38]">
            <Receipt className="w-6 h-6" />
            Penukaran Hadiah & Voucher
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Tukarkan EcoPoint yang kamu kumpulkan dengan berbagai voucher dan sarana pertanian!
          </p>
        </div>
        {isLoading && <Loader2 className="w-5 h-5 text-[#606C38] animate-spin" />}
      </div>

      <RewardFilter value={category} onChange={setCategory} />

      <div className="space-y-4">
        {filteredRewards.length === 0 && !isLoading ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            Tidak ada hadiah dalam kategori ini.
          </div>
        ) : (
          filteredRewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              onRedeem={(rw) => {
                setSelectedReward(rw);
                setOpen(true);
              }}
            />
          ))
        )}
      </div>

      <RedeemCard
        reward={selectedReward}
        open={open}
        onOpenChange={setOpen}
        userBalance={balance}
        onRedeemSuccess={handleRedeemSuccess}
      />
    </div>
  );
}
