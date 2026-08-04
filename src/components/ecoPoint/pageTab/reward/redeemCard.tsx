"use client";
import React from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { Minus, Plus, Leaf } from "lucide-react";

import { Reward } from "./RewardTypes";

interface Props {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  reward: Reward | null;
}
export default function RedeemCard({ open, onOpenChange, reward }: Props) {
  if (!reward) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-visible bg-gradient-to-br from-white via-[#FCFCF9] to-[#F7F8F2]">
        <div className="absolute left-1/2 -translate-x-1/2 -top-10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#606C38] to-[#283618] border-4 border-white flex items-center justify-center shadow-lg">
            <Leaf className="w-10 h-10 text-white" />
          </div>
        </div>

        <div className="pt-14 px-8 pb-8 flex flex-col gap-6">
          <div className="flex justify-center  rounded-xl">
            <Image
              src={reward.image}
              width={230}
              height={230}
              alt={reward.title}
            />
          </div>

          {/* Title */}
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-[#283618] border-b border-[#DDA15E] py-2">
              {reward.title}
            </h2>

            <div className="inline-flex items-center gap-2 rounded-full bg-[#F7F4EA] px-5 py-2 text-[#606C38] font-semibold">
              <Leaf className="w-4 h-4" />
              {reward.poin}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-center font-medium">Jumlah</p>

            <div className="flex justify-center items-center gap-6">
              <Button
                size="icon"
                variant="outline"
                className="bg-[#F7F4EA] text-[#BC6C25] rounded-full hover:text-[#DDA15E]"
              >
                <Minus />
              </Button>

              <span className="font-bold text-xl">1</span>

              <Button
                size="icon"
                variant="outline"
                className=" bg-[#EDF8F1] text-[#269957] rounded-full"
              >
                <Plus />
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-[#CBE7D5] bg-gradient-to-r from-[#F7F9F2] to-[#EEF4E6] px-5 py-4 flex justify-between">
            <span>Sisa EcoPoints</span>

            <span className="font-semibold text-[#606C38]">2.450 Points</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-12 rounded-xl bg-white border border-[#D9DED3] hover:bg-[#F7F4EA]"
            >
              Batal
            </Button>

            <Button className="h-12 rounded-xl bg-[#606C38] hover:bg-[#4E592F] active:bg-[#283618]">
              Tukar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
