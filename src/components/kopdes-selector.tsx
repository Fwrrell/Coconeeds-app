"use client";

import { useEffect, useState } from "react";
import { useAdminStore } from "@/hooks/useAdminStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Globe } from "lucide-react";

interface Kopdes {
  id: string;
  name: string;
}

// selector kopdes lokal untuk halaman inventory, logistics, marketplace
export function KopdesSelector() {
  const { activeKopdesId, setActiveKopdes } = useAdminStore();
  const [kopdesList, setKopdesList] = useState<Kopdes[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchKopdes = async () => {
      try {
        const res = await fetch("/api/kopdes");
        if (!res.ok) throw new Error("Gagal mengambil data Kopdes");
        const responseData = await res.json();
        const safeArray = Array.isArray(responseData)
          ? responseData
          : Array.isArray(responseData?.data)
          ? responseData.data
          : [];
        setKopdesList(safeArray);
      } catch (error) {
        console.error("Error fetching kopdes list:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchKopdes();
  }, []);

  const currentValue = activeKopdesId || "ALL";

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold text-gray-500 hidden sm:inline-block">
        Kopdes:
      </span>
      <Select value={currentValue} onValueChange={(val) => setActiveKopdes(val || "ALL")}>
        <SelectTrigger className="h-9 w-[200px] text-xs font-bold bg-white border-gray-300 focus:ring-[#606C38] rounded-md shadow-none text-gray-800">
          <SelectValue placeholder={isLoading ? "Memuat..." : "Semua Kopdes"}>
            {currentValue === "ALL"
              ? "Semua Kopdes (Global)"
              : kopdesList.find((k) => k.id === currentValue)?.name || "Pilih Kopdes"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="font-['Quicksand',sans-serif] bg-white border border-gray-200 rounded-md shadow-none">
          <SelectItem value="ALL" className="font-bold text-[#606C38]">
            <span className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-[#606C38]" />
              Semua Kopdes (Global)
            </span>
          </SelectItem>
          {kopdesList.map((k) => (
            <SelectItem key={k.id} value={k.id} className="font-medium text-gray-800">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-gray-500" />
                {k.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
