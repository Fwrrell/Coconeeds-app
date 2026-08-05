"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MissionCard, { Mission } from "./MissionCard";
import { CalendarDays, Loader2 } from "lucide-react";
import SetorLimbahModal from "@/components/ecoPoint/SetorLimbahModal";

const FALLBACK_MONTHLY_MISSIONS: Mission[] = [
  {
    id: 1,
    title: "Login setiap minggu",
    description: "Aktif di farmer-portal setiap minggu dalam sebulan",
    poin: "+20 EcoPoints",
    image: "/icon/loginHarian.png",
    progress: 1,
    total: 4,
    actionUrl: "/app",
  },
  {
    id: 2,
    title: "Kirimkan hasil panen",
    description: "Kirimkan hasil panen ke koperasi minimal 3 kali",
    poin: "+50 EcoPoints",
    image: "/icon/dataPanen.png",
    progress: 0,
    total: 3,
    actionUrl: "/app/pengiriman",
  },
  {
    id: 3,
    title: "Tukarkan limbah produksi kelapa",
    description: "Setor sabut atau batok kelapa ke koperasi",
    poin: "+100 EcoPoints",
    image: "/icon/kirimPanen.png",
    progress: 0,
    total: 3,
    actionUrl: "OPEN_SETOR_LIMBAH",
    actionType: "SETOR_LIMBAH",
  },
  {
    id: 4,
    title: "5 Batch berhasil terjual",
    description: "Jual 5 batch kelapamu ke perusahaan mitra",
    poin: "+150 EcoPoints",
    image: "/icon/crate.png",
    progress: 0,
    total: 5,
    actionUrl: "/app/pengiriman",
  },
];

interface MonthlyMissionProps {
  missions?: Mission[];
}

export default function MonthlyMission({ missions: propMissions }: MonthlyMissionProps) {
  const router = useRouter();
  const [missions, setMissions] = useState<Mission[]>(propMissions || FALLBACK_MONTHLY_MISSIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSetorLimbahOpen, setIsSetorLimbahOpen] = useState(false);

  const fetchMissions = () => {
    setIsLoading(true);
    fetch("/api/app/eco-points")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.monthlyMissions && data.monthlyMissions.length > 0) {
          setMissions(data.monthlyMissions);
        }
      })
      .catch((err) => console.error("Error loading monthly missions:", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (propMissions && propMissions.length > 0) {
      setMissions(propMissions);
    } else {
      fetchMissions();
    }
  }, [propMissions]);

  const handleMissionAction = (mission: Mission) => {
    if (
      mission.actionUrl === "OPEN_SETOR_LIMBAH" ||
      mission.actionType === "SETOR_LIMBAH" ||
      mission.title?.toLowerCase().includes("limbah")
    ) {
      setIsSetorLimbahOpen(true);
    } else if (mission.actionUrl) {
      router.push(mission.actionUrl);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h2 className="font-bold text-xl flex items-center gap-2 text-[#BC6C25]">
            <CalendarDays className="w-6 h-6" />
            Misi Bulanan & Target Penjualan
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Misi dengan perolehan Eco-Points terbesar setiap bulannya.
          </p>
        </div>
        {isLoading && <Loader2 className="w-5 h-5 text-[#606C38] animate-spin" />}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {missions.map((mission) => (
          <MissionCard
            key={mission.id || mission.title}
            mission={mission}
            onAction={() => handleMissionAction(mission)}
          />
        ))}
      </div>

      <SetorLimbahModal
        open={isSetorLimbahOpen}
        onOpenChange={setIsSetorLimbahOpen}
        onSuccess={() => {
          fetchMissions();
          router.refresh();
        }}
      />
    </div>
  );
}
