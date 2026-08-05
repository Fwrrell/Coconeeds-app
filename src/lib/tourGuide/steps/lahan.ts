import { DriveStep, Driver } from "driver.js";

export interface LahanStepContext {
  getDriver: () => Driver | null;
  onOpenDialogAndProceed: (
    dialogKey: string,
    selectorAfterOpen: string,
  ) => void;
}

export const getLahanSteps = (
  context?: LahanStepContext,
  onGoToProduksi?: () => void,
): DriveStep[] => [
  {
    element: '[data-tour="statistik lahan"]',
    popover: {
      title: "Statistik Lahan",
      description:
        "Data lengkap seputar lahan yang kamu miliki, mulai dari total luas lahan, jumlah pohon, estimasi waktu panen terdekat, hingga total plot terdaftar.",
    },
  },
  {
    element: '[data-tour="tambah-lahan"]',
    popover: {
      title: "Tambah Lahan Baru",
      description:
        "Gunakan tombol ini untuk menambahkan plot lahan kelapa baru. Tekan Selanjutnya untuk melihat formulir pendaftaran lahan.",
      nextBtnText: "Buka Form Tambah Lahan →",
      onNextClick: () => {
        context?.onOpenDialogAndProceed(
          "tambah-lahan",
          '[data-tour="form-nama-lahan"]',
        );
      },
    },
  },
  {
    element: '[data-tour="form-nama-lahan"]',
    popover: {
      title: "Nama Kebun / Blok",
      description:
        "Masukkan nama atau identitas plot lahan (contoh: Kebun Blok C Selatan).",
    },
  },
  {
    element: '[data-tour="form-luas-lahan"]',
    popover: {
      title: "Luas Lahan",
      description:
        "Masukkan luas area lahan kebun kelapamu dalam satuan meter persegi (m²).",
    },
  },
  {
    element: '[data-tour="form-pohon-lahan"]',
    popover: {
      title: "Jumlah Pohon",
      description:
        "Masukkan estimasi jumlah total pohon kelapa yang tumbuh di lahan ini.",
    },
  },
  {
    element: '[data-tour="form-lokasi-lahan"]',
    popover: {
      title: "Lokasi Kebun",
      description:
        "Tuliskan desa, kecamatan, atau rincian alamat lokasi kebun.",
    },
  },
  {
    element: '[data-tour="form-deskripsi-lahan"]',
    popover: {
      title: "Deskripsi Lahan",
      description:
        "Catatan atau rincian tambahan mengenai karakteristik lahan kebun (opsional).",
    },
  },
  {
    element: '[data-tour="form-tanggal-tanam"]',
    popover: {
      title: "Tanggal Tanam",
      description:
        "Pilih estimasi tanggal penanaman bibit pohon kelapa (opsional).",
    },
  },
  {
    element: '[data-tour="form-simpan-lahan"]',
    popover: {
      title: "Simpan Lahan",
      description:
        "Setelah semua data terisi dengan benar, tekan tombol ini untuk menyimpan data lahan ke database.",
      nextBtnText: "Simpan →",

      onNextClick: () => {
        context?.onOpenDialogAndProceed(
          "close-tambah-lahan",

          '[data-tour="list-lahan"]',
        );
      },
    },
  },
  {
    element: '[data-tour="list-lahan"]',
    popover: {
      title: "Daftar Lahan",
      description:
        "Setelah menambahkan lahan, daftar lahan yang kamu miliki akan ada disini.",
    },
  },

  {
    element: '[data-tour="card-lahan-pertama"]',

    popover: {
      title: "Lihat Detail Lahan",

      description: "Tekan Selanjutnya untuk membuka detail lahan pertama.",

      nextBtnText: "Buka Detail →",

      onNextClick: () => {
        context?.onOpenDialogAndProceed(
          "detail-lahan",

          '[data-tour="detail-lahan"]',
        );
      },
    },
  },
  {
    element: '[data-tour="detail-lahan"]',

    popover: {
      title: "Detail Lahan",

      description:
        "Di sini ditampilkan seluruh informasi lengkap mengenai lahan yang dipilih.",
    },
  },
  {
    element: '[data-tour="edit-lahan"]',
    popover: {
      title: "Edit Lahan",
      description:
        "Untuk mengedit lahan, kamu bisa menggunakan tombol edit lahan ini.",
    },
  },
  {
    element: '[data-tour="hapus-lahan"]',
    popover: {
      title: "hapus Lahan",
      description:
        "Untuk menghapus lahan, kamu bisa menggunakan tombol hapus lahan ini.",
      nextBtnText: "Ke Halaman Produksi →",
      onNextClick: () => {
        if (onGoToProduksi) {
          onGoToProduksi();
        }
      },
    },
  },
];
