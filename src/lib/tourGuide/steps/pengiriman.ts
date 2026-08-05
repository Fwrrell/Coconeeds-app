import { DriveStep, Driver } from "driver.js";
import { getNavSelector } from "../tourController";

export interface PengirimanStepContext {
  getDriver: () => Driver | null;
  onOpenDialogAndProceed: (
    dialogKey: string,
    selectorAfterOpen: string,
  ) => void;
}

export const getPengirimanSteps = (
  context?: PengirimanStepContext,
  onGoToEcoPoints?: () => void,
): DriveStep[] => [
  {
    element: '[data-tour="halaman-pengiriman"]',
    popover: {
      title: "Halaman Pengiriman & Logistik",
      description:
        "Halaman ini digunakan untuk mengelola dan memantau seluruh proses pengiriman hasil panen kelapa dari kebun Anda ke pos koperasi desa (Kopdes).",
    },
  },
  {
    element: '[data-tour="buat-pengiriman"]',
    popover: {
      title: "Buat Pengiriman Baru",
      description:
        "Klik tombol ini untuk menjadwalkan penyerahan kargo hasil panen ke pihak Kopdes.",
      nextBtnText: "Buka Form Pengiriman →",
      onNextClick: () => {
        context?.onOpenDialogAndProceed(
          "open-pengiriman-dialog",
          '[data-tour="form-pilih-barang"]',
        );
      },
    },
  },
  {
    element: '[data-tour="form-pilih-barang"]',
    popover: {
      title: "Pilih Barang dari Gudang",
      description:
        "Pilih jenis komoditas kelapa yang tersedia di gudang penyimpanan Anda untuk disetorkan.",
    },
  },
  {
    element: '[data-tour="form-jumlah-pengiriman"]',
    popover: {
      title: "Jumlah Pengiriman",
      description:
        "Masukkan kuantitas atau berat komoditas yang akan dikirim (dalam Kg atau Liter).",
    },
  },
  {
    element: '[data-tour="form-harga-dasar"]',
    popover: {
      title: "Harga Dasar ke Kopdes",
      description:
        "Tentukan harga dasar per satuan komoditas yang disepakati dengan pihak Kopdes.",
    },
  },
  {
    element: '[data-tour="form-estimasi-pendapatan"]',
    popover: {
      title: "Estimasi Pendapatan",
      description:
        "Sistem secara otomatis menghitung estimasi pendapatan kotor yang akan dicairkan setelah lolos QC Kopdes.",
    },
  },
  {
    element: '[data-tour="form-pos-kopdes"]',
    popover: {
      title: "Pos Kopdes Tujuan",
      description:
        "Pilih cabang atau pos penerimaan Kopdes yang menjadi destinasi pengiriman komoditas.",
    },
  },
  {
    element: '[data-tour="form-metode-pengiriman"]',
    popover: {
      title: "Metode Pengiriman",
      description:
        "Pilih apakah komoditas akan dijemput oleh armada Kopdes (Pick-up) atau diantar langsung secara mandiri (Self Delivery).",
    },
  },
  {
    element: '[data-tour="form-tanggal-pengiriman"]',
    popover: {
      title: "Tanggal Pengiriman",
      description:
        "Tentukan tanggal rencana penyerahan atau penjemputan kargo komoditas.",
    },
  },
  {
    element: '[data-tour="form-kirim-pengiriman"]',
    popover: {
      title: "Kirim Permintaan Pengiriman",
      description:
        "Tekan tombol ini untuk menyimpan dan menjadwalkan permohonan logistik penyerahan barang.",
      nextBtnText: "Lanjut ke Pengiriman Berjalan →",
      onNextClick: () => {
        context?.onOpenDialogAndProceed(
          "close-pengiriman-dialog",
          '[data-tour="pengiriman-berjalan"]',
        );
      },
    },
  },
  {
    element: '[data-tour="pengiriman-berjalan"]',
    popover: {
      title: "Pengiriman Berjalan",
      description:
        "Pantau tahapan pengiriman secara langsung, mulai dari penjemputan, pemeriksaan kualitas, hingga penerimaan akhir.",
    },
  },
  {
    element: '[data-tour="riwayat-pengiriman"]',
    popover: {
      title: "Riwayat Pengiriman",
      description:
        "Arsip lengkap pengiriman masa lalu yang telah berhasil diverifikasi QC dan dananya sudah dicairkan.",
    },
  },
  {
    element: getNavSelector(
      '[data-tour="menu-Ecopoint"]',
      '[data-tour="island-nav"]',
    ),
    popover: {
      title: "Eco-Points",
      description:
        "Selanjutnya adalah halaman program Eco-Points & ekonomi sirkular. Kamu bisa mengklik menu Eco-Points pada sidebar atau menekan tombol Selanjutnya.",
      nextBtnText: "Ke Halaman Eco-Points →",
      onNextClick: () => {
        if (onGoToEcoPoints) {
          onGoToEcoPoints();
        }
      },
    },
  },
];
