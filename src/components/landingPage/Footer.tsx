"use client";
import React from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { FaGithub, FaInstagram, FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/app")) {
    return null;
  }
  return (
    <>
      <footer className="relative overflow-hidden w-full bg-[#FAFBF8]">
        <div className="relative z-20 mx-auto px-5 lg:px-3 pt-12 pb-6 max-w-7xl">
          <div className="mb-10 lg:mb-0">
            <div className="lg:hidden">
              <Image
                src="/icon/logoHorizontal.png"
                width={240}
                height={100}
                alt="coconeeds logo"
                className="w-48 h-auto"
              />
              <p className="font-semibold text-sm sm:text-base mt-4 text-justify tracking-wide text-gray-500 max-w-[350px]">
                &quot;Platform digital berbasis AI yang menghubungkan petani,
                koperasi, dan industri kelapa dalam satu ekosistem agroindustri
                berkelanjutan.&quot;
              </p>
              <div className="mt-8 flex flex-col gap-4 text-sm sm:text-base">
                <span className="flex items-center gap-2 font-semibold">
                  <MapPin size={20} className="shrink-0" />
                  Jalan Veteran No. 17, Jakarta Pusat, Indonesia
                </span>
                <span className="flex items-center gap-2 font-semibold">
                  <Mail size={20} className="shrink-0" />
                  Hello@coconeeds.id
                </span>
                <span className="flex items-center gap-2 font-semibold">
                  <Phone size={20} className="shrink-0" />
                  +62 899-671-953
                </span>
              </div>
              <div className="flex gap-3 mt-8 justify-start">
                {[FaInstagram, FaWhatsapp, FaXTwitter, FaGithub].map(
                  (Icon, index) => (
                    <button
                      key={index}
                      className="
                  h-11
                  w-11
                  rounded-xl
                  border
                  border-[#E7ECE8]
                  bg-white
                  flex
                  items-center
                  justify-center
                  text-[#2D6A4F]
                  transition-all
                  hover:bg-[#EEF8F2]
                  hover:border-[#2D6A4F]
                  "
                    >
                      <Icon size={18} />
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>

          <div className="hidden lg:grid relative grid-cols-12 items-start gap-20">
            <div className="absolute inset-y-4 left-[32%] w-px bg-[#E7ECE8]" />
            <div className="absolute inset-y-4 left-[50%] w-px bg-[#E7ECE8]" />
            <div className="absolute inset-y-4 left-[68%] w-px bg-[#E7ECE8]" />
            <div className="absolute inset-y-4 left-[85%] w-px bg-[#E7ECE8]" />

            <div className="col-span-4 min-w-0">
              <Image
                src="/icon/logoHorizontal.png"
                width={240}
                height={100}
                alt="coconeeds logo"
                className="w-60 h-auto"
              />
              <p className="font-semibold text-lg mt-4 text-justify text-gray-500 max-w-[350px]">
                &quot;Platform digital berbasis AI yang menghubungkan petani,
                koperasi, dan industri kelapa dalam satu ekosistem agroindustri
                berkelanjutan.&quot;
              </p>
              <div className="mt-10 flex flex-col gap-5 text-base">
                <span className="flex items-center gap-2 font-semibold">
                  <MapPin size={20} className="shrink-0" />
                  Jalan Veteran No. 17, Jakarta Pusat, Indonesia
                </span>
                <span className="flex items-center gap-2 font-semibold">
                  <Mail size={20} className="shrink-0" />
                  Hello@coconeeds.id
                </span>
                <span className="flex items-center gap-2 font-semibold">
                  <Phone size={20} className="shrink-0" />
                  +62 899-671-953
                </span>
              </div>
              <div className="flex gap-3 mt-10 justify-start">
                {[FaInstagram, FaWhatsapp, FaXTwitter, FaGithub].map(
                  (Icon, index) => (
                    <button
                      key={index}
                      className="
                  h-11
                  w-11
                  rounded-xl
                  border
                  border-[#E7ECE8]
                  bg-white
                  flex
                  items-center
                  justify-center
                  text-[#606C38]
                  transition-all
                  hover:bg-[#606C38]/10
                  hover:border-[#283618]
                  "
                    >
                      <Icon size={18} />
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="col-span-2 min-w-0 mt-4">
              <h3 className="font-bold text-[#606C38] text-xl tracking-wide">
                Platform
              </h3>
              <div className="mt-8 flex flex-col font-semibold gap-5 text-gray-600">
                <Link href="/app">Portal Petani</Link>
                <Link href="/app/eco-point">EcoPoints</Link>
                {/* <Link href="/app/marketplace">Marketplace</Link> */}
                <Link href="/app/pengiriman">Logistik</Link>
              </div>
            </div>

            <div className="col-span-2 min-w-0 mt-4">
              <h3 className="font-bold text-[#606C38] text-xl xl:whitespace-nowrap tracking-wide">
                AI CocoNeeds
              </h3>
              <div className="mt-8 flex flex-col font-semibold gap-5 text-gray-600">
                <Link href="#">Prediksi Panen</Link>
                <Link href="#">Kesehatan Kebun</Link>
                <Link href="#">Rekomendasi Produk</Link>
                <Link href="#">Tanya Coco AI</Link>
              </div>
            </div>

            <div className="col-span-2 min-w-0 mt-4">
              <h3 className="text-xl text-[#606C38] font-bold tracking-wide">
                Bantuan
              </h3>
              <div className="mt-8 flex flex-col font-semibold gap-5 text-gray-600">
                <Link href="#">Dokumentasi</Link>
                <Link href="#">Panduan</Link>
                <Link href="#">FAQ</Link>
                <Link href="#">Kebijakan Privasi</Link>
              </div>
            </div>

            <div className="col-span-2 min-w-0 mt-4">
              <h3 className="text-xl text-[#606C38] font-bold tracking-wide">
                Tentang kami
              </h3>
              <div className="mt-8 flex flex-col font-semibold gap-5 text-gray-600">
                <Link href="#">Ide Awal</Link>
                <Link href="#">Berita</Link>
                <Link href="#">Kemitraan</Link>
                <Link href="#">Hubungi kami</Link>
              </div>
            </div>
          </div>

          <div className="lg:hidden grid grid-cols-2 gap-x-6 gap-y-10">
            <div className="min-w-0">
              <h3 className="font-bold text-[#606C38] text-xl tracking-wide">
                Platform
              </h3>
              <div className="mt-6 flex flex-col font-semibold gap-4 text-gray-600 text-sm sm:text-base break-words">
                <Link href="/farmer-portal">Portal Petani</Link>
                <Link href="/EcoPoint">EcoPoints</Link>
                <Link href="/marketplace">Marketplace</Link>
                <Link href="/logistics">Logistik</Link>
              </div>
            </div>

            <div className="min-w-0">
              <h3 className="font-bold text-[#606C38] text-xl  tracking-wide break-words">
                AI CocoNeeds
              </h3>
              <div className="mt-6 flex flex-col font-semibold gap-4 text-gray-600 text-sm sm:text-base break-words">
                <Link href="#">Prediksi Panen</Link>
                <Link href="#">Kesehatan Kebun</Link>
                <Link href="#">Rekomendasi Produk</Link>
                <Link href="#">Tanya Coco AI</Link>
              </div>
            </div>

            <div className="min-w-0">
              <h3 className="text-xl text-[#606C38] font-bold tracking-wide">
                Bantuan
              </h3>
              <div className="mt-6 flex flex-col font-semibold gap-4 text-gray-600 text-sm sm:text-base break-words">
                <Link href="#">Dokumentasi</Link>
                <Link href="#">Panduan</Link>
                <Link href="#">FAQ</Link>
                <Link href="#">Kebijakan Privasi</Link>
              </div>
            </div>

            <div className="min-w-0">
              <h3 className="text-xl text-[#606C38] font-bold tracking-wide break-words">
                Tentang kami
              </h3>
              <div className="mt-6 flex flex-col font-semibold gap-4 text-gray-600 text-sm sm:text-base break-words">
                <Link href="#">Ide Awal</Link>
                <Link href="#">Berita</Link>
                <Link href="#">Kemitraan</Link>
                <Link href="#">Hubungi kami</Link>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-[#E7ECE8] max-w-7xl" />

          <div className="mt-4 z-20 flex flex-col items-center text-center gap-3 lg:flex-row lg:items-center lg:justify-between lg:text-left">
            <span className="text-gray-500 font-semibold">
              © 2026 CocoNeeds. All rights reserved.
            </span>

            <span className="text-[#606C38] font-medium">
              Mendukung Ekosistem Kelapa Indonesia.
            </span>

            <div className="flex gap-8 text-gray-500 font-semibold">
              <Link href="#">Terms</Link>

              <Link href="#">Privacy</Link>

              <Link href="#">Cookies</Link>
            </div>
          </div>
        </div>

        <div className="relative bottom-0 left-0 w-full h-[180px] sm:h-[260px] lg:h-[400px] z-0">
          <Image
            src="/icon/footerLandscape.png"
            alt="Footer Landscape"
            fill
            className="object-cover object-bottom"
          />
          <div className=" absolute inset-0 bg-gradient-to-b from-[#FAFBF8] via-[#FAFBF8]/25 via-20% to-transparent" />
        </div>

        <Image
          src="/icon/cocoLogo.jpg"
          alt="Watermark"
          width={380}
          height={380}
          className="hidden md:block absolute right-2 bottom-40 opacity-[0.08] z-10 pointer-events-none select-none"
        />
      </footer>
    </>
  );
}
