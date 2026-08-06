import React from "react";
import TabsTier from "@/components/ecoPoint/pageTab/detailTier/TabsTier";
import { TIER_DATA } from "@/components/ecoPoint/pageTab/detailTier/DataTier";
import { getTierProgress } from "@/utils/TierCalculator";
export default function Tier() {
  const userPoint = 1250;
  const currentTier =
    (Object.entries(TIER_DATA).find(
      ([, tier]) => userPoint >= tier.min && userPoint <= tier.max,
    )?.[0] as keyof typeof TIER_DATA) ?? "pemula";

  const progressData = getTierProgress(userPoint, currentTier);
  return (
    <div className="space-y-6 w-full h-14 rounded-none border-b border-slate-200 bg-transparent justify-start p-0">
      <TabsTier point={userPoint} tier={currentTier} />
    </div>
  );
}
