"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Handshake,
  Check,
  X,
  MessageSquare,
  Loader2,
  Filter,
  Package,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface NegosiasiItem {
  id: string;
  wtbId: string;
  kopdesId?: string | null;
  senderRole: string;
  offeredPrice: number;
  volumeKg?: number | null;
  note?: string | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COUNTER_OFFER";
  createdAt: string;
  kopdes?: {
    id: string;
    name: string;
    region?: string | null;
  } | null;
  parentWtb?: {
    id: string;
    komoditas: string;
    targetWeight: number;
    maxPrice: number;
    destination: string;
  };
}

export default function PerusahaanNegosiasiPage() {
  const { data: session } = useSession();
  const [wtbList, setWtbList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWtbFilter, setSelectedWtbFilter] = useState("ALL");
  const [selectedOffer, setSelectedOffer] = useState<NegosiasiItem | null>(
    null,
  );
  const [counterPrice, setCounterPrice] = useState("");
  const [counterNote, setCounterNote] = useState("");

  // filter penawaran kopdes dari backend
  const fetchData = async () => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/wtb?perusahaanId=${session.user.id}`);
      const json = await res.json();
      if (res.ok) {
        setWtbList(json.data || []);
      } else {
        toast.error(json.error || "Gagal memuat data negosiasi.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchData();
    }
  }, [session?.user?.id]);

  // hitung total volume terpenuhi & gabungkan relasi parent wtb
  const allOffers: NegosiasiItem[] = wtbList.flatMap((wtb) =>
    (wtb.negosiasi || []).map((nego: any) => ({
      ...nego,
      parentWtb: {
        id: wtb.id,
        komoditas: wtb.komoditas,
        targetWeight: wtb.targetWeight,
        maxPrice: wtb.maxPrice,
        destination: wtb.destination,
      },
    })),
  );

  const filteredOffers =
    selectedWtbFilter === "ALL"
      ? allOffers
      : allOffers.filter((o) => o.wtbId === selectedWtbFilter);

  // patch status negosiasi ke db (ACCEPTED)
  const handleAccept = async (wtbId: string, negoId: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/wtb/${wtbId}/negosiasi/${negoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACCEPTED" }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(json.message || "Penawaran berhasil disetujui!");
        fetchData();
      } else {
        toast.error(json.error || "Gagal menyetujui penawaran.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // patch status negosiasi ke db (REJECTED)
  const handleReject = async (wtbId: string, negoId: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/wtb/${wtbId}/negosiasi/${negoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED" }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(json.message || "Penawaran ditolak.");
        fetchData();
      } else {
        toast.error(json.error || "Gagal menolak penawaran.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // patch status negosiasi ke db (COUNTER_OFFER)
  const handleSendCounterOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffer || !counterPrice) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(
        `/api/wtb/${selectedOffer.wtbId}/negosiasi/${selectedOffer.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "COUNTER_OFFER",
            counterPrice: Number(counterPrice),
            note: counterNote,
          }),
        },
      );
      const json = await res.json();
      if (res.ok) {
        toast.success("Counter offer berhasil dikirim ke Kopdes.");
        setSelectedOffer(null);
        setCounterPrice("");
        setCounterNote("");
        fetchData();
      } else {
        toast.error(json.error || "Gagal mengirim counter offer.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full font-['Quicksand',sans-serif] bg-[#FFFFFF]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#606C38] text-white flex items-center justify-center">
              <Handshake className="h-4 w-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Negosiasi Harga & Penawaran Kopdes
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-1">
            Tinjau, terima, tolak, atau ajukan harga penawaran (Counter Offer)
            kepada Koperasi Desa.
          </p>
        </div>

        {/* Filter Purchase Request */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select
            value={selectedWtbFilter}
            onValueChange={(val) => setSelectedWtbFilter(val || "ALL")}
          >
            <SelectTrigger className="w-[220px] h-10 rounded-xl border-gray-300 text-xs font-bold bg-white">
              <SelectValue placeholder="Filter Purchase Request" />
            </SelectTrigger>
            <SelectContent className="font-['Quicksand',sans-serif]">
              <SelectItem value="ALL" className="font-bold text-[#606C38]">
                Semua Purchase Request
              </SelectItem>
              {wtbList.map((wtb) => (
                <SelectItem key={wtb.id} value={wtb.id}>
                  {wtb.komoditas} ({wtb.id.slice(0, 8).toUpperCase()})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Negotiation List Card */}
      <Card className="bg-white border border-gray-200 rounded-2xl shadow-none">
        <CardHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base font-bold text-gray-900">
              Daftar Usulan Harga Penawaran Kopdes
            </CardTitle>
            <p className="text-xs font-medium text-gray-500">
              Penawaran kuota tonase panen yang masuk untuk Purchase Request
              perusahaan Anda.
            </p>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12 text-gray-500 text-xs font-semibold">
              <Loader2 className="h-6 w-6 animate-spin text-[#606C38] mr-2" />
              Memuat penawaran negosiasi...
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-gray-200 rounded-2xl space-y-3">
              <Package className="mx-auto h-10 w-10 text-gray-400" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-gray-900">
                  Belum Ada Penawaran Negosiasi
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Belum ada penawaran negosiasi masuk dari Kopdes untuk Purchase
                  Request ini.
                </p>
              </div>
            </div>
          ) : (
            filteredOffers.map((item) => {
              const kopdesName = item.kopdes?.name || "Kopdes Mitrage";
              const volumeText = item.volumeKg
                ? `${item.volumeKg.toLocaleString("id-ID")} Kg`
                : "—";
              const initialPrice = item.parentWtb?.maxPrice || 0;

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl border border-gray-200 bg-white hover:border-[#606C38] transition-colors space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#606C38]">
                          {item.id.slice(0, 8).toUpperCase()}
                        </span>
                        <h3 className="text-base font-bold text-gray-900">
                          {kopdesName}
                        </h3>
                      </div>
                      <p className="text-xs font-medium text-gray-500 mt-0.5">
                        Target PR:{" "}
                        <span className="font-bold text-gray-700">
                          {item.parentWtb?.komoditas} (
                          {item.wtbId.slice(0, 8).toUpperCase()})
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status === "PENDING" && (
                        <Badge
                          variant="outline"
                          className="bg-amber-50 text-amber-700 border-amber-200 font-bold text-xs"
                        >
                          Menunggu Keputusan
                        </Badge>
                      )}
                      {item.status === "ACCEPTED" && (
                        <Badge className="bg-[#606C38] text-white font-bold text-xs shadow-none">
                          DISETUJUI (ACCEPTED)
                        </Badge>
                      )}
                      {item.status === "REJECTED" && (
                        <Badge
                          variant="outline"
                          className="bg-red-50 text-red-600 border-red-200 font-bold text-xs"
                        >
                          DITOLAK (REJECTED)
                        </Badge>
                      )}
                      {item.status === "COUNTER_OFFER" && (
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200 font-bold text-xs"
                        >
                          COUNTER OFFER TERKIRIM
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Price comparison grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-0.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        Volume Penawaran
                      </span>
                      <p className="text-sm font-extrabold text-gray-900">
                        {volumeText}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-0.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        Harga Awal PR
                      </span>
                      <p className="text-sm font-extrabold text-gray-700">
                        Rp {initialPrice.toLocaleString("id-ID")} / Kg
                      </p>
                    </div>
                    <div className="p-3 bg-[#FEFAE0]/30 rounded-xl border border-gray-200/80 space-y-0.5">
                      <span className="text-[10px] font-bold text-[#BC6C25] uppercase">
                        Harga Penawaran Kopdes
                      </span>
                      <p className="text-sm font-extrabold text-[#606C38]">
                        Rp {item.offeredPrice.toLocaleString("id-ID")} / Kg
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-0.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        Estimasi Nilai Total
                      </span>
                      <p className="text-sm font-extrabold text-gray-900">
                        Rp{" "}
                        {(
                          (item.volumeKg || item.parentWtb?.targetWeight || 0) *
                          item.offeredPrice
                        ).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  {/* Message / Note from Kopdes */}
                  {item.note && (
                    <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 text-xs font-medium text-gray-600 flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-[#606C38] shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        <span className="font-bold text-gray-800">
                          Catatan Kopdes:{" "}
                        </span>
                        {item.note}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons: Accept / Reject / Counter Offer */}
                  {item.status === "PENDING" && (
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-gray-100">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isSubmitting}
                        onClick={() => handleReject(item.wtbId, item.id)}
                        className="h-9 border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl shadow-none flex items-center gap-1"
                      >
                        <X className="h-4 w-4" /> Tolak Penawaran
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isSubmitting}
                        onClick={() => {
                          setSelectedOffer(item);
                          setCounterPrice(item.offeredPrice.toString());
                        }}
                        className="h-9 border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold rounded-xl shadow-none flex items-center gap-1"
                      >
                        <Handshake className="h-4 w-4 text-[#606C38]" /> Ajukan
                        Counter Offer
                      </Button>

                      <Button
                        size="sm"
                        disabled={isSubmitting}
                        onClick={() => handleAccept(item.wtbId, item.id)}
                        className="h-9 bg-[#606C38] hover:bg-[#283618] text-white text-xs font-bold rounded-xl shadow-none flex items-center gap-1"
                      >
                        <Check className="h-4 w-4" /> Setujui Harga Penawaran
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Counter Offer Modal Dialog */}
      <Dialog
        open={!!selectedOffer}
        onOpenChange={() => setSelectedOffer(null)}
      >
        <DialogContent className="sm:max-w-md bg-white border border-gray-200 rounded-2xl shadow-none font-['Quicksand',sans-serif]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Form Counter Offer Harga
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-gray-500">
              Ajukan nominal penawaran kontra balik ke{" "}
              {selectedOffer?.kopdes?.name || "Kopdes"}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendCounterOffer} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700">
                Harga Kontra Per Kg (Rp) *
              </Label>
              <Input
                type="number"
                value={counterPrice}
                onChange={(e) => setCounterPrice(e.target.value)}
                className="h-11 rounded-xl text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700">
                Pesan Alasan / Syarat Negosiasi
              </Label>
              <Textarea
                placeholder="Jelaskan alasan penyesuaian harga..."
                value={counterNote}
                onChange={(e) => setCounterNote(e.target.value)}
                className="rounded-xl text-xs min-h-[70px]"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#606C38] hover:bg-[#283618] text-white text-xs font-bold h-11 rounded-xl shadow-none"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Kirim Counter Offer ke Kopdes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
