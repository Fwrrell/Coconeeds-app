export type RankCategory = "Pemula" | "Hijau" | "Organik";
export interface Rank {
  id: number;
  name: string;
  village: string;
  level: RankCategory;
  ecopoint: number;
}
export const LEVEL_CONFIG = {
  Pemula: {
    label: "Pemula",
    color: "#94A3B8",
    icon: "/icon/pemula.png",
  },

  Hijau: {
    label: "Hijau",
    color: "#269957",
    icon: "/icon/hijau.png",
  },

  Organik: {
    label: "Organik",
    color: "#4D7C0F",
    icon: "/icon/organik.png",
  },
} as const;
