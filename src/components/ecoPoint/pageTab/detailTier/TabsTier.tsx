import React from "react";
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs";
import TierPemula from "./TierPemula";
import { TIER_DATA } from "./DataTier";
import TierHijau from "./TierHijau";
import TierOrganik from "./TierOrganik";
import Image from "next/image";
interface TierProps {
  point: number;
  tier: keyof typeof TIER_DATA;
}
export default function TabsTier({ point, tier }: TierProps) {
  return (
    <Tabs defaultValue={tier}>
      <TabsList className="!flex !w-full !h-auto !grid !grid-cols-3 !rounded-none !bg-transparent !border-b !border-slate-200 !p-0">
        <TabsTrigger
          value="pemula"
          className="group !h-auto !rounded-none !border-b-[3px] !border-transparent !bg-transparent !py-4 !px-4 !text-base !font-medium !text-slate-400 !shadow-none cursor-pointer transition-all duration-200 hover:!bg-[#F7F8F3] hover:!text-[#606C38] data-active:!border-b-[#606C38] data-active:!text-[#606C38] data-active:!font-semibold data-active:!bg-transparent data-active:!shadow-none data-active:hover:!bg-transparent after:!hidden"
        >
          <div className="flex items-center justify-center gap-3">
            <Image
              src="/icon/pemula.png"
              width={28}
              height={28}
              alt={TIER_DATA.pemula.title}
              className="transition-transform duration-200 group-hover:scale-105"
            />
            <span className="transition-colors duration-200 group-hover:text-[#4a5530]">Pemula</span>
          </div>
        </TabsTrigger>
        <TabsTrigger
          value="hijau"
          className="group !h-auto !rounded-none !border-b-[3px] !border-transparent !bg-transparent !py-4 !px-4 !text-base !font-medium !text-slate-400 !shadow-none cursor-pointer transition-all duration-200 hover:!bg-[#F7F8F3] hover:!text-[#606C38] data-active:!border-b-[#606C38] data-active:!text-[#606C38] data-active:!font-semibold data-active:!bg-transparent data-active:!shadow-none data-active:hover:!bg-transparent after:!hidden"
        >
          <div className="flex items-center justify-center gap-3">
            <Image
              src="/icon/hijau.png"
              width={28}
              height={28}
              alt={TIER_DATA.hijau.title}
              className="transition-transform duration-200 group-hover:scale-105"
            />
            <span className="transition-colors duration-200 group-hover:text-[#4a5530]">Hijau</span>
          </div>
        </TabsTrigger>
        <TabsTrigger
          value="organik"
          className="group !h-auto !rounded-none !border-b-[3px] !border-transparent !bg-transparent !py-4 !px-4 !text-base !font-medium !text-slate-400 !shadow-none cursor-pointer transition-all duration-200 hover:!bg-[#F7F8F3] hover:!text-[#606C38] data-active:!border-b-[#606C38] data-active:!text-[#606C38] data-active:!font-semibold data-active:!bg-transparent data-active:!shadow-none data-active:hover:!bg-transparent after:!hidden"
        >
          <div className="flex items-center justify-center gap-3">
            <Image
              src="/icon/organik.png"
              width={28}
              height={28}
              alt={TIER_DATA.organik.title}
              className="transition-transform duration-200 group-hover:scale-105"
            />
            <span className="transition-colors duration-200 group-hover:text-[#4a5530]">Organik</span>
          </div>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="pemula">
        <TierPemula point={point} />
      </TabsContent>
      <TabsContent value="hijau">
        <TierHijau point={point} />
      </TabsContent>
      <TabsContent value="organik">
        <TierOrganik point={point} />
      </TabsContent>
    </Tabs>
  );
}
