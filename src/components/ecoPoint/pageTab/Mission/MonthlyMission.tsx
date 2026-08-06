import React from "react";
import MissionCard from "./MissionCard";
import { CalendarDays } from "lucide-react";
const dataMission = [
  {
    id: 1,
    title: "Login setiap minggu",
    description: "login ke farmer-portal setiap minggu",
    poin: "+4 EcoPoints",
    image: "/loginHarian.png",
    progress: 2,
    total: 4,
  },
  {
    id: 2,
    title: "Kirimkan hasil panen",
    description: "Kirimkan hasil panenmu ke koperasi",
    poin: "+50 EcoPoints",
    image: "/dataPanen.png",
    progress: 0,
    total: 3,
  },
  {
    id: 3,
    title: "Batch berhasil terjual",
    description: "Jual kelapamu ke perusahaan",
    poin: "+80 EcoPoints",
    image: "/dataProduksi.png",
    progress: 0,
    total: 1,
  },
  {
    id: 4,
    title: "Tukarkan limbah produksi kelapa",
    description: "Tukar limbah kelapa menjadi EcoPoint",
    poin: "+100 EcoPoints",
    image: "/laporanHarian.png",
    progress: 0,
    total: 3,
  },
  {
    id: 5,
    title: "10 Batch berhasil terjual",
    description: "Jual 10 batch kelapamu ke perusahaan",
    poin: "+300 EcoPoints",
    image: "/icon/crate.png",
    progress: 0,
    total: 3,
  },
  {
    id: 6,
    title: "5 Batch berhasil terjual",
    description: "Jual 5 batch kelapamu ke perusahaan",
    poin: "+150 EcoPoints",
    image: "/icon/crate.png",
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
