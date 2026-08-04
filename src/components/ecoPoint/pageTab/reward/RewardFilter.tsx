"use client";
import React from "react";

import { Grid2X2, Smartphone, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RewardCategory } from "./RewardTypes";
const categories = [
  {
    value: "all",
    label: "All",
    icon: Grid2X2,
  },
  {
    value: "digital",
    label: "Digital",
    icon: Smartphone,
  },
  {
    value: "pertanian",
    label: "Pertanian",
    icon: Sprout,
  },
];
interface Props {
  value: RewardCategory;
  onChange: (value: RewardCategory) => void;
}

export default function RewardFilter({ value, onChange }: Props) {
  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex flex-wrap gap-3 min-w-max">
        {categories.map((item) => {
          const Icon = item.icon;

          return (
            <Button
              key={item.value}
              variant="outline"
              onClick={() => onChange(item.value as RewardCategory)}
              className={
                value === item.value
                  ? "bg-[#606C38] text-white border-[#D7E7D7]"
                  : ""
              }
            >
              <Icon className="w-4 h-4 mr-2" />

              {item.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
