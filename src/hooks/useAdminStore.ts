import { create } from "zustand";

interface AdminState {
  activeKopdesId: string | null;
  setActiveKopdes: (id: string) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  activeKopdesId: null,
  setActiveKopdes: (id) => set({ activeKopdesId: id }),
}));
