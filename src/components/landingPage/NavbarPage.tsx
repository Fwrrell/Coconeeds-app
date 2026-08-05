"use client";
import { CircleUserRound, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
export function NavbarLanding() {
  const [SidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  if (pathname.startsWith("/app")) {
    return null;
  }
  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md w-full border-b border-[#EEF1EE] py-4 lg:py-0 px-6">
        <div className="flex justify-between items-center ">
          <Image
            src="/icon/logoHorizontal.png"
            width={185}
            height={50}
            alt="logo-coconeeds"
            className="w-36 md:w-40 lg:w-44 xl:w-48 h-auto"
          />

          <div className="flex items-center gap-4">
            <CircleUserRound className="hidden xl:block w-8 h-8 text-gray-700 cursor-pointer hover:text-black transition-colors" />
            <Link
              href="/app"
              className="px-3 py-2 font-semibold text-xs xl:text-lg bg-[#606C38] rounded-lg text-white"
            >
              Farmer Portal
            </Link>
            <button
              className="xl:hidden block text-gray-800 p-1"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>
      <div
        className={`fixed inset-0 z-50 xl:hidden transition-opacity duration-300 ${
          SidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
        <div
          className={`absolute top-0 right-0 h-full w-64 bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${
            SidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex justify-between items-center p-3 border-b border-[#609D7F]">
            <div className="flex items-center gap-1">
              <Image
                src="/cocoLogo.jpg"
                width={36}
                height={36}
                alt="logo CocoNeeds"
              />
              <span className="text-lg font-semibold text-[#216533]">
                Coco<span className="text-[#793C14]">Needs</span>
              </span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2  rounded-full text-white bg-[#609D7F] transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
