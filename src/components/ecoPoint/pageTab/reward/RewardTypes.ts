export type RewardCategory = "all" | "digital" | "pertanian" | string;

export interface Reward {
  id: string | number;
  title: string;
  description: string;
  poin: string;
  costPoints?: number;
  image: string;
  category: string;
}
