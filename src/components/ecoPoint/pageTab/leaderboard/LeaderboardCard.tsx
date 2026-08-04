import React from "react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { ChevronRight, MapPin } from "lucide-react";
import { Rank } from "./RankTypes";
import { LEVEL_CONFIG } from "./RankTypes";
import { Progress } from "@/components/ui/progress";
interface leaderBoardCardProps {
  farmer: Rank;
  rank: number;
}
export default function LeaderboardCard({
  farmer,
  rank,
}: leaderBoardCardProps) {
  const level = LEVEL_CONFIG[farmer.level];
  return (
    <Card className="rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex flex-col lg:flex-row justify-between gap-6">
        <div className="flex flex-col lg:flex-row items-center gap-4">
          <div className="w-10 text-center">
            <span className="text-lg lg:text-2xl font-bold text-green-700">
              #{rank}
            </span>
          </div>
          {/* Rank */}

          {/* Avatar */}
          <Image
            src="/sprout.png"
            width={60}
            height={60}
            alt={farmer.name}
            className="rounded-full"
          />

          {/* Info */}
          <div>
            <h3 className="font-semibold text-lg">{farmer.name}</h3>

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              Desa Ambon
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Image src={level.icon} alt={level.label} width={42} height={42} />

            <span
              style={{
                color: level.color,
                borderColor: level.color,
                backgroundColor: `${level.color}15`,
              }}
              className="p-2 rounded-lg text-sm font-semibold"
            >
              {level.label}
            </span>
          </div>
        </div>

        {/* RIGHT */}

        <div className="flex flex-col items-center lg:flex-row lg:items-end gap-2 lg:gap-20">
          <div className="text-right flex items-center items-end gap-2">
            <h2 className="text-3xl font-bold text-green-600">
              {farmer.ecopoint.toLocaleString("id-ID")}
            </h2>
            <p className="text-lg text-muted-foreground font-semibold">
              EcoPoints
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Progress value={82} className="w-32" />

            <span className="text-sm font-medium">82%</span>

            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </Card>
  );
}
