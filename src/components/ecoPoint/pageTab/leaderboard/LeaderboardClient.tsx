"use client";
import { Rank } from "./RankTypes";
import TopThree from "./TopThreeCards";
import LeaderboardList from "./LeaderboardList";
import RankFilter from "./RankFilter";
import { RankCategory } from "./RankTypes";
import { useState } from "react";

interface LeaderboardClientProps {
  initialData: Rank[];
}
export default function LeaderboardClient({
  initialData,
}: LeaderboardClientProps) {
  const [rank, setRank] = useState<RankCategory>("Pemula");

  const filteredData = initialData.filter((item) => item.level === rank);
  return (
    <div className="space-y-6 flex flex-col gap-6">
      <div className="px-4">
        <RankFilter rank={rank} onChange={setRank} />
      </div>
      <TopThree data={initialData} />
      <LeaderboardList data={filteredData} />
    </div>
  );
}
