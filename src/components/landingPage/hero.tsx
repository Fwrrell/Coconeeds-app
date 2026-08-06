import React from "react";
import Link from "next/link";

export function Hero() {
  return (
    <>
      <div
        className="relative min-h-[40vh] w-full flex mb-10 overflow-hidden bg-cover bg-[70%_center] bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/icon/coconutPlant.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#1F2B13]/95 via-[#283618]/80 via-30% to-transparent z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#283618]/90 via-[#606C38]/65 to-transparent" />
        <div className="relative z-10 p-6 pt-10 xl:px-8 xl:pb-16 xl:pt-20 lg:pt-28 flex flex-col gap-8 max-w-[800px]">
          <span className="p-3 text-xs xl:text-lg rounded-full max-w-fit bg-[#606C38]/70 border border-[#A3B18A]/40 text-[#F8F6F0]">
            Bersama Membangun Agroindustri Kelapa
          </span>
          <div className="flex flex-col items-start gap-6 ">
            <h1 className=" text-background font-bold tracking-widers text-2xl xl:text-4xl ">
              Satu Platform untuk Menghubungkan Agroindustri Kelapa
            </h1>
            <p className=" text-xs xl:text-lg max-w-[350px] xl:max-w-[600px] text-justify text-background text-[#E7E5E4]">
              Mulai dari petani, koperasi, penyedia logistik, hingga perusahaan,
              CocoNeeds menyatukan seluruh pihak rantai pasok dalam satu
              platform digital berbasis AI untuk menciptakan agroindustri yang
              lebih efisien, berkelanjutan, dan saling menguntungkan.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              className="bg-[#606C38] hover:bg-[#4F5A2F] text-white max-w-fit p-2 xl:p-3 rounded-xl text-xs whitespace-nowrap xl:text-lg font-semibold tracking-wide cursor-pointer"
              href="/app"
            >
              Gabung sebagai Petani
            </Link>
            <Link
              href="#"
              className="bg-transparent text-white border border-white text-xs whitespace-nowrap xl:text-lg border-1 max-w-fit p-2 xl:p-3 rounded-xl font-semibold tracking-wide cursor-pointer"
            >
              Bermitra dengan Kami
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Hero;
