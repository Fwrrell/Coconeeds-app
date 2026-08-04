import React, { useEffect, useState } from "react";
import { Rank } from "./RankTypes";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface leaderboardTopThree {
  data: Rank[];
}
// fungsi pengubah posisi card ketika responsive
function useIsDesktop() {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const update = () => {
      setDesktop(window.innerWidth >= 1024);
    };

    update();

    window.addEventListener("resize", update);

    return () => window.removeEventListener("resize", update);
  }, []);

  return desktop;
}
type PodiumPlace = 1 | 2 | 3;
const podiumStyle: Record<
  PodiumPlace,
  {
    card: string;
    avatar: string;
    medal: string;
    score: string;
    border: string;
  }
> = {
  1: {
    card: "col-span-12 lg:col-span-6 min-h-[360px]",
    avatar: "w-32 h-32",
    medal: "/rank1.png",
    score: "text-4xl",
    border: "border-yellow-400",
  },

  2: {
    card: "col-span-12 lg:col-span-3 min-h-[280px]",
    avatar: "w-22 h-22",
    medal: "/rank2.png",
    score: "text-3xl",
    border: "border-slate-300",
  },

  3: {
    card: "col-span-12 lg:col-span-3 min-h-[280px]",
    avatar: "w-22 h-22",
    medal: "/rank3.png",
    score: "text-3xl",
    border: "border-orange-300",
  },
};
export default function TopThree({ data }: leaderboardTopThree) {
  const desktop = useIsDesktop();
  const order: {
    farmer: Rank;
    place: PodiumPlace;
  }[] = desktop
    ? [
        {
          farmer: data[1],
          place: 2,
        },
        {
          farmer: data[0],
          place: 1,
        },
        {
          farmer: data[2],
          place: 3,
        },
      ]
    : [
        { farmer: data[0], place: 1 },
        { farmer: data[1], place: 2 },
        { farmer: data[2], place: 3 },
      ];
  if (data.length < 3) return null;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">
      {order.map(({ farmer, place }) => {
        const style = podiumStyle[place];
        return (
          <Card
            key={farmer.id}
            className={`relative overflow-visible rounded-3xl border-2 ${style.border} ${style.card}`}
          >
            <div className="flex flex-col items-center justify-center h-full py-8 px-6">
              {/* Medal */}
              <Image
                src={style.medal}
                alt={`Rank ${place}`}
                width={70}
                height={70}
                className="absolute -top-10"
              />

              {/* Avatar */}
              <Image
                src="/sprout.png"
                alt={farmer.name}
                width={120}
                height={120}
                className={`rounded-full object-cover ${style.avatar}`}
              />

              <h2 className="mt-5 text-2xl font-bold">{farmer.name}</h2>

              <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                Desa Makmur
              </div>

              <div className="mt-2 rounded-full bg-green-50 px-4 py-2 text-green-700 font-medium">
                {farmer.level}
              </div>

              <p className="mt-4 text-muted-foreground">EcoPoint</p>

              <h1 className={`font-bold text-green-600 ${style.score}`}>
                {farmer.ecopoint.toLocaleString()}
              </h1>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
