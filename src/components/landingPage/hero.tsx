import React from "react";
import Link from "next/link";

const Hero = () => {
  return (
    <>
      <div
        className="relative min-h-[40vh] w-full flex mb-10 overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/icon/coconutPlant.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green via-green/80 to-transparent z-0"></div>
        <div className="relative z-10 p-6 pt-10 xl:px-8 xl:pb-16 xl:pt-20 lg:pt-28 flex flex-col gap-8 max-w-[800px]">
          <span className="p-3 text-xs xl:text-lg rounded-full max-w-fit text-[#70E000] bg-[#70E000]/30">
            Bersama Membangun Agroindustri Kelapa
          </span>
          <div className="flex flex-col items-start gap-6 ">
            <h1 className=" text-background font-bold tracking-widers text-2xl xl:text-4xl ">
              Satu Platform untuk Menghubungkan Agroindustri Kelapa
            </h1>
            <p className=" text-xs xl:text-lg max-w-[350px] xl:max-w-[600px] text-justify text-background">
              Mulai dari petani, koperasi, penyedia logistik, hingga perusahaan,
              CocoNeeds menyatukan seluruh pihak rantai pasok dalam satu
              platform digital berbasis AI untuk menciptakan agroindustri yang
              lebih efisien, berkelanjutan, dan saling menguntungkan.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              className="bg-[#70E000] max-w-fit p-2 xl:p-3 rounded-xl text-xs whitespace-nowrap xl:text-lg font-regular tracking-wide cursor-pointer"
              href="/"
            >
              Gabung sebagai Petani
            </Link>
            <Link
              href="#"
              className="bg-transparent text-white border border-white text-xs whitespace-nowrap xl:text-lg border-1 max-w-fit p-2 xl:p-3 rounded-xl font-regular tracking-wide cursor-pointer"
            >
              Bermitra dengan Kami
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero;
