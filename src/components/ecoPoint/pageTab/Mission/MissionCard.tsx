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
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export interface Mission {
  id?: number | string;
  title: string;
  description: string;
  poin: string;
  progress: number;
  total: number;
  image: string;
  actionUrl?: string;
  actionType?: string;
}

interface PropsMission {
  mission: Mission;
  onAction?: (mission: Mission) => void;
}

export default function MissionCard({ mission, onAction }: PropsMission) {
  const isCompleted = mission.progress >= mission.total;
  const progressPercent = Math.min(100, Math.round((mission.progress / (mission.total || 1)) * 100));

  const handleActionClick = () => {
    if (onAction) {
      onAction(mission);
    }
  };

  return (
    <Card className={`rounded-2xl shadow-none transition-all border ${isCompleted ? "border-emerald-200 bg-emerald-50/20" : "border-gray-200 bg-white hover:border-[#606C38]/40"}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-center h-28 items-center">
          <Image
            src={mission.image || "/icon/dataPanen.png"}
            width={120}
            height={120}
            alt={mission.title}
            className="object-contain max-h-24 w-auto"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-bold text-gray-900 line-clamp-1">
            {mission.title}
          </CardTitle>
          {isCompleted && (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          )}
        </div>
        <p className="text-xs text-gray-500 line-clamp-2 min-h-[32px]">
          {mission.description}
        </p>
        <div className="inline-flex rounded-full bg-[#BC6C25]/10 px-2.5 py-1 text-[#BC6C25] font-bold text-[11px]">
          {mission.poin}
        </div>

        <div className="space-y-1 pt-1">
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${isCompleted ? "bg-emerald-600" : "bg-[#BC6C25]"}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
            <span>Progress</span>
            <span className={isCompleted ? "text-emerald-600 font-extrabold" : "text-gray-600"}>
              {mission.progress} / {mission.total}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        {isCompleted ? (
          <button
            disabled
            className="w-full rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold py-2 cursor-default flex items-center justify-center gap-1.5 shadow-none"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Misi Selesai
          </button>
        ) : mission.actionUrl === "OPEN_SETOR_LIMBAH" || mission.actionType === "SETOR_LIMBAH" || onAction ? (
          <button
            type="button"
            onClick={handleActionClick}
            className="w-full text-center rounded-xl bg-[#606C38] hover:bg-[#283618] text-white text-xs font-bold py-2 transition-colors shadow-none block"
          >
            Mulai Misi
          </button>
        ) : mission.actionUrl ? (
          <Link
            href={mission.actionUrl}
            className="w-full text-center rounded-xl bg-[#606C38] hover:bg-[#283618] text-white text-xs font-bold py-2 transition-colors shadow-none block"
          >
            Mulai Misi
          </Link>
        ) : (
          <button className="w-full rounded-xl bg-[#606C38] hover:bg-[#283618] text-white text-xs font-bold py-2 transition-colors shadow-none">
            Mulai
          </button>
        )}
      </CardFooter>
    </Card>
  );
}
