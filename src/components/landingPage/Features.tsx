"use client";
import React, { useCallback } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import "../../app/globals.css";
const Features = () => {
  const coreFeatures = [
    {
      category: "AI Driven Forecasting",
      image: "/icon/AIForecasting.png",
      title: "Prediksi Panen dan Analisis Kualitas Berbasis AI",
      description:
        "AI Forecasting membantu petani mengoptimalkan hasil panen dengan prediksi waktu panen akan datang berdasarkan jumlah pohon, luas lahan, serta data panen. AI juga menganalisis foto buah kelapa untuk mendeteksi tingkat kematangan dan kualitas dari kelapa.",
    },
    {
      category: "Supply Chain Traceability",
      image: "/icon/logistics.png",
      title: "Pelacakan Produk dari Kebun hingga Perusahaan",
      description:
        "Pengiriman hasil panen menjadi lebih mudah melalui kemitraan CocoNeeds dengan koperasi desa. Dengan dukungan layanan pick-up dan QR Code di setiap pengiriman, petani maupun perusahaan dapat memantau perjalanan produk serta keaslian produk tercatat dalam sertifikat digital untuk memastikan transparansi.",
    },
    {
      category: "Marketplace",
      image: "/icon/marketplace.jpg",
      title: "Menghubungkan Banyak Petani dengan perusahaan",
      description:
        'Dengan konsep "Crowd Supplying", CocoNeeds menggabungkan hasil panen dari banyak petani melalui koperasi untuk mengoptimalkan permintaan dalam skala besar sehingga dapat dipenuhi secara efisien, adil, dan transparan.',
    },
    {
      category: "Eco Points",
      image: "/icon/EcoPoints.png",
      title: "Limbah Kelapa Menjadi Sumber Nilai Baru",
      description:
        "Eco Points mendorong pemanfaatan limbah sabut dan tempurung kelapa menjadi sumber nilai ekonomi. Limbah yang terkumpul dapat ditukarkan dengan berbagai insentif operasional, seperti token listrik dan saldo e-wallet, sementara sistem menghitung estimasi emisi karbon yang berhasil dikurangi sebagai bagian dari praktik agroindustri berkelanjutan.",
    },
  ];
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start" });
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);
  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);
  return (
    <>
      <div className="flex flex-col text-center items-center gap-8 py-12 px-4 w-full bg-[#F8F9FA] bg-gray-100 border border-gray-200 shadow-md rounded-xl">
        <div className="flex flex-col items-center max-w-[650px] gap-4 justify-center">
          <p className="capitalize text-md lg:text-xl font-semibold text-[#606C38]">
            Layanan Kami
          </p>
          <h2 className="text-lg lg:text-2xl font-semibold">
            Satu Platform untuk Petani, Koperasi, Logistik, dan Perusahaan
          </h2>
        </div>
        <div className="overflow-hidden w-full max-w-7xl" ref={emblaRef}>
          <div className="flex gap-6">
            {coreFeatures.map((features, index) => (
              <div
                key={index}
                className="shrink-0 w-[85vw] lg:w-[500px] group  relative flex flex-col justify-end h-auto lg:h-[450px] rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing border border-gray-300 lg:border-transparent hover:border-[#606C38]/50 transition-all duration-500 shadow-lg bg-cover bg-center bg-no-repeat"
              >
                <div className="relative w-full h-[220px] shrink-0 md:h-full md:absolute md:inset-0 z-0">
                  <Image
                    sizes="(max-width: 768px) 85vw, 500px"
                    fill
                    src={features.image}
                    alt={features.title}
                    className="absolute inset-0 w-full h-full object-cover object-center z-0"
                  />
                </div>
                <div className="hidden lg:block absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-0 opacity-100 lg:opacity-80 lg:group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10 flex flex-col justify-evenly xl:justify-between h-full p-4">
                  <span className="px-4 py-1 text-xs font-bold bg-[#606C38]/90 text-white border border-[#606C38]/30 rounded-full w-fit">
                    {features.category}
                  </span>
                  <div className="flex flex-col">
                    <h3 className="text-lg lg:text-2xl font-bold text-gray-900 md:text-white mb-2 xl:group-hover:-translate-y-2 transition-transform duration-500">
                      {features.title}
                    </h3>

                    <div className="grid grid-rows-[1fr] opacity-100 lg:grid-rows-[0fr] lg:opacity-0 lg:group-hover:grid-rows-[1fr] lg:group-hover:opacity-100 transition-all duration-500 ease-in-out">
                      <div className="overflow-hidden">
                        <p className="text-gray-600 lg:text-gray-200 text-xs text-justify p-2 leading-relaxed pb-4 font-medium">
                          {features.description}
                        </p>

                        <button className="flex items-center gap-2 text-[#606C38] md:text-white font-semibold text-sm hover:translate-x-1 hover:text-[#216533] md:hover:text-[#F9DFB1] transition-transform duration-300">
                          Learn More <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-6 mt-12">
          <button
            onClick={scrollPrev}
            className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center text-[#606C38] hover:bg-[#F8F7F3]/90 hover:text-[#283618] hover:border-[#606C38] transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            onClick={scrollNext}
            className="w-12 h-12 rounded-full bg-[#606C38] flex items-center justify-center text-white hover:bg-[#283618]/90 transition-all active:scale-95"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
};

export default Features;
