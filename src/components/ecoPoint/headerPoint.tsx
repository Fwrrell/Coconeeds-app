"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Sparkles, Loader2 } from "lucide-react";

export interface HeaderPointProps {
  balance?: number;
  summary?: {
    tier?: string;
    nextTier?: string;
    nextTierPoints?: number;
    bonusEcoPercent?: string;
    freePickup?: string;
    monthlyGift?: string;
  };
}

export default function HeaderPoint({ balance: propBalance, summary: propSummary }: HeaderPointProps) {
  const [internalData, setInternalData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only fetch if props are not fully provided
    if (propBalance === undefined || !propSummary) {
      setIsLoading(true);
      fetch("/api/app/eco-points")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setInternalData(data);
        })
        .catch((err) => console.error("Error loading header eco points:", err))
        .finally(() => setIsLoading(false));
    }
  }, [propBalance, propSummary]);

  const balance = propBalance ?? internalData?.balance ?? 0;
  const summary = propSummary ?? internalData?.summary ?? {
    tier: "Petani Pemula",
    nextTier: "Petani Hijau",
    nextTierPoints: 500,
    bonusEcoPercent: "+0.5%",
    freePickup: "2x",
    monthlyGift: "Pupuk 3 Kg",
  };

  const nextTierPoints = summary.nextTierPoints || 500;
  const pointsNeeded = Math.max(0, nextTierPoints - balance);
  const progressPercent = Math.min(100, Math.round((balance / nextTierPoints) * 100));

  let tierImg = "/icon/hijau.png";
  if (summary.tier === "Petani Pemula") tierImg = "/icon/pemula.png";
  else if (summary.tier === "Petani Organik" || summary.tier === "Petani Emas") tierImg = "/icon/organik.png";

  return (
    <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm font-['Quicksand',sans-serif]">
      <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-4 w-full p-5">
        <div className="col-span-3 flex justify-center">
          <Image
            src="/icon/EcoPointMascot.png"
            width={220}
            height={220}
            alt="ecoPoint mascot"
            className="shrink-0 w-40 md:w-52 lg:w-60"
          />
        </div>
        <div className="lg:col-span-5 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[#283618] font-bold text-sm">Level:</span>
            <span className="font-extrabold text-[#606C38] text-sm bg-[#606C38]/10 px-3 py-0.5 rounded-full">
              {summary.tier || "Petani Pemula"}
            </span>
          </div>
          <div className="flex items-end gap-2 flex-wrap">
            <h2 className="font-extrabold text-4xl sm:text-5xl text-[#BC6C25]">
              {balance.toLocaleString("id-ID")}
            </h2>
            <span className="font-extrabold text-lg text-[#606C38] pb-1">
              EcoPoints
            </span>
          </div>
          <div className="h-2.5 bg-[#E8F3E8] rounded-full overflow-hidden w-full">
            <div
              className="h-full bg-[#BC6C25] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="text-xs sm:text-sm text-gray-500 font-semibold">
            {pointsNeeded > 0
              ? `${pointsNeeded.toLocaleString("id-ID")} poin lagi menuju ${summary.nextTier || "level berikutnya"}`
              : "Selamat, kamu mencapai level tertinggi!"}
          </span>
        </div>
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-gray-100 lg:pl-5 pt-3 lg:pt-0">
          <div className="rounded-2xl flex flex-col gap-2 items-center justify-center text-center h-full">
            <Image
              src={tierImg}
              width={100}
              height={100}
              alt={summary.tier || "Tier"}
              className="mx-auto"
            />
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4 text-[#BC6C25]" />
              <h3 className="font-bold text-sm text-gray-900">Benefit Saat Ini</h3>
            </div>

            <div className="space-y-1.5 text-xs w-full max-w-xs">
              <div className="flex justify-between gap-3">
                <span className="text-[#606C38] font-semibold">
                  Bonus EcoPoint
                </span>
                <span className="font-extrabold text-[#BC6C25]">
                  {summary.bonusEcoPercent || "+0.5%"}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-[#606C38] font-semibold">
                  Bonus Penjemputan
                </span>
                <span className="font-extrabold text-[#BC6C25]">
                  {summary.freePickup || "2x"}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-[#606C38] font-semibold">
                  Hadiah Bulanan
                </span>
                <span className="font-extrabold text-[#BC6C25]">
                  {summary.monthlyGift || "Pupuk 3 Kg"}
                </span>
              </div>
            </div>
            <Link
              href="/app/EcoPointTrade/Tier"
              className="font-bold text-[#BC6C25] hover:text-[#283618] text-xs flex items-center gap-1 mt-2 transition-colors"
            >
              Lihat Detail Benefit <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
