import React from "react";
import LeaderboardClient from "./LeaderboardClient";
import { CalendarDays, Users } from "lucide-react";
import { Rank } from "./RankTypes";
export const leaderboardData: Rank[] = [
  {
    id: 1,
    name: "Widodo Santoso",
    village: "Desa Makmur",
    level: "Organik",
    ecopoint: 7000,
  },
  {
    id: 2,
    name: "Usman Hamzah",
    village: "Desa Makmur",
    level: "Organik",
    ecopoint: 6980,
  },
  {
    id: 3,
    name: "Tono Widodo",
    village: "Desa Makmur",
    level: "Organik",
    ecopoint: 6950,
  },
  {
    id: 4,
    name: "Ahmad Fauzi",
    village: "Desa Ambon",
    level: "Organik",
    ecopoint: 6640,
  },
  {
    id: 5,
    name: "Yusuf Firmansyah",
    village: "Desa Harapan",
    level: "Organik",
    ecopoint: 6510,
  },
  {
    id: 6,
    name: "Rahmat Hidayat",
    village: "Desa Sukamaju",
    level: "Organik",
    ecopoint: 6380,
  },
  {
    id: 7,
    name: "M. Ridwan",
    village: "Desa Minahasa",
    level: "Hijau",
    ecopoint: 5890,
  },
  {
    id: 8,
    name: "Agus Salim",
    village: "Desa Bahari",
    level: "Hijau",
    ecopoint: 5650,
  },
  {
    id: 9,
    name: "Hendra Saputra",
    village: "Desa Sejahtera",
    level: "Hijau",
    ecopoint: 5525,
  },
  {
    id: 10,
    name: "Dedi Kurniawan",
    village: "Desa Lestari",
    level: "Hijau",
    ecopoint: 5340,
  },
  {
    id: 11,
    name: "Andi Pratama",
    village: "Desa Makmur",
    level: "Hijau",
    ecopoint: 5110,
  },
  {
    id: 12,
    name: "Fajar Nugroho",
    village: "Desa Bahagia",
    level: "Hijau",
    ecopoint: 4850,
  },
  {
    id: 13,
    name: "Budi Santoso",
    village: "Desa Pelita",
    level: "Hijau",
    ecopoint: 4525,
  },
  {
    id: 14,
    name: "Zainal Abidin",
    village: "Desa Ambon",
    level: "Hijau",
    ecopoint: 4180,
  },
  {
    id: 15,
    name: "Rizky Ananda",
    village: "Desa Maju",
    level: "Hijau",
    ecopoint: 3860,
  },
  {
    id: 16,
    name: "Slamet Riyadi",
    village: "Desa Sukamaju",
    level: "Pemula",
    ecopoint: 2870,
  },
  {
    id: 17,
    name: "Ilham Maulana",
    village: "Desa Pelita",
    level: "Pemula",
    ecopoint: 2395,
  },
  {
    id: 18,
    name: "Nanda Prakoso",
    village: "Desa Harapan",
    level: "Pemula",
    ecopoint: 1910,
  },
  {
    id: 19,
    name: "Roni Saputra",
    village: "Desa Minahasa",
    level: "Pemula",
    ecopoint: 1465,
  },
  {
    id: 20,
    name: "Kevin Kurnia",
    village: "Desa Lestari",
    level: "Pemula",
    ecopoint: 980,
  },
];
export default function LeaderboardPage() {
  return (
    <div className="flex flex-col gap-4 bg-white w-full rounded-lg">
      <div className="flex flex-col gap-2 py-2 lg:gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-gray-300">
        {/* <Image
            src="/ecopointLeaderboard.png"
            width={280}
            height={150}
            alt="ecopoint leaderboard logo"
            className="w-44 lg:w-72 h-auto"
          /> */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-2 lg:p-3 rounded-lg bg-white shadow-sm">
            <Users className="w-10 h-10 bg-[#EEF8F2] p-2 rounded-md text-[#269957]" />
            <div className="flex flex-col gap-1 whitespace-nowrap">
              <span className="font-semibold text-xs lg:text-md">
                Total Petani
              </span>
              <span className="text-[#269957] font-semibold text-md lg:text-lg">
                1.000
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 lg:p-3  rounded-lg bg-white shadow-sm">
            <CalendarDays className="w-10 h-10 bg-[#EEF8F2] p-2 rounded-md text-[#269957]" />
            <div className="flex flex-col gap-1">
              <span className="font-semibold  text-sm lg:text-md">Musim </span>
              <span className="text-[#269957] font-semibold whitespace-nowrap text-md lg:text-lg">
                Agustus 2026
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full">
        <LeaderboardClient initialData={leaderboardData} />
      </div>
    </div>
  );
}
