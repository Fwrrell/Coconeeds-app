import { TIER_DATA } from "@/components/ecoPoint/pageTab/detailTier/DataTier";

export function getTierProgress(point: number, tier: keyof typeof TIER_DATA) {
  const current = TIER_DATA[tier];

  const progress = ((point - current.min) / (current.max - current.min)) * 100;

  return {
    progress: Math.max(0, Math.min(progress, 100)),
    remain: Math.max(current.max - point, 0),
    currentPoint: point,
    targetPoint: current.max,
  };
}
