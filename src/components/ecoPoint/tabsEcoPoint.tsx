"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Gift, LayoutGrid, Trophy } from "lucide-react";
import DailyMission from "./pageTab/Mission/DailyMission";
import MonthlyMission from "./pageTab/Mission/MonthlyMission";
import RewardPage from "./pageTab/reward/RewardPage";
import LeaderboardPage from "./pageTab/leaderboard/LeaderboardPage";

interface TabsEcoPointProps {
  dailyMissions?: any[];
  monthlyMissions?: any[];
  rewards?: any[];
  userBalance?: number;
  onBalanceChange?: (newBalance: number) => void;
}

export default function TabsEcoPoint({
  dailyMissions,
  monthlyMissions,
  rewards,
  userBalance,
  onBalanceChange,
}: TabsEcoPointProps) {
  return (
    <Tabs defaultValue="mission" className="py-4 gap-2">
      <TabsList className="w-full h-14 grid grid-cols-3 rounded-2xl p-1 bg-white border border-gray-200 shadow-sm">
        <TabsTrigger
          value="mission"
          className="flex items-center justify-center gap-2 w-full h-full rounded-xl font-bold text-sm !data-[state=active]:bg-[#606C38] !data-[state=active]:text-white !data-[state=active]:shadow-none transition-all"
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Misi & Gamifikasi</span>
        </TabsTrigger>
        <TabsTrigger
          value="reward"
          className="flex items-center justify-center gap-2 w-full h-full rounded-xl font-bold text-sm !data-[state=active]:bg-[#606C38] !data-[state=active]:text-white !data-[state=active]:shadow-none transition-all"
        >
          <Gift className="w-4 h-4" />
          <span>Tukar Hadiah</span>
        </TabsTrigger>
        <TabsTrigger
          value="leaderboard"
          className="flex items-center justify-center gap-2 w-full h-full rounded-xl font-bold text-sm !data-[state=active]:bg-[#606C38] !data-[state=active]:text-white !data-[state=active]:shadow-none transition-all"
        >
          <Trophy className="w-4 h-4" />
          <span>Peringkat Petani</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="mission" className="mt-4 space-y-6">
        <DailyMission missions={dailyMissions} />
        <MonthlyMission missions={monthlyMissions} />
      </TabsContent>

      <TabsContent value="reward" className="mt-4">
        <RewardPage
          rewards={rewards}
          userBalance={userBalance}
          onBalanceChange={onBalanceChange}
        />
      </TabsContent>

      <TabsContent value="leaderboard" className="mt-4">
        <LeaderboardPage />
      </TabsContent>
    </Tabs>
  );
}
