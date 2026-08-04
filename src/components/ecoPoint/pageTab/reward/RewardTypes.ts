export type RewardCategory = "all" | "digital" | "pertanian";

export interface Reward {
  id: number;
  title: string;
  description: string;
  poin: string;
  image: string;
  category: RewardCategory;
}
