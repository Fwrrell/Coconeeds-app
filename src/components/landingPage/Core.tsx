import { IdCard } from "lucide-react";
import React from "react";

function Core() {
  const advantageDesc = [
    {
      stat: "AI Forecasting",
      title: "Prediksi Panen yang Lebih Akurat",
      description:
        "Teknologi AI membantu memperkirakan waktu dan kualitas hasil panen berdasarkan data dan kondisi produksi. Membantu petani mengoptimalkan kebutuhan pasokan sehingga risiko kekurangan atau kelebihan stok dapat diminimalkan.",
    },
    {
      stat: "Smart Logistic",
      title: "Traceability Produk yang Terpercaya",
      description:
        "transparansi dan autentikasi produk yang dapat ditelusuri mulai dari petani dan asal kebun, proses distribusi, hingga diterima oleh perusahaan.",
    },
    {
      stat: "B2B",
      title: "Menghubungkan Petani dan Industri",
      description:
        "CocoNeeds mempertemukan petani, koperasi, dan perusahaan dalam satu platform untuk efisiensi proses pencarian pemasok, negosiasi, hingga transaksi menjadi lebih mudah.",
    },
    {
      stat: "Eco Points",
      title: "Mendorong Circular Economy",
      description:
        "Limbah kelapa tidak lagi menjadi sisa produksi. CocoNeeds membantu pemanfaatan limbah, dengan eco-points limbah kelapa dapat ditukar menjadi nilai ekonomi yang dapat membantu produksi.",
    },
  ];
  return (
    <>
      <div className="flex flex-col items-center gap-12 py-12 px-4 w-full">
        <h2 className="capitalize font-semibold gap-6 text-4xl max-w-[800px] text-center">
          Membangun Agroindustri yang Lebih Efisien dan Berkelanjutan
        </h2>

        <div className="grid grid-cols-1 gap-4 lg:gap-0 md:grid-cols-2 lg:grid-cols-4 max-w-7xl w-full">
          {advantageDesc.map((card, index) => (
            <div
              key={index}
              className="group flex flex-col rounded-2xl lg:gap-0 p-8 border border-gray-200 justify-center items-center cursor-pointer shadow-sm hover:shadow-lg hover:border-[#3BA275]/50 transition-all duration-500"
            >
              <span className="text-xl xl:text-3xl font-bold text-[#3BA275]/80 mb-3 lg:group-hover:-translate-y-1 transition-transform duration-500">
                {card.stat}
              </span>
              <p className="font-regular text-xl text-center lg:group-hover:-translate-y-1 transition-transform duration-500">
                {card.title}
              </p>
              <div className="grid grid-rows-[1fr] xl:grid-rows-[0fr] opacity-100 xl:opacity-0 xl:group-hover:grid-rows-[1fr] xl:group-hover:opacity-100 transition-all duration-500 ease-in-out w-full">
                <div className="overflow-hidden">
                  <p className="pt-4 text-xs lg:text-sm text-center xl:text-justify text-gray-500 font-normal leading-relaxed border-t border-gray-100 mt-4">
                    {card.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Core;
