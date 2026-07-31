"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { JuriAccessSwitch } from "@/components/admin/JuriAccessSwitch";
import { AutoVerifySwitch } from "@/components/admin/AutoVerifySwitch";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-6 md:p-8 space-y-6"
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan Sistem</h1>
        <p className="text-sm text-muted-foreground">
          Kelola fitur global dan mode akses platform.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mode Akses</CardTitle>
          <CardDescription>
            Pengaturan untuk mengubah hak akses pengguna sementara.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-bold">Akses Juri</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Aktifkan untuk mengizinkan semua pengguna yang login (non-admin)
                mengakses dashboard /admin.
                <br />
                <span className="font-semibold text-orange-600">
                  Untuk keperluan demo.
                </span>
              </p>
            </div>
            <JuriAccessSwitch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Otomatisasi</CardTitle>
          <CardDescription>
            Pengaturan untuk alur kerja otomatis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-bold">Verifikasi Otomatis</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Jika aktif, petani baru akan otomatis terverifikasi tanpa perlu
                approval manual.
              </p>
            </div>
            <AutoVerifySwitch />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
