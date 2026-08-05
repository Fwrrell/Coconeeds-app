# 🌴 Coconeeds

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/) [![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/) [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/) [![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

Platform digital terintegrasi untuk membangun ekosistem rantai nilai komoditas kelapa yang efisien, transparan, dan berkelanjutan, menghubungkan petani, koperasi (Kopdes), dan perusahaan.

## 🎯 Permasalahan & Tujuan

Indonesia, sebagai produsen kelapa terbesar, masih menghadapi tantangan dalam rantai pasok, akses pasar, dan optimalisasi hasil. **Coconeeds** hadir untuk menyelesaikan masalah ini dengan tiga pendekatan utama:

-   🌴 **Smart Agroindustry**: Digitalisasi data lahan, panen, QC, batching, dan marketplace B2B.
-   🚢 **Smart Logistics**: Efisiensi distribusi dengan AI Cargo Pooling, Joint Shipping, dan Product Traceability.
-   ♻️ **Green Economy**: Mendorong ekonomi sirkular melalui manajemen hasil samping dan insentif Eco Points.

## ✨ Fitur Utama

Aplikasi ini melayani tiga peran utama dalam ekosistem:

### 👨‍🌾 Petani
Sumber utama data produksi.
-   **Fitur**: Login via No. HP & PIN, Manajemen Lahan, Input Hasil Panen, AI Insight, Manajemen Hasil Samping, Eco Points & Gamifikasi, Riwayat Transaksi.

### 🏢 Koperasi (Kopdes)
Agregator dan pusat kendali mutu.
-   **Fitur**: Verifikasi Panen, QC & Grading, Batching Komoditas, Marketplace (Offer), Negosiasi, AI Cargo Pooling, Joint Shipping, Split Billing, Product Traceability (QR).

### 🏭 Perusahaan
Mitra off-taker yang mencari pasokan komoditas.
-   **Fitur**: Login via Google, Membuat Want to Buy (WTB), Menerima Penawaran, Negosiasi, Tracking Pengiriman, Scan QR Traceability.

---

## 🛠️ Teknologi yang Digunakan

| Komponen | Teknologi |
| :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) (App Router) |
| **Bahasa** | [TypeScript](https://www.typescriptlang.org/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) |
| **ORM** | [Prisma](https://www.prisma.io/) |
| **Autentikasi** | [NextAuth.js](https://next-auth.js.org/) (v5) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) |
| **State Management**| [Zustand](https://zustand-demo.pmnd.rs/) |
| **Form Validation**| [Zod](https://zod.dev/) |
| **Deployment** | [Vercel](https://vercel.com/) |
| **Database Hosting**| [Supabase](https://supabase.com/) |

---

## 🚀 Instalasi & Konfigurasi

Untuk menjalankan proyek ini secara lokal, ikuti langkah-langkah berikut:

### 1. Clone Repository
```bash
git clone https://github.com/fwrel/coconeed-app.git
cd coconeed-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Konfigurasi Environment
Salin file `.env.example` dan isi variabel yang dibutuhkan.
```bash
cp .env.example .env
```
Variabel penting yang harus diisi:
-   `DATABASE_URL` & `DIRECT_URL`: String koneksi ke database PostgreSQL Anda (misalnya dari Supabase).
-   `AUTH_SECRET`: Kunci rahasia untuk NextAuth. Generate menggunakan `openssl rand -base64 32`.
-   `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Kredensial untuk Google OAuth.

### 4. Sinkronisasi Database
Terapkan skema Prisma ke database Anda. Perintah ini akan membuat tabel-tabel yang diperlukan.
```bash
npx prisma db push
```

### 5. Seed Data (Opsional)
Isi database dengan data awal (contohnya admin whitelist) untuk development.
```bash
npx prisma db seed
```

### 6. Jalankan Development Server
Aplikasi akan berjalan di `http://localhost:3000`.
```bash
npm run dev
```

---

## 📂 Struktur Proyek

Struktur folder utama dalam proyek ini:

```
.
├── src/
│   ├── app/                # Rute utama aplikasi (Next.js App Router)
│   │   ├── (auth)/         # Grup rute untuk autentikasi
│   │   ├── admin/          # Panel admin/koperasi
│   │   ├── app/            # Panel petani
│   │   └── perusahaan/     # Panel perusahaan B2B
│   ├── components/         # Komponen UI Reusable
│   ├── hooks/              # Custom React Hooks
│   ├── lib/                # Fungsi helper, utilitas, dan konfigurasi (Prisma, Auth)
│   ├── prisma/             # Skema & seed database
│   └── store/              # State management (Zustand)
├── .env.example            # Template variabel environment
├── middleware.ts           # Middleware untuk proteksi rute
└── package.json
```

---

## 👨‍💻 Tim Pengembang

-   **M. Farrel Putra R.** - Full Stack Developer
-   **Prospero Phelix** - Front End Developer
-   **Jose Jonathan H.** - Project Manager & Documentation
