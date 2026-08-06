"use client";

import React, { useState, useEffect } from "react";
import TabsTier from "@/components/ecoPoint/pageTab/detailTier/TabsTier";
import { TIER_DATA } from "@/components/ecoPoint/pageTab/detailTier/DataTier";
import { Loader2 } from "lucide-react";

export default function Tier() {
  const [userPoint, setUserPoint] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/app/eco-points")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.balance !== undefined) {
          setUserPoint(data.balance);
        }
      })
      .catch((err) => console.error("Error fetching points for tier:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const currentTier =
    (Object.entries(TIER_DATA).find(
      ([, tier]) => userPoint >= tier.min && userPoint <= tier.max,
    )?.[0] as keyof typeof TIER_DATA) ?? (userPoint >= 1500 ? "organik" : userPoint >= 500 ? "hijau" : "pemula");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#606C38]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full rounded-none justify-start p-0">
      <TabsTier point={userPoint} tier={currentTier} />
    </div>
  );
}
