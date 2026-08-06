import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { auth } from "@/lib/auth";
import { getSystemSettings } from "@/lib/system-settings";
import { Hourglass, Mail } from "lucide-react";

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Coconeeds | Smart Circular Logistics & Agroindustry Platform",
  description:
    "Smart Circular Logistics & Agroindustry Platform powering local Kopdes and B2B marketplace.",
};

const WaitingRoom = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-[#FEFAE0] text-center p-6">
    <div className="max-w-md">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#606C38]/10 mb-6 border-4 border-white shadow-sm">
        <Hourglass className="w-8 h-8 text-[#606C38]" />
      </div>
      <h1 className="text-3xl font-bold text-[#283618] tracking-tight">
        Akun Anda Sedang Ditinjau
      </h1>
      <p className="mt-3 text-base text-[#606C38]/90">
        Terima kasih telah mendaftar. Tim kami akan segera meninjau permohonan Anda. Proses ini biasanya memakan waktu kurang dari 24 jam.
      </p>
      <div className="mt-8 border-t border-[#DDA15E]/30 pt-6">
        <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
          <Mail className="h-4 w-4"/> Jika ada pertanyaan, hubungi <a href="mailto:support@coconeeds.com" className="font-semibold text-[#606C38] hover:underline">support@coconeeds.com</a>
        </p>
      </div>
    </div>
  </div>
);

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const user = session?.user;

  // cache 60s db querynya biar ngurangin latency tiap pindah page
  const setting = await getSystemSettings();
  const juriAccess = setting?.juriAccess ?? false;

  const isPendingCompany = user?.role === 'PERUSAHAAN' && user?.approvalStatus === 'PENDING';
  const isQuarantined = isPendingCompany && !juriAccess;

  return (
    <html
      lang="id"
      className={`${quicksand.variable} font-sans h-full antialiased`}
    >
      <body className="flex flex-col min-h-screen bg-white font-['Quicksand',sans-serif]">
        <TooltipProvider>
          {isQuarantined ? <WaitingRoom /> : children}
          <Toaster position="top-right" />
        </TooltipProvider>
      </body>
    </html>
  );
}
