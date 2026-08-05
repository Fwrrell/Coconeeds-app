import { DriveStep, Driver } from "driver.js";

export interface EcoPointStepContext {
  getDriver?: () => Driver | null;
  onOpenDialogAndProceed?: (
    dialogKey: string,
    selectorAfterOpen: string,
  ) => void;
}

export const getEcoSteps = (
  context?: EcoPointStepContext,
  onGoToDashboard?: () => void,
): DriveStep[] => [
  {
    element: '[data-tour="halaman-Eco"]',
    popover: {
      title: "Halaman EcoPoint",
      description:
        "EcoPoint adalah sistem penghargaan yang memberikan poin dari setiap limbah kelapa yang kamu setor ke koperasi desa. Poin tersebut dapat ditukarkan dengan berbagai hadiah menarik sekaligus mendukung ekonomi sirkular.",
    },
  },
  {
    element: '[data-tour="statistik-Eco"]',
    popover: {
      title: "Statistik EcoPoint",
      description:
        "Pada bagian ini kamu dapat melihat seluruh ringkasan pencapaian EcoPoint yang telah berhasil dikumpulkan.",
    },
  },
  {
    element: '[data-tour="statistik-poin"]',
    popover: {
      title: "Total EcoPoint",
      description:
        "Menampilkan jumlah EcoPoint yang telah kamu kumpulkan beserta level keanggotaan dan progres menuju level berikutnya.",
    },
  },
  {
    element: '[data-tour="statistik-emisi"]',
    popover: {
      title: "Pengurangan Emisi",
      description:
        "Menunjukkan estimasi total emisi karbon yang berhasil ditekan dari aktivitas daur ulang limbah kelapa yang telah kamu lakukan.",
    },
  },
  {
    element: '[data-tour="statistik-setor"]',
    popover: {
      title: "Total Limbah Disetor",
      description:
        "Menampilkan total berat limbah kelapa yang telah berhasil kamu setor ke koperasi desa.",
    },
  },
  {
    element: '[data-tour="statistik-peringkat"]',
    popover: {
      title: "Peringkat EcoPoint",
      description:
        "Menampilkan posisi peringkatmu dibandingkan petani lain berdasarkan jumlah EcoPoint yang dimiliki.",
    },
  },
  {
    element: '[data-tour="setor-limbah"]',
    popover: {
      title: "Setor Limbah Kelapa",
      description:
        "Gunakan tombol ini untuk menyetor limbah kelapa ke koperasi desa dan memperoleh EcoPoint.",
    },
  },
  {
    element: '[data-tour="katalog-hadiah"]',
    popover: {
      title: "Katalog Hadiah",
      description:
        "Pada bagian ini tersedia berbagai hadiah yang dapat ditukar menggunakan EcoPoint, mulai dari pupuk, sembako, voucher hingga alat pertanian.",
    },
  },
  {
    element: '[data-tour="misi-eco"]',
    popover: {
      title: "Misi Berkelanjutan",
      description:
        "Selesaikan berbagai misi harian maupun bulanan untuk memperoleh EcoPoint tambahan tanpa harus menyetor limbah.",
    },
  },
  {
    element: '[data-tour="riwayat-transaksi"]',
    popover: {
      title: "Riwayat EcoPoint",
      description:
        "Seluruh riwayat perolehan maupun penukaran EcoPoint akan tercatat pada bagian ini.",
    },
  },
  {
    element: '[data-tour="menu-dashboard"]',
    popover: {
      title: "Selesai Onboarding",
      description:
        "Selamat! Kamu telah menyelesaikan seluruh rangkaian tour panduan aplikasi Coconeeds Farmer Portal. Klik tombol di bawah atau menu Dashboard untuk kembali ke beranda.",
      nextBtnText: "Ke Dashboard →",
      onNextClick: () => {
        if (onGoToDashboard) {
          onGoToDashboard();
        }
      },
    },
  },
];
