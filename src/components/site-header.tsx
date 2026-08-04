"use client";

import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
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

export function SiteHeader() {
  const { activeKopdesId, setActiveKopdes } = useAdminStore();
  const [kopdesList, setKopdesList] = useState<Kopdes[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchKopdes = async () => {
      try {
        const res = await fetch("/api/kopdes");
        if (!res.ok) throw new Error("Gagal mengambil data Kopdes");

        const responseData = await res.json();

        let safeArray: Kopdes[] = [];
        if (Array.isArray(responseData)) {
          safeArray = responseData;
        } else if (responseData && Array.isArray(responseData.data)) {
          safeArray = responseData.data;
        }

        setKopdesList(safeArray);

        if (!activeKopdesId) {
          setActiveKopdes("ALL");
        }
      } catch (error) {
        console.error("Error fetching kopdes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKopdes();
  }, [setActiveKopdes]);

  const getDisplayValue = () => {
    if (activeKopdesId === "ALL") {
      return "Semua Kopdes (Global)";
    }

    const selectedKopdes = kopdesList.find(
      (k) => String(k.id) === String(activeKopdesId),
    );

    return selectedKopdes?.name;
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <h1 className="text-base font-medium">Documents</h1>

        {/* Kopdes Switcher */}
        <div className="ml-auto flex w-auto min-w-[200px] max-w-[320px] justify-end items-center gap-2">
          <span className="text-xs font-bold text-gray-500 hidden sm:inline-block shrink-0">
            Kopdes Aktif:
          </span>
          <Select
            value={activeKopdesId ?? ""}
            onValueChange={(value) => setActiveKopdes(value ?? "")}
            disabled={isLoading}
          >
            <SelectTrigger className="h-8.5 w-full text-xs font-semibold bg-white border-gray-200 focus:ring-[#606C38] focus:border-[#606C38] rounded-md shadow-none text-gray-800">
              <SelectValue
                placeholder={isLoading ? "Memuat Kopdes..." : "Pilih Kopdes"}
              >
                {getDisplayValue()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="font-['Quicksand',sans-serif] bg-white border border-gray-200 rounded-md shadow-none">
              <SelectItem
                value="ALL"
                className="font-bold text-[#606C38] focus:bg-[#FEFAE0]/40"
              >
                <span className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-[#606C38]" />
                  Semua Kopdes (Global)
                </span>
              </SelectItem>
              {(kopdesList || []).map((kopdes) => (
                <SelectItem
                  key={kopdes.id}
                  value={String(kopdes.id)}
                  className="font-medium text-gray-800"
                >
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-gray-500" />
                    {kopdes.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
}
