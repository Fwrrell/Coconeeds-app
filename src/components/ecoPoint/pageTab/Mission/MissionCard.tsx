"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import Image from "next/image";
interface Mission {
  title: string;
  description: string;
  poin: string;
  progress: number;
  total: number;
  image: string;
}

interface PropsMission {
  mission: Mission;
}
const DONUT_COLORS = ["#606C38", "#DDA15E", "#283618", "#BC6C25", "#70E000"];

export default function MissionCard({ mission }: PropsMission) {
  return (
    <Card className="rounded-2xl shadow-sm hover:shadow-lg transition-all border-green-100">
      <CardHeader>
        <div className="flex justify-center">
          <Image
            src={mission.image}
            width={180}
            height={180}
            alt={mission.title}
          />
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-md lg:text-lg font-semibold text-[#283618]">
          {mission.title}
        </CardTitle>
        <p className="text-gray-500">{mission.description}</p>
        <div className="inline-flex mt-2 mb-2 rounded-full bg-[#F8E7D2] px-3 py-2 text-[#BC6C25] font-semibold text-xs">
          {mission.poin}
        </div>

        <div className="space-y-1">
          <div className="h-2 rounded-full bg-[#ECECEC]">
            <div
              className="h-full rounded-full bg-[#BC6C25]"
              style={{
                width: `${(mission.progress / mission.total) * 100}%`,
              }}
            />
          </div>

          <div className="flex justify-end text-xs font-semibold">
            {mission.progress} / {mission.total}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <button className="w-full rounded-xl bg-[#606C38] py-2 text-white font-semibold hover:bg-[#4E582E] transition">
          Mulai
        </button>
      </CardFooter>
    </Card>
  );
}
