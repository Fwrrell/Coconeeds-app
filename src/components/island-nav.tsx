"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  TreePalm,
  Plus,
  Truck,
  User,
} from "lucide-react";

// 5 items strict mobile island nav buat petani
const leftNav = [
  { name: "Beranda", href: "/app", icon: House },
  { name: "Lahan", href: "/app/lahan", icon: TreePalm },
];

const rightNav = [
  { name: "Kirim", href: "/app/pengiriman", icon: Truck },
  { name: "Profil", href: "/app/eco-points", icon: User },
];

export const IslandNav = ({ onOpenHarvestModal }: { onOpenHarvestModal?: () => void }) => {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200 z-50 py-2 px-3 font-['Quicksand',sans-serif]">
      <div className="flex items-center justify-between relative w-full">
        {/* left nav items */}
        {leftNav.map((nav) => {
          const isActive = pathname === nav.href;
          const Icon = nav.icon;
          return (
            <Link
              key={nav.name}
              href={nav.href}
              className="flex flex-col items-center gap-0.5 min-w-[50px]"
            >
              <Icon
                className={`w-5 h-5 transition-colors ${isActive ? "text-[#606C38]" : "text-gray-400"}`}
              />
              <span
                className={`text-[10px] font-bold transition-colors ${isActive ? "text-[#606C38]" : "text-gray-400"}`}
              >
                {nav.name}
              </span>
            </Link>
          );
        })}

        {/* center prominent action button buat trigger modal catat panen */}
        <div className="flex flex-col items-center justify-center -mt-5">
          <button
            onClick={() => onOpenHarvestModal && onOpenHarvestModal()}
            className="w-13 h-13 rounded-full flex items-center justify-center border-4 border-white bg-[#606C38] active:scale-95 transition-transform shrink-0"
            title="Catat Hasil Panen"
          >
            <Plus className="w-7 h-7 text-white stroke-[2.5]" />
          </button>
          <span className="text-[10px] font-extrabold text-[#606C38] mt-0.5">
            Panen
          </span>
        </div>

        {/* right nav items */}
        {rightNav.map((nav) => {
          const isActive = pathname === nav.href;
          const Icon = nav.icon;
          return (
            <Link
              key={nav.name}
              href={nav.href}
              className="flex flex-col items-center gap-0.5 min-w-[50px]"
            >
              <Icon
                className={`w-5 h-5 transition-colors ${isActive ? "text-[#606C38]" : "text-gray-400"}`}
              />
              <span
                className={`text-[10px] font-bold transition-colors ${isActive ? "text-[#606C38]" : "text-gray-400"}`}
              >
                {nav.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default IslandNav;
