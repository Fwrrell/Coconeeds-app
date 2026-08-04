"use client";
import React from "react";
import {
  Card,
  CardTitle,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import Image from "next/image";
import { Leaf } from "lucide-react";
import { Reward } from "./RewardTypes";
import { Button } from "@/components/ui/button";
interface props {
  reward: Reward;
  onRedeem: (reward: Reward) => void;
}

export default function RewardCard({ reward, onRedeem }: props) {
  return (
    <Card className="rounded-3xl border border-[#EEF3EC] shadow-sm hover:border-[#D7E7D7] transition-all">
      <div className="flex items-center flex-col lg:flex-row gap-5 p-5">
        <div className="shrink-0">
          <Image
            src={reward.image}
            width={120}
            height={120}
            alt={reward.title}
            className="rounded-2xl"
          />
        </div>
        <div className="flex-1 space-y-2">
          <CardTitle className="text-xl">{reward.title}</CardTitle>

          <div className="text-[#BC6C25]  font-semibold">{reward.poin}</div>

          <CardDescription>{reward.description}</CardDescription>
        </div>

        <div className="shrink-0">
          <Button
            onClick={() => onRedeem(reward)}
            className="h-12 w-36 rounded-xl bg-[#606C38]"
          >
            <Leaf className="w-5 h-5" />
            Tukar Poin
          </Button>
        </div>
      </div>
    </Card>
  );
}
