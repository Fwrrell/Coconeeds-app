"use client";

import React, { useState } from "react";
import { FarmerSidebar } from "@/components/farmer-sidebar";
import { IslandNav } from "@/components/island-nav";
import Provider from "@/components/providers";
import "driver.js/dist/driver.css";
import TourLauncher from "@/lib/tourGuide/tourLauncher";

// layout wrapper petani kebun smntara
export default function FarmerAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#FFFFFF] font-['Quicksand',sans-serif]">
      <Provider>
        {/* desktop sidebar */}
        <FarmerSidebar
          isHarvestModalOpen={isHarvestModalOpen}
          setIsHarvestModalOpen={setIsHarvestModalOpen}
        />

        {/* mobile island nav */}
        <IslandNav onOpenHarvestModal={() => setIsHarvestModalOpen(true)} />

        {/* main content area */}
        <main className="flex-1 pb-24 md:pb-8 overflow-x-hidden min-w-0">
          {children}
          <TourLauncher />
        </main>
      </Provider>
    </div>
  );
}
