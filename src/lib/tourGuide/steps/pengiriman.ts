import { DriveStep, Driver } from "driver.js";

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
    element: '[data-tour="statistik-pengiriman"]',
    popover: {
      title: "Statistik Pengiriman",
      description:
        "Ringkasan performa logistik dan status pengiriman hasil panen komoditas kelapa Anda.",
    },
  },
  {
    element: '[data-tour="pengiriman-aktif"]',
    popover: {
      title: "Pengiriman Aktif",
      description:
        "Menampilkan jumlah total pesanan pengiriman kargo yang sedang berlangsung dan diproses.",
    },
  },
  {
    element: '[data-tour="estimasi-pencairan"]',
    popover: {
      title: "Estimasi Pencairan",
      description:
        "Perkiraan total dana hasil penjualan komoditas yang akan cair ke saldo setelah kargo lolos uji kualitas (QC) Kopdes.",
    },
  },
  {
    element: '[data-tour="jadwal-pickup"]',
    popover: {
      title: "Jadwal Pick-up",
      description:
        "Informasi tanggal penjemputan armada logistik Kopdes yang paling dekat untuk mengambil kargo di kebun Anda.",
    },
  },
  {
    element: '[data-tour="buat-pengiriman"]',
    popover: {
      title: "Buat Pengiriman",
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
        "Pantau tahapan progress pengiriman secara real-time, mulai dari penjemputan, pemeriksaan QC, hingga penerimaan akhir.",
    },
  },
  {
    element: '[data-tour="jadwal-penjemputan"]',
    popover: {
      title: "Jadwal Penjemputan Kopdes",
      description:
        "Daftar jadwal terkonfirmasi kedatangan armada truk Kopdes ke kebun Anda.",
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
    element: '[data-tour="ai-logistik"]',
    popover: {
      title: "AI Logistik Insight",
      description:
        "Rekomendasi cerdas dari AI untuk mengoptimalkan rute logistik, jadwal setor, dan menghemat biaya pengiriman kargo.",
      nextBtnText: "Lanjut ke Eco-Points →",
      onNextClick: () => {
        if (onGoToEcoPoints) {
          onGoToEcoPoints();
        }
      },
    },
  },
];
