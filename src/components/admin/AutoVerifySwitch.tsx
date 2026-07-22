"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function AutoVerifySwitch() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const { data } = await res.json();
        setIsEnabled(data.autoVerifyNewUser);
      } catch (error) {
        toast.error("Gagal memuat status auto-verify.");
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
        body: JSON.stringify({ autoVerifyNewUser: checked }),
      });
      if (!res.ok) throw new Error();
      
      const { data } = await res.json();
      toast.success(`Auto-verifikasi ${data.autoVerifyNewUser ? "diaktifkan" : "dinonaktifkan"}.`);
    } catch (error) {
      toast.error("Gagal mengubah pengaturan.");
      // Revert state on failure
      setIsEnabled(!checked);
    }
  };

  if (isLoading) {
    return <div className="flex items-center space-x-2 h-10">
        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
    </div>;
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="auto-verify-switch"
        checked={isEnabled}
        onCheckedChange={handleToggle}
        disabled={isLoading}
      />
      <Label htmlFor="auto-verify-switch">Auto-Verify</Label>
    </div>
  );
}
