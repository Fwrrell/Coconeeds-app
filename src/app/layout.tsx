import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${quicksand.variable} font-sans h-full antialiased`}
    >
      <body className="flex flex-col min-h-screen bg-white font-['Quicksand',sans-serif]">
        <TooltipProvider>
          {children}
          <Toaster position="top-right" />
        </TooltipProvider>
      </body>
    </html>
  );
}
