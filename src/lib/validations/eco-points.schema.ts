import { z } from "zod";

export const redeemRewardSchema = z.object({
  rewardId: z.string().min(1, "Reward ID harus ada"),
});
