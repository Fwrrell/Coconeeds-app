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
import { ActiveDraggableContext } from "@dnd-kit/core/dist/components/DndContext";

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
        // console.log("Data API Kopdes:", responseData);

        let safeArray: Kopdes[] = [];
        if (Array.isArray(responseData)) {
          safeArray = responseData;
        } else if (responseData && Array.isArray(responseData.data)) {
          safeArray = responseData.data;
        }

        setKopdesList(safeArray);

        if (safeArray.length > 0 && !activeKopdesId) {
          setActiveKopdes(safeArray[0].id);
        }
      } catch (error) {
        console.error("Error fetching kopdes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKopdes();
  }, [activeKopdesId, setActiveKopdes]);

  const getDisplayValue = () => {
    if (activeKopdesId === "ALL") {
      return "🌍 Semua Kopdes (Global)";
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
        <div className="ml-auto flex w-auto min-w-[180px] max-w-[200px] sm:max-w-[300px] lg:max-w-[400px] justify-end">
          <Select
            value={activeKopdesId ?? ""}
            onValueChange={(value) => setActiveKopdes(value ?? "")}
            disabled={isLoading}
          >
            <SelectTrigger className="h-8 w-full text-xs lg:text-sm bg-muted/50 [&>span]:truncate">
              <SelectValue
                placeholder={isLoading ? "Memuat..." : "Pilih Pos Kopdes"}
              >
                {getDisplayValue()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="font-semibold text-primary">
                🌍 Semua Kopdes (Global)
              </SelectItem>
              {(kopdesList || []).map((kopdes) => (
                <SelectItem key={kopdes.id} value={String(kopdes.id)}>
                  {kopdes.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
}
