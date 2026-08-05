import { DriveStep } from "driver.js";

export const getDashboardSteps = (onGoToLahan?: () => void): DriveStep[] => [
  {
    element: '[data-tour="Greeting"], [data-tour="greeting"]',
    popover: {
      title: "Selamat datang di Farmer Portal!",
      description:
        "Di sini kamu bisa mengelola dan mencatat berbagai hal seputar lahanmu, seperti hasil panen, pengiriman hingga pendapatan.",
    },
  },
  {
    element: '[data-tour="navbar"]',
    popover: {
      title: "Menu Navigasi",
      description:
        "Ini adalah menu navigasimu. Terdapat 5 menu utama yaitu Dashboard, Lahan Kebun, Produksi, Pengiriman, dan Eco-Point.",
    },
  },
  {
    element: '[data-tour="menu-dashboard"]',
    popover: {
      title: "Halaman Dashboard",
      description:
        "Ini adalah halaman utama dari portal petani, di sini kamu bisa melihat ringkasan penjualan, performa grafik, dan ringkasan lahan.",
    },
  },
  {
    element: '[data-tour="statistik singkat"]',
    popover: {
      title: "Statistik Singkat",
      description:
        "Data terbaru mengenai total luas lahan, pohon kelapa, hasil panen, dan total pendapatan yang kamu peroleh.",
    },
  },
  {
    element: '[data-tour="Profit"]',
    popover: {
      title: "Grafik Keuntungan",
      description:
        "Grafik pemasukan dan pengeluaran serta laba bersih dari hasil penjualan kelapamu 6 bulan terakhir.",
    },
  },
  {
    element: '[data-tour="Komposisi"]',
    popover: {
      title: "Komposisi Penjualan",
      description:
        "Rincian penjualan berdasarkan setiap komponen kelapa seperti kelapa utuh, kopra, dan jenis produk kelapa lainnya.",
    },
  },
  {
    element: '[data-tour="AI Agro"]',
    popover: {
      title: "AI Agronomic Insight",
      description:
        "Asisten pintar yang memberikan masukan dan prediksi hasil panen berikutnya berdasarkan data historismu.",
    },
  },
  {
    element: '[data-tour="menu-lahan"]',
    popover: {
      title: "Lahan Kebun",
      description:
        "Selanjutnya adalah halaman pengelolaan lahan. Kamu bisa mengklik menu Lahan Kebun pada sidebar atau menekan tombol Selanjutnya.",
      nextBtnText: "Ke Halaman Lahan →",
      onNextClick: () => {
        if (onGoToLahan) {
          onGoToLahan();
        }
      },
    },
  },
];
