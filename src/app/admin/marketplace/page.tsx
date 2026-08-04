"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Handshake,
  MessageSquare,
  MapPin,
  Target,
  DollarSign,
  Tag,
  Building,
  Briefcase,
  Ban,
  Store,
  Send,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useAdminStore } from "@/hooks/useAdminStore";
import { KopdesSelector } from "@/components/kopdes-selector";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
// type inline biar ga error browser
type WtbStatus = any;
type Role = any;
import { formatDistanceToNow } from 'date-fns';
import { id as a } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from "framer-motion";

// --- TIPE DATA ---
type Negotiation = {
  id: string;
  senderRole: Role;
  offeredPrice: number;
  note: string | null;
  createdAt: string;
};

type WtbListing = {
  id: string;
  komoditas: string;
  targetWeight: number;
  maxPrice: number;
  destination: string;
  status: WtbStatus;
  dealPrice?: number | null;
  perusahaan: { name: string; image?: string | null };
  _count: { negosiasi: number };
};

// Helper untuk format tanggal
const formatTimestamp = (dateString: string) => {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: a });
  } catch (error) {
    return dateString;
  }
};

export default function MarketplaceB2BPage() {
  const { activeKopdesId } = useAdminStore();

  const [isLoading, setIsLoading] = useState(true);
  const [openListings, setOpenListings] = useState<WtbListing[]>([]);
  const [dealListings, setDealListings] = useState<WtbListing[]>([]);

  const [isNegotiationOpen, setIsNegotiationOpen] = useState(false);
  const [isLoadingNegos, setIsLoadingNegos] = useState(false);
  const [selectedWtb, setSelectedWtb] = useState<WtbListing | null>(null);
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [dealPriceInput, setDealPriceInput] = useState<number | ''>('');
  const [dealPriceError, setDealPriceError] = useState<string | null>(null);

  const fetchWtbListings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/wtb');
      if (!res.ok) throw new Error("Gagal memuat data marketplace.");
      const { data } = await res.json();

      const open = data.filter((l: WtbListing) => l.status === 'OPEN');
      const deals = data.filter((l: WtbListing) => l.status === 'DEAL' || l.status === 'CANCELLED');

      setOpenListings(open);
      setDealListings(deals);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan tidak diketahui.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWtbListings();
  }, [activeKopdesId]);

  const handleOpenNegotiation = async (listing: WtbListing) => {
    setSelectedWtb(listing);
    setDealPriceInput(listing.dealPrice || '');
    setDealPriceError(null);
    setIsNegotiationOpen(true);
    setIsLoadingNegos(true);
    try {
      const res = await fetch(`/api/wtb/${listing.id}/negosiasi`);
      if (!res.ok) throw new Error("Gagal memuat riwayat negosiasi.");
      const { data } = await res.json();
      setNegotiations(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan.");
    } finally {
      setIsLoadingNegos(false);
    }
  };

  const handleSendOffer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedWtb) return;

    const formData = new FormData(event.currentTarget);
    const offeredPrice = formData.get("offeredPrice");
    const note = formData.get("note");

    try {
      const res = await fetch(`/api/wtb/${selectedWtb.id}/negosiasi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offeredPrice: Number(offeredPrice),
          note: note,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal mengirim penawaran.");
      }
      toast.success(`Penawaran sebesar Rp ${Number(offeredPrice).toLocaleString()},- telah terkirim.`);
      setIsNegotiationOpen(false);
      fetchWtbListings();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan.");
    }
  };

  const handleMarkAsDeal = async () => {
    if (!selectedWtb) return;

    const price = Number(dealPriceInput);
    if (isNaN(price) || price <= 0) {
      setDealPriceError("Harga deal harus angka positif.");
      return;
    }
    setDealPriceError(null);

    try {
      const res = await fetch(`/api/wtb/${selectedWtb.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'DEAL',
          dealPrice: price,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal menandai WTB sebagai DEAL.");
      }

      toast.success(`WTB untuk ${selectedWtb.komoditas} berhasil ditandai DEAL.`);
      setIsNegotiationOpen(false);
      fetchWtbListings();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat menandai DEAL.");
    }
  };

  const handleCancelWtb = async () => {
    if (!selectedWtb) return;

    try {
      const res = await fetch(`/api/wtb/${selectedWtb.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'CANCELLED',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal membatalkan WTB.");
      }

      toast.success(`WTB untuk ${selectedWtb.komoditas} berhasil dibatalkan.`);
      setIsNegotiationOpen(false);
      fetchWtbListings();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat membatalkan WTB.");
    }
  };

  // Fallback UI
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-6 md:p-8 space-y-6 bg-[#FFFFFF] min-h-screen font-['Quicksand',sans-serif]"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-[#606C38]/10 text-[#606C38]">
              <Store className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Marketplace B2B
            </h1>
          </div>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Temukan permintaan pembelian komoditas (WTB) dari mitra off-taker & ajukan penawaran kargo.
          </p>
        </div>
        <KopdesSelector />
      </div>

      <Tabs defaultValue="open-requests" className="space-y-6">
        <TabsList className="bg-gray-100/80 p-1 border border-gray-200 rounded-md">
          <TabsTrigger
            value="open-requests"
            className="data-[state=active]:bg-white data-[state=active]:text-[#606C38] data-[state=active]:shadow-none font-bold text-xs px-4 py-2 rounded-sm transition-all"
          >
            Permintaan Terbuka ({openListings.length})
          </TabsTrigger>
          <TabsTrigger
            value="negotiations-deals"
            className="data-[state=active]:bg-white data-[state=active]:text-[#606C38] data-[state=active]:shadow-none font-bold text-xs px-4 py-2 rounded-sm transition-all"
          >
            Negosiasi & Deal ({dealListings.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: PERMINTAAN TERBUKA */}
        <TabsContent value="open-requests" className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-white border border-gray-200 rounded-md shadow-none p-4 space-y-4">
                  <CardHeader className="p-0">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </CardHeader>
                  <CardContent className="p-0 space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                  <CardFooter className="p-0">
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : openListings.length === 0 ? (
            <div className="p-8 border border-gray-200 rounded-md text-center bg-gray-50/40">
              <Store className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm font-semibold text-gray-600">
                Saat ini belum ada permintaan WTB (Want to Buy) terbuka dari off-taker.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {openListings.map((listing) => (
                <Card
                  key={listing.id}
                  className="bg-white border border-gray-200 rounded-md shadow-none flex flex-col justify-between hover:border-[#606C38]/40 transition-colors overflow-hidden"
                >
                  <div>
                    <CardHeader className="border-b border-gray-100 bg-[#FEFAE0]/20 p-4 pb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-gray-200">
                          <AvatarImage
                            src={listing.perusahaan.image || ''}
                            alt={listing.perusahaan.name}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-[#606C38]/10 text-[#606C38] font-bold text-xs">
                            {listing.perusahaan.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-bold text-gray-900 truncate">
                            {listing.perusahaan.name}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className="border-[#606C38]/30 bg-[#606C38]/10 text-[#606C38] font-bold text-[10px] uppercase mt-0.5"
                          >
                            {listing.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500 font-medium flex items-center gap-1.5">
                          <Tag className="h-3.5 w-3.5 text-[#606C38]" /> Komoditas
                        </span>
                        <span className="font-bold text-gray-900">{listing.komoditas}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500 font-medium flex items-center gap-1.5">
                          <Target className="h-3.5 w-3.5 text-[#606C38]" /> Target Kuantitas
                        </span>
                        <span className="font-bold text-gray-800">{listing.targetWeight.toLocaleString()} kg</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500 font-medium flex items-center gap-1.5">
                          <DollarSign className="h-3.5 w-3.5 text-[#606C38]" /> Budget Maksimum
                        </span>
                        <span className="font-bold text-[#606C38]">
                          Rp {listing.maxPrice.toLocaleString()}/kg
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-[#606C38]" /> Tujuan
                        </span>
                        <span className="font-semibold text-gray-700 truncate max-w-[150px]">{listing.destination}</span>
                      </div>
                    </CardContent>
                  </div>
                  <CardFooter className="p-4 pt-0">
                    <Button
                      onClick={() => handleOpenNegotiation(listing)}
                      className="w-full bg-[#606C38] hover:bg-[#283618] text-white font-semibold shadow-none rounded-md text-xs py-2"
                    >
                      <Handshake className="mr-1.5 h-3.5 w-3.5" /> Lihat & Tawar ({listing._count.negosiasi})
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 2: NEGOSIASI & DEAL */}
        <TabsContent value="negotiations-deals">
          <Card className="bg-white border border-gray-200 rounded-md shadow-none overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-[#FEFAE0]/30 py-3.5 px-5">
              <CardTitle className="text-base font-bold text-gray-900">
                Riwayat Negosiasi & Permintaan Deal
              </CardTitle>
              <CardDescription className="text-xs font-medium text-gray-500">
                Daftar transaksi B2B yang sedang dalam proses tawar-menawar atau telah mencapai kesepakatan final.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center text-sm font-medium text-gray-400">
                  Memuat data transaksi...
                </div>
              ) : dealListings.length === 0 ? (
                <div className="p-8 text-center text-sm font-medium text-gray-400">
                  Belum ada riwayat negosiasi atau deal.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-[#FEFAE0]/40 border-b border-gray-200">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">Perusahaan Offtaker</TableHead>
                        <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">Komoditas</TableHead>
                        <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">Status</TableHead>
                        <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">Harga Deal</TableHead>
                        <TableHead className="text-gray-700 font-bold text-xs uppercase tracking-wider">Total Penawaran</TableHead>
                        <TableHead className="text-right text-gray-700 font-bold text-xs uppercase tracking-wider">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dealListings.map((listing) => (
                        <TableRow
                          key={listing.id}
                          className="border-b border-gray-100 odd:bg-white even:bg-[#FEFAE0]/10 hover:bg-gray-50/80 transition-colors"
                        >
                          <TableCell className="font-bold text-gray-900 text-sm">
                            {listing.perusahaan.name}
                          </TableCell>
                          <TableCell className="text-sm font-medium text-gray-700">
                            {listing.komoditas}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                listing.status === 'DEAL'
                                  ? "bg-[#606C38]/10 border-[#606C38]/30 text-[#606C38] font-bold text-xs"
                                  : "bg-red-50 border-red-200 text-red-600 font-bold text-xs"
                              }
                            >
                              {listing.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-bold text-[#606C38] text-sm">
                            {listing.dealPrice ? `Rp ${listing.dealPrice.toLocaleString()}/kg` : '-'}
                          </TableCell>
                          <TableCell className="text-sm font-semibold text-gray-800">
                            {listing._count.negosiasi} Penawaran
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenNegotiation(listing)}
                              className="border-gray-300 text-gray-700 font-semibold text-xs rounded-md shadow-none hover:bg-gray-50"
                            >
                              Lihat Detail
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DIALOG NEGOSIASI */}
      {selectedWtb && (
        <Dialog open={isNegotiationOpen} onOpenChange={setIsNegotiationOpen}>
          <DialogContent className="sm:max-w-[700px] bg-white border border-gray-200 rounded-md shadow-none font-['Quicksand',sans-serif]">
            <DialogHeader className="border-b border-gray-100 pb-3">
              <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Handshake className="h-5 w-5 text-[#606C38]" />
                Negosiasi: {selectedWtb.komoditas}
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-gray-500 mt-1">
                Mengajukan penawaran untuk permintaan dari <span className="font-bold text-gray-800">{selectedWtb.perusahaan.name}</span>.
                Budget Max: <span className="font-bold text-[#606C38]">Rp {selectedWtb.maxPrice.toLocaleString()}/kg</span>
                {selectedWtb.status === 'DEAL' && selectedWtb.dealPrice && (
                  <span className="ml-2 text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded border border-green-200">
                    Harga Deal: Rp {selectedWtb.dealPrice.toLocaleString()}/kg
                  </span>
                )}
                {selectedWtb.status === 'CANCELLED' && (
                  <span className="ml-2 text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    Dibatalkan
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="grid md:grid-cols-2 gap-6 py-3">
              {/* History Panel */}
              <div className="flex flex-col space-y-2">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Riwayat Penawaran
                </h4>
                <ScrollArea className="h-64 w-full rounded-md border border-gray-200 p-3 bg-gray-50/30">
                  {isLoadingNegos ? (
                    <p className="text-xs font-medium text-gray-400 py-4 text-center">Memuat riwayat...</p>
                  ) : negotiations.length === 0 ? (
                    <p className="text-xs font-medium text-gray-400 py-4 text-center">Belum ada riwayat penawaran.</p>
                  ) : (
                    negotiations.map((neg) => (
                      <div
                        key={neg.id}
                        className={`flex flex-col mb-3 ${
                          neg.senderRole === 'ADMIN' ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div
                          className={`p-2.5 rounded-md max-w-xs ${
                            neg.senderRole === 'ADMIN'
                              ? 'bg-[#606C38] text-white'
                              : 'bg-white border border-gray-200 text-gray-800'
                          }`}
                        >
                          <p className="text-xs font-bold">
                            Rp {neg.offeredPrice.toLocaleString()},-
                          </p>
                          {neg.note && (
                            <p className="text-[11px] mt-1 opacity-90 leading-tight">
                              {neg.note}
                            </p>
                          )}
                        </div>
                        <p className="text-[10px] font-medium text-gray-400 mt-1">
                          {neg.senderRole === 'ADMIN' ? 'Admin Kopdes' : 'Off-taker'} • {formatTimestamp(neg.createdAt)}
                        </p>
                      </div>
                    ))
                  )}
                </ScrollArea>
              </div>

              {/* Form Action Panel */}
              <div className="flex flex-col space-y-4">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Form Penawaran Baru
                </h4>

                {selectedWtb.status === 'OPEN' ? (
                  <form id="offer-form" onSubmit={handleSendOffer} className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="offeredPrice" className="text-xs font-bold text-gray-700">
                        Harga Penawaran (/kg)
                      </Label>
                      <Input
                        id="offeredPrice"
                        name="offeredPrice"
                        type="number"
                        placeholder="Contoh: 12250"
                        required
                        className="border-gray-300 focus:border-[#606C38] focus:ring-[#606C38] rounded-md text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="note" className="text-xs font-bold text-gray-700">
                        Catatan Tambahan (Opsional)
                      </Label>
                      <Textarea
                        id="note"
                        name="note"
                        placeholder="Kualitas grade, ketersediaan pengiriman, dll."
                        rows={2}
                        className="border-gray-300 focus:border-[#606C38] focus:ring-[#606C38] rounded-md text-xs resize-none"
                      />
                    </div>
                  </form>
                ) : (
                  <div className="p-3 border border-gray-200 rounded-md bg-gray-50 text-xs font-medium text-gray-500">
                    Sesi penawaran ini telah ditutup dengan status{" "}
                    <Badge variant="outline" className="ml-1 font-bold text-gray-700">
                      {selectedWtb.status}
                    </Badge>
                  </div>
                )}

                {selectedWtb.status === 'OPEN' && (
                  <div className="space-y-2 border-t border-gray-200 pt-3">
                    <h5 className="text-xs font-bold text-gray-700">Tandai Deal Final</h5>
                    <div className="space-y-1">
                      <Label htmlFor="finalDealPrice" className="text-[11px] font-semibold text-gray-600">
                        Harga Sepakat (/kg)
                      </Label>
                      <Input
                        id="finalDealPrice"
                        type="number"
                        placeholder="Masukkan harga sepakat final"
                        value={dealPriceInput}
                        onChange={(e) => setDealPriceInput(Number(e.target.value) || '')}
                        className="border-gray-300 focus:border-[#606C38] focus:ring-[#606C38] rounded-md text-xs"
                      />
                      {dealPriceError && (
                        <p className="text-[11px] text-red-500 font-medium mt-0.5">
                          {dealPriceError}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="border-t border-gray-100 pt-3 flex-col sm:flex-row gap-2">
              {selectedWtb.status === 'OPEN' && (
                <>
                  <Button
                    type="submit"
                    form="offer-form"
                    className="bg-[#606C38] hover:bg-[#283618] text-white font-semibold rounded-md text-xs shadow-none px-3 py-2"
                  >
                    <Send className="mr-1.5 h-3.5 w-3.5" /> Kirim Penawaran
                  </Button>
                  <Button
                    type="button"
                    onClick={handleMarkAsDeal}
                    className="bg-[#DDA15E]/20 hover:bg-[#DDA15E]/30 text-[#BC6C25] font-semibold rounded-md text-xs shadow-none px-3 py-2 border border-[#DDA15E]/40"
                  >
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Tandai Deal
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCancelWtb}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 font-semibold rounded-md text-xs shadow-none px-3 py-2"
                  >
                    <XCircle className="mr-1.5 h-3.5 w-3.5" /> Batalkan WTB
                  </Button>
                </>
              )}
              {selectedWtb.status === 'DEAL' && (
                <Button type="button" disabled className="bg-gray-100 text-gray-500 font-semibold text-xs rounded-md shadow-none">
                  Sudah Deal: Rp {selectedWtb.dealPrice?.toLocaleString()}/kg
                </Button>
              )}
              {selectedWtb.status === 'CANCELLED' && (
                <Button type="button" disabled className="bg-gray-100 text-gray-500 font-semibold text-xs rounded-md shadow-none">
                  Status: Dibatalkan
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
}
