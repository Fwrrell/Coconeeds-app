"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export function JuriAccessSwitch() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const { data } = await res.json();
        if (data && typeof data.juriAccess === "boolean") {
          setIsEnabled(data.juriAccess);
        }
      } catch (error) {
        toast.error("Gagal memuat status Akses Juri.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleToggle = async (checked: boolean) => {
    setIsEnabled(checked);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ juriAccess: checked }),
      });
      if (!res.ok) throw new Error();
      
      const { data } = await res.json();
      toast.success(`Akses Juri ${data.juriAccess ? "diaktifkan" : "dinonaktifkan"}.`);
    } catch (error) {
      toast.error("Gagal mengubah pengaturan Akses Juri.");
      setIsEnabled(!checked);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-10 w-48" />;
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="juri-access-switch"
        checked={isEnabled}
        onCheckedChange={handleToggle}
        disabled={isLoading}
      />
      <Label htmlFor="juri-access-switch" className="font-semibold">Akses Juri</Label>
    </div>
  );
}
