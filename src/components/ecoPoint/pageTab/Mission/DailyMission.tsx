import React from "react";
import MissionCard from "./MissionCard";
import { Calendar1 } from "lucide-react";
const dataMission = [
  {
    id: 1,
    title: "Login harian",
    description: "catat hasil panenmu hari ini",
    poin: "+10 EcoPoints",
    image: "/icon/loginHarian.png",
    progress: 1,
    total: 1,
  },
  {
    id: 2,
    title: "Catat panen harian",
    description: "catat hasil panenmu hari ini",
    poin: "+10 EcoPoints",
    image: "/icon/dataPanen.png",
    progress: 0,
    total: 1,
  },
  {
    id: 3,
    title: "Catat hasil produksi",
    description: "catat hasil produksimu hari ini",
    poin: "+20 EcoPoints",
    image: "/icon/dataProduksi.png",
    progress: 0,
    total: 1,
  },
  {
    id: 4,
    title: "Tambahkan lahan baru",
    description: "catat observasi kondisi lahanmu hari ini",
    poin: "+20 EcoPoints",
    image: "/icon/mapPin.png",
    progress: 0,
    total: 1,
  },
  {
    id: 5,
    title: "Batch berhasil terjual",
    description: "Hasil kelapamu terjual ke perusahaan",
    poin: "+80 EcoPoints",
    image: "/icon/crate.png",
    progress: 0,
    total: 1,
  },
  {
    id: 6,
    title: "Kirimkan hasil panen ke koperasi",
    description: "kirimkan hasil panenmu ke koperasi desa",
    poin: "+50 EcoPoints",
    image: "/icon/kirimPanen.png",
    progress: 0,
    total: 1,
  },
  {
    id: 7,
    title: "Catat pengeluaran harianmu",
    description: "catat pengeluaranmu hari ini",
    poin: "+5 EcoPoints",
    image: "/pengeluaran.png",
    progress: 0,
    total: 1,
  },
];
export default function DailyMission() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h2 className="font-semibold text-xl flex items-center gap-2 text-[#BC6A25]">
            <Calendar1 className="w-7 h-7" />
            Misi Harian
          </h2>
          <p className="text-sm font-medium font-gray-600">
            Lakukan tugas harianmu dan dapatkan poin!
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
