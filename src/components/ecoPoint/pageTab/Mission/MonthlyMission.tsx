import React from "react";
import MissionCard from "./MissionCard";
import { CalendarDays } from "lucide-react";
const dataMission = [
  {
    id: 1,
    title: "Login setiap minggu",
    description: "login ke farmer-portal setiap minggu",
    poin: "+4 EcoPoints",
    image: "/icon/loginHarian.png",
    progress: 2,
    total: 4,
  },
  {
    id: 2,
    title: "Lakukan panen bulanan",
    description: "catat hasil panenmu bulananmu ",
    poin: "+15 EcoPoints",
    image: "/icon/dataPanen.png",
    progress: 0,
    total: 1,
  },
  {
    id: 3,
    title: "Produksi kopra dan kirimkan",
    description: "kirimkan hasil kopra ke koperasi desa",
    poin: "+20 EcoPoints",
    image: "/dataProduksi.png",
    progress: 0,
    total: 1,
  },
  {
    id: 4,
    title: "Tukarkan tempurung kelapa",
    description: "Tukar tempurung kelapa menjadi EcoPoint",
    poin: "+15 EcoPoints",
    image: "/icon/laporanHarian.png",
    progress: 0,
    total: 3,
  },
  {
    id: 5,
    title: "Foto hasil panen",
    description: "Upload hasil foto panenmu untuk dianalisis AI",
    poin: "+10 EcoPoints",
    image: "/icon/fotoPanen.png",
    progress: 0,
    total: 3,
  },
  {
    id: 6,
    title: "Produksi daging kelapa putih",
    description: "kirimkan hasil daging kelapa putih ",
    poin: "+25 EcoPoints",
    image: "/icon/kopraPutih.png",
    progress: 2,
    total: 3,
  },
];
export default function MonthlyMission() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h2 className="font-semibold text-xl flex items-center gap-2 text-[#BC6C25]">
            <CalendarDays className="w-7 h-7" />
            Misi Bulanan
          </h2>
          <p className="text-sm font-medium font-gray-600">
            Misi dengan poin terbesar
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dataMission.map((mission) => (
          <MissionCard key={mission.id} mission={mission} />
        ))}
      </div>
    </div>
  );
}
