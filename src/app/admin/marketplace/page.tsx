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
import { Handshake, MessageSquare, MapPin, Target, DollarSign, Tag, Building, Briefcase, Ban } from "lucide-react";
import { useAdminStore } from "@/hooks/useAdminStore";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { WtbStatus, Role } from "@prisma/client";
import { formatDistanceToNow } from 'date-fns';
import { id as a } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Tambahkan import Table components

// --- TIPE DATA ---
type Negotiation = {
  id: string;
  senderRole: Role;
  offeredPrice: number;
  note: string | null;
  createdAt: string; // ISO date string
};

type WtbListing = {
  id: string;
  komoditas: string;
  targetWeight: number;
  maxPrice: number;
  destination: string;
  status: WtbStatus;
  dealPrice?: number | null; // Tambahkan dealPrice ke type WtbListing
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
}

export default function MarketplaceB2BPage() {
  const { activeKopdesId } = useAdminStore();

  const [isLoading, setIsLoading] = useState(true);
  const [openListings, setOpenListings] = useState<WtbListing[]>([]);
  const [dealListings, setDealListings] = useState<WtbListing[]>([]);

  const [isNegotiationOpen, setIsNegotiationOpen] = useState(false);
  const [isLoadingNegos, setIsLoadingNegos] = useState(false);
  const [selectedWtb, setSelectedWtb] = useState<WtbListing | null>(null);
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [dealPriceInput, setDealPriceInput] = useState<number | ''>(''); // Untuk input dealPrice saat menandai deal
  const [dealPriceError, setDealPriceError] = useState<string | null>(null);

  const fetchWtbListings = async () => {
    if (!activeKopdesId) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/wtb');
      if (!res.ok) throw new Error("Gagal memuat data marketplace.");
      const { data } = await res.json();

      const open = data.filter((l: WtbListing) => l.status === 'OPEN');
      const deals = data.filter((l: WtbListing) => l.status === 'DEAL' || l.status === 'CANCELLED'); // Filter untuk dealListings juga menyertakan CANCELLED

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
    // Reset dealPriceInput dan error setiap kali dialog dibuka
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
          fetchWtbListings(); // Refresh data listings setelah penawaran
      } catch (error) {
          toast.error(error instanceof Error ? error.message : "Terjadi kesalahan.");
      }
  }

  const handleMarkAsDeal = async () => {
    if (!selectedWtb) return;

    // Validasi dealPriceInput
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
      fetchWtbListings(); // Refresh data listings
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
      fetchWtbListings(); // Refresh data listings
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat membatalkan WTB.");
    }
  };


  // Fallback UI
  if (!activeKopdesId) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <Handshake className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">Pilih Kopdes Terlebih Dahulu</h2>
          <p className="mt-2 text-muted-foreground">
            Silakan pilih Kopdes dari header untuk melihat marketplace.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 md:px-6 py-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Marketplace B2B</h1>
        <p className="text-muted-foreground">Temukan permintaan pembelian (WTB) dari perusahaan mitra dan ajukan penawaran kargo Anda.</p>
      </div>
      <Separator />

      <Tabs defaultValue="open-requests">
        <TabsList>
          <TabsTrigger value="open-requests">Permintaan Terbuka ({openListings.length})</TabsTrigger>
          <TabsTrigger value="negotiations-deals">Negosiasi & Deal ({dealListings.length})</TabsTrigger>
        </TabsList>

        {/* TAB 1: PERMINTAAN TERBUKA */}
        <TabsContent value="open-requests">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}><CardHeader><Skeleton className="h-8 w-3/4"/><Skeleton className="h-4 w-1/4"/></CardHeader><CardContent className="space-y-4"><Skeleton className="h-4 w-full"/><Skeleton className="h-4 w-full"/><Skeleton className="h-4 w-full"/></CardContent><CardFooter><Skeleton className="h-10 w-full"/></CardFooter></Card>
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {openListings.map(listing => (
                <Card key={listing.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Avatar>
                          <AvatarImage src={listing.perusahaan.image || ''} alt={listing.perusahaan.name} className="object-cover"/>
                          <AvatarFallback>{listing.perusahaan.name.substring(0,2)}</AvatarFallback>
                      </Avatar>
                      <div>
                          <CardTitle className="text-base">{listing.perusahaan.name}</CardTitle>
                          <Badge variant="outline">{listing.status}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-3">
                      <div className="flex items-center gap-2 text-sm"><Tag className="h-4 w-4 text-muted-foreground"/> <strong>Komoditas:</strong> <span className="ml-auto">{listing.komoditas}</span></div>
                      <div className="flex items-center gap-2 text-sm"><Target className="h-4 w-4 text-muted-foreground"/> <strong>Target:</strong> <span className="ml-auto">{listing.targetWeight.toLocaleString()} kg</span></div>
                      <div className="flex items-center gap-2 text-sm"><DollarSign className="h-4 w-4 text-muted-foreground"/> <strong>Budget Max:</strong> <span className="ml-auto font-semibold text-green-600">Rp {listing.maxPrice.toLocaleString()}/kg</span></div>
                      <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground"/> <strong>Tujuan:</strong> <span className="ml-auto">{listing.destination}</span></div>
                      {listing.status === 'DEAL' && listing.dealPrice && (
                          <div className="flex items-center gap-2 text-sm text-green-700 font-bold"><Handshake className="h-4 w-4"/> <strong>Harga Deal:</strong> <span className="ml-auto">Rp {listing.dealPrice.toLocaleString()}/kg</span></div>
                      )}
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => handleOpenNegotiation(listing)}>
                      <Handshake className="mr-2 h-4 w-4" /> Lihat & Tawar ({listing._count.negosiasi})
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 2: NEGOSIASI & DEAL */}
        <TabsContent value="negotiations-deals">
            <Card>
                <CardHeader><CardTitle>Dalam Negosiasi atau Sudah Deal</CardTitle></CardHeader>
                <CardContent>
                     {isLoading ? <p>Memuat...</p> :
                        <Table>
                            <TableHeader><TableRow><TableHead>Perusahaan</TableHead><TableHead>Komoditas</TableHead><TableHead>Status</TableHead><TableHead>Harga Deal</TableHead><TableHead>Jumlah Negosiasi</TableHead><TableHead>Aksi</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {dealListings.map(listing => (
                                    <TableRow key={listing.id}>
                                        <TableCell>{listing.perusahaan.name}</TableCell>
                                        <TableCell>{listing.komoditas}</TableCell>
                                        <TableCell><Badge variant="outline">{listing.status}</Badge></TableCell>
                                        <TableCell className="font-semibold text-green-600">
                                            {listing.dealPrice ? `Rp ${listing.dealPrice.toLocaleString()}/kg` : '-'}
                                        </TableCell>
                                        <TableCell>{listing._count.negosiasi}</TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm" onClick={() => handleOpenNegotiation(listing)}>
                                                Lihat
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                     }
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>

      {/* DIALOG NEGOSIASI */}
      {selectedWtb && (
        <Dialog open={isNegotiationOpen} onOpenChange={setIsNegotiationOpen}>
            <DialogContent className="sm:max-w-[700px]"> {/* Lebarkan sedikit dialog */}
                <DialogHeader>
                    <DialogTitle>Negosiasi: {selectedWtb.komoditas}</DialogTitle>
                    <DialogDescription>
                        Mengajukan penawaran untuk permintaan dari <span className="font-semibold">{selectedWtb.perusahaan.name}</span>.
                        Budget Perusahaan: <span className="font-semibold">Rp {selectedWtb.maxPrice.toLocaleString()}/kg</span>
                        {selectedWtb.status === 'DEAL' && selectedWtb.dealPrice && (
                            <span className="ml-2 text-green-700 font-bold">Harga Deal: Rp {selectedWtb.dealPrice.toLocaleString()}/kg</span>
                        )}
                        {selectedWtb.status === 'CANCELLED' && (
                            <span className="ml-2 text-red-700 font-bold">Status: Dibatalkan</span>
                        )}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-6 py-4">
                    <div className="flex flex-col space-y-4">
                        <h4 className="font-semibold">Riwayat Penawaran</h4>
                        <ScrollArea className="h-60 w-full rounded-md border p-4"> {/* Tinggikan scroll area */}
                           {isLoadingNegos ? <p>Memuat riwayat...</p> :
                            negotiations.length === 0 ? <p className="text-muted-foreground">Belum ada riwayat negosiasi.</p> :
                            negotiations.map(neg => (
                               <div key={neg.id} className={`flex flex-col mb-4 ${neg.senderRole === 'ADMIN' ? 'items-end' : 'items-start'}`}>
                                   <div className={`p-3 rounded-lg max-w-xs ${neg.senderRole === 'ADMIN' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                        <p className="text-sm font-bold">Rp {neg.offeredPrice.toLocaleString()},-</p>
                                        {neg.note && <p className="text-xs mt-1">{neg.note}</p>}
                                   </div>
                                   <p className="text-xs text-muted-foreground mt-1">{neg.senderRole.charAt(0).toUpperCase() + neg.senderRole.slice(1).toLowerCase()} • {formatTimestamp(neg.createdAt)}</p>
                               </div>
                           ))}
                        </ScrollArea>
                    </div>
                    <div className="flex flex-col space-y-4">
                        <h4 className="font-semibold">Ajukan Penawaran Baru</h4>
                        {selectedWtb.status === 'OPEN' ? (
                            <form id="offer-form" onSubmit={handleSendOffer} className="space-y-4">
                                <div>
                                    <Label htmlFor="offeredPrice">Harga Penawaran (/kg)</Label>
                                    <Input id="offeredPrice" name="offeredPrice" type="number" placeholder="Contoh: 12250" required />
                                </div>
                                <div>
                                    <Label htmlFor="note">Catatan (Opsional)</Label>
                                    <Textarea id="note" name="note" placeholder="Sebutkan kualitas, kuantitas, atau detail lain..." />
                                </div>
                            </form>
                        ) : (
                            <p className="text-muted-foreground">Negosiasi ditutup. Status: <Badge>{selectedWtb.status}</Badge></p>
                        )}

                        {selectedWtb.status === 'OPEN' && (
                            <div className="space-y-4 border-t pt-4 mt-4">
                                <h4 className="font-semibold">Tandai sebagai Deal</h4>
                                <p className="text-muted-foreground text-sm">Jika negosiasi telah disepakati di luar sistem, Anda dapat menandai permintaan ini sebagai DEAL dan memasukkan harga final yang disepakati.</p>
                                <div>
                                    <Label htmlFor="finalDealPrice">Harga Deal Final (/kg)</Label>
                                    <Input
                                        id="finalDealPrice"
                                        type="number"
                                        placeholder="Masukkan harga deal final"
                                        value={dealPriceInput}
                                        onChange={(e) => setDealPriceInput(Number(e.target.value) || '')}
                                        required
                                    />
                                    {dealPriceError && <p className="text-red-500 text-sm mt-1">{dealPriceError}</p>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    {selectedWtb.status === 'OPEN' && (
                        <>
                            <Button type="submit" form="offer-form">
                                <MessageSquare className="mr-2 h-4 w-4" /> Kirim Penawaran
                            </Button>
                            <Button type="button" onClick={handleMarkAsDeal} variant="secondary">
                                <Handshake className="mr-2 h-4 w-4" /> Tandai Deal
                            </Button>
                            <Button type="button" onClick={handleCancelWtb} variant="destructive">
                                <Ban className="mr-2 h-4 w-4" /> Batalkan WTB
                            </Button>
                        </>
                    )}
                    {selectedWtb.status === 'DEAL' && (
                        <Button type="button" disabled>
                           Sudah Deal: Rp {selectedWtb.dealPrice?.toLocaleString()}/kg
                        </Button>
                    )}
                    {selectedWtb.status === 'CANCELLED' && (
                        <Button type="button" disabled>
                           Dibatalkan
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
