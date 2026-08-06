"use client";

import React, { useState, useEffect, useCallback } from "react";
import HeaderPoint from "@/components/ecoPoint/headerPoint";
import TabsEcoPoint from "@/components/ecoPoint/tabsEcoPoint";

export default function EcoPointPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEcoData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/app/eco-points");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Error fetching eco data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEcoData();
  }, [fetchEcoData]);

  const handleBalanceChange = (newBalance: number) => {
    setData((prev: any) => (prev ? { ...prev, balance: newBalance } : prev));
    fetchEcoData();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 max-w-7xl mx-auto w-full font-['Quicksand',sans-serif]">
      <HeaderPoint balance={data?.balance} summary={data?.summary} />
      <TabsEcoPoint
        dailyMissions={data?.dailyMissions}
        monthlyMissions={data?.monthlyMissions}
        rewards={data?.rewards}
        userBalance={data?.balance}
        onBalanceChange={handleBalanceChange}
      />
    </div>
  );
}
