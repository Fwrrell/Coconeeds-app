import { DriveStep, Driver } from "driver.js";
import { getNavSelector } from "../tourController";

export interface ProduksiStepContext {
  getDriver: () => Driver | null;
  onOpenDialogAndProceed: (
    dialogKey: string,
    selectorAfterOpen: string,
  ) => void;
}

export const getProduksiSteps = (
  context?: ProduksiStepContext,
  onGoToPengiriman?: () => void,
): DriveStep[] => [
  {
    element: '[data-tour="statistik-produk"]',
    popover: {
      title: "Statistik Produk",
      description:
        "Di sini kamu dapat melihat ringkasan seluruh stok produk komoditas kelapa yang tersimpan di gudang kebunmu.",
    },
  },
  {
    element: '[data-tour="statistik-primer"]',
    popover: {
      title: "Produk Primer",
      description:
        "Produk Primer adalah komoditas mentah hasil panen langsung dari kebun seperti Kelapa Utuh, Kelapa Kupas, dan Kopra Putih.",
    },
  },
  {
    element: '[data-tour="statistik-olahan"]',
    popover: {
      title: "Produk Olahan",
      description:
        "Produk Olahan adalah produk bernilai tambah hasil pemrosesan mandiri seperti Minyak Kelapa, VCO (Virgin Coconut Oil), dan Briket Tempurung.",
    },
  },
  {
    element: '[data-tour="statistik-samping"]',
    popover: {
      title: "Produk Sampingan",
      description:
        "Produk Sampingan adalah bagian turunan bernilai ekonomi seperti Tempurung Kelapa, Sabut Kelapa, dan Air Kelapa.",
    },
  },
  {
    element: getNavSelector(
      '[data-tour="hasil-panen"]',
      '[data-tour="hasil-panen-mobile"]',
    ),
    popover: {
      title: "Catat Hasil Panen",
      description:
        "Gunakan tombol ini untuk mencatat hasil panen kelapa baru yang masuk ke inventori gudang.",
      nextBtnText: "Buka Form Catat Panen →",
      onNextClick: () => {
        context?.onOpenDialogAndProceed(
          "open-harvest-dialog",
          '[data-tour="form-kebun-asal"]',
        );
      },
    },
  },
  {
    element: '[data-tour="form-kebun-asal"]',
    popover: {
      title: "Nama Kebun Asal",
      description: "Pilih plot lahan kebun tempat buah kelapa ini dipanen.",
    },
  },
  {
    element: '[data-tour="form-kategori-produk"]',
    popover: {
      title: "Kategori Produk",
      description:
        "Tentukan kategori komoditas, apakah Produk Primer, Produk Olahan, atau Produk Sampingan.",
    },
  },
  {
    element: '[data-tour="form-jenis-produk"]',
    popover: {
      title: "Jenis Produk Kelapa",
      description:
        "Pilih jenis komoditas spesifik yang dipanen sesuai kategori yang dipilih.",
    },
  },
  {
    element: '[data-tour="form-jumlah-produk"]',
    popover: {
      title: "Jumlah Produk",
      description:
        "Masukkan kuantitas atau total berat hasil panen yang didapatkan.",
    },
  },
  {
    element: '[data-tour="form-simpan-panen"]',
    popover: {
      title: "Simpan Catatan Panen",
      description:
        "Tekan tombol ini untuk menyimpan hasil panen ke database stok gudang.",
      nextBtnText: "Tutup & Lanjut →",
      onNextClick: () => {
        context?.onOpenDialogAndProceed(
          "close-harvest-dialog",
          '[data-tour="kurangi-stok"]',
        );
      },
    },
  },
  {
    element: '[data-tour="kurangi-stok"]',
    popover: {
      title: "Kurangi Stok Gudang",
      description:
        "Tombol ini digunakan untuk mencatat pengeluaran stok, baik untuk diolah menjadi produk turunan, dikonsumsi pribadi, maupun susut.",
      nextBtnText: "Buka Form Kurangi Stok →",
      onNextClick: () => {
        context?.onOpenDialogAndProceed(
          "open-produk-dialog",
          '[data-tour="form-produk"]',
        );
      },
    },
  },
  {
    element: '[data-tour="form-produk"]',
    popover: {
      title: "Formulir Kurangi Stok",
      description:
        "Dialog ini menyediakan 3 opsi pengurangan stok: Diolah, Konsumsi, dan Rusak/Susut.",
    },
  },
  {
    element: '[data-tour="tab-diolah"]',
    popover: {
      title: "Tab Diolah",
      description:
        "Pilih tab ini jika kamu mengolah bahan baku primer menjadi produk bernilai tambah (misal kelapa menjadi kopra atau minyak).",
    },
  },
  {
    element: '[data-tour="tab-konsumsi"]',
    popover: {
      title: "Tab Konsumsi",
      description:
        "Pilih tab ini untuk mencatat penggunaan komoditas kelapa untuk konsumsi pribadi petani atau keluarga.",
    },
  },
  {
    element: '[data-tour="tab-susut"]',
    popover: {
      title: "Tab Rusak / Susut",
      description:
        "Pilih tab ini untuk mencatat komoditas yang rusak, busuk, atau susut selama masa penyimpanan di gudang.",
    },
  },
  {
    element: '[data-tour="bahan-baku"]',
    popover: {
      title: "Pilih Bahan Baku",
      description:
        "Pilih stok komoditas yang akan digunakan dan dikurangi sebagai bahan baku olahan.",
    },
  },
  {
    element: '[data-tour="jumlah-bahan"]',
    popover: {
      title: "Jumlah Bahan Dipakai",
      description:
        "Masukkan jumlah kuantitas bahan baku yang dikurangi untuk proses pengolahan.",
    },
  },
  {
    element: '[data-tour="hasil-olahan"]',
    popover: {
      title: "Pilih Hasil Olahan",
      description:
        "Pilih jenis produk jadi yang berhasil diproduksi dari bahan baku tersebut.",
    },
  },
  {
    element: '[data-tour="jumlah-hasil"]',
    popover: {
      title: "Jumlah Hasil Olahan",
      description:
        "Masukkan jumlah produk jadi yang dihasilkan dan akan otomatis ditambahkan ke stok olahan.",
    },
  },
  {
    element: '[data-tour="simpan-produk"]',
    popover: {
      title: "Simpan Transaksi",
      description:
        "Tekan tombol ini untuk memproses dan mencatat mutasi pengurangan serta penambahan stok.",
      nextBtnText: "Lanjut ke Buku Transaksi →",
      onNextClick: () => {
        context?.onOpenDialogAndProceed(
          "close-produk-dialog",
          '[data-tour="Buku-Transaksi"]',
        );
      },
    },
  },
  {
    element: '[data-tour="Buku-Transaksi"]',
    popover: {
      title: "Buku Transaksi Inventori",
      description:
        "Semua histori mutasi masuk dan keluar dari hasil panen serta pengolahan tercatat rapi di tabel ini.",
    },
  },
  {
    element: '[data-tour="AI-Advisor"]',
    popover: {
      title: "AI Business Advisor",
      description:
        "Dapatkan saran cerdas dan rekomendasi peluang pasar harian untuk memaksimalkan keuntungan hasil kebun kelapamu.",
    },
  },
  {
    element: getNavSelector(
      '[data-tour="menu-pengiriman"]',
      '[data-tour="menu-pengiriman-mobile"]',
    ),
    popover: {
      title: "Pengiriman",
      description:
        "Selanjutnya adalah halaman logistik dan pengiriman hasil panen. Kamu bisa mengklik menu Pengiriman pada sidebar atau menekan tombol Selanjutnya.",
      nextBtnText: "Ke Halaman Pengiriman →",
      onNextClick: () => {
        if (onGoToPengiriman) {
          onGoToPengiriman();
        }
      },
    },
  },
];
