"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function AutoVerifySwitch() {
  const [isAutoVerify, setIsAutoVerify] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        setIsAutoVerify(data.autoVerifyPetani);
      } catch (error) {
        console.error("Gagal fetch settings", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const toggleSwitch = async (checked: boolean) => {
    setIsAutoVerify(checked);

    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoVerifyPetani: checked }),
      });
    } catch (error) {
      console.error("Gagal update setting", error);
      setIsAutoVerify(!checked);
    }
  };

  if (isLoading) return <div className="text-sm text-gray-500">Memuat...</div>;

  return (
    <div className="flex items-center space-x-2 bg-slate-100 p-2 rounded-md border">
      <Switch
        id="auto-verify-mode"
        checked={isAutoVerify}
        onCheckedChange={toggleSwitch}
      />
      <Label htmlFor="auto-verify-mode" className="font-medium cursor-pointer">
        Auto-Verify Mode {isAutoVerify ? "✅" : "❌"}
      </Label>
    </div>
  );
}
