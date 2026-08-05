"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MissionCard, { Mission } from "./MissionCard";
import { Calendar1, Loader2 } from "lucide-react";
import SetorLimbahModal from "@/components/ecoPoint/SetorLimbahModal";

const FALLBACK_DAILY_MISSIONS: Mission[] = [
  {
    id: 1,
    title: "Login harian",
    description: "Masuk ke farmer-portal hari ini",
    poin: "+10 EcoPoints",
    image: "/icon/loginHarian.png",
    progress: 1,
    total: 1,
    actionUrl: "/app",
  },
  {
    id: 2,
    title: "Catat panen harian",
    description: "Catat hasil panenmu hari ini",
    poin: "+10 EcoPoints",
    image: "/icon/dataPanen.png",
    progress: 0,
    total: 1,
    actionUrl: "/app/produksi",
  },
  {
    id: 3,
    title: "Catat hasil produksi",
    description: "Catat penambahan hasil produksi kebun",
    poin: "+20 EcoPoints",
    image: "/icon/dataProduksi.png",
    progress: 0,
    total: 1,
    actionUrl: "/app/produksi",
  },
  {
    id: 4,
    title: "Tambahkan lahan baru",
    description: "Daftarkan atau pantau kondisi lahanmu",
    poin: "+20 EcoPoints",
    image: "/icon/mapPin.png",
    progress: 0,
    total: 1,
    actionUrl: "/app/lahan",
  },
  {
    id: 5,
    title: "Kirimkan hasil panen ke koperasi",
    description: "Kirimkan komoditas atau limbah ke Kopdes",
    poin: "+50 EcoPoints",
    image: "/icon/kirimPanen.png",
    progress: 0,
    total: 1,
    actionUrl: "/app/pengiriman",
  },
  {
    id: 6,
    title: "Setor limbah hasil produk",
    description: "Setor sabut, batok, atau air kelapa untuk EcoPoints",
    poin: "+30 EcoPoints",
    image: "/icon/kirimPanen.png",
    progress: 0,
    total: 1,
    actionUrl: "OPEN_SETOR_LIMBAH",
    actionType: "SETOR_LIMBAH",
  },
];

interface DailyMissionProps {
  missions?: Mission[];
}

export default function DailyMission({ missions: propMissions }: DailyMissionProps) {
  const router = useRouter();
  const [missions, setMissions] = useState<Mission[]>(propMissions || FALLBACK_DAILY_MISSIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSetorLimbahOpen, setIsSetorLimbahOpen] = useState(false);

  const fetchMissions = () => {
    setIsLoading(true);
    fetch("/api/app/eco-points")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.dailyMissions && data.dailyMissions.length > 0) {
          setMissions(data.dailyMissions);
        }
      })
      .catch((err) => console.error("Error loading daily missions:", err))
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
            <Calendar1 className="w-6 h-6" />
            Misi Harian Petani
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Lakukan tugas harianmu untuk mengumpulkan poin dan naik level!
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
