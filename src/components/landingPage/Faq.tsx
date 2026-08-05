"use client";
import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import "../../app/globals.css";
import { ArrowDown } from "lucide-react";
export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const toggle = (index: number) => {
    setOpen(open === index ? null : index);
  };
  const faqList = [
    {
      title: "Bagaimana AI CocoNeeds membantu saya memperkirakan hasil panen?",
      answer:
        "AI CocoNeeds membantu memperkirakan potensi hasil panen berdasarkan jumlah pohon, luas lahan, serta data produksi yang Anda masukkan. Sistem juga menghitung estimasi biomassa seperti sabut, tempurung, air kelapa, dan kopra sehingga petani maupun perusahaan dapat merencanakan produksi dan distribusi dengan lebih baik.",
    },
    {
      title: "Apakah AI dapat memeriksa kualitas buah kelapa?",
      answer:
        "Ya. Petani dapat mengunggah foto buah kelapa melalui aplikasi, kemudian AI akan membantu mendeteksi tingkat kematangan dan kualitas buah. Hasil analisis ini dapat menjadi referensi sebelum panen maupun saat proses quality control di koperasi.",
    },
    {
      title: "Apa itu Eco Points?",
      answer:
        "Eco Points merupakan sistem penghargaan bagi petani yang menukarkan limbah sabut dan tempurung kelapa melalui CocoNeeds. Poin yang diperoleh dapat ditukar dengan berbagai insentif, seperti token listrik atau saldo e-wallet, sekaligus mendorong pemanfaatan limbah secara lebih berkelanjutan.",
    },
    {
      title: "Bagaimana CocoNeeds membantu pengiriman hasil panen?",
      answer:
        "CocoNeeds bekerja sama dengan koperasi desa sebagai pusat konsolidasi hasil panen. Petani dapat memilih layanan penjemputan (pick-up) atau mengirimkan hasil panen secara mandiri ke koperasi. Selanjutnya koperasi akan melakukan pemeriksaan kualitas sebelum produk dikirim ke perusahaan.",
    },
    {
      title: "Apa manfaat Certificate of Authenticity?",
      answer:
        "Setelah produk lolos proses verifikasi di koperasi desa, CocoNeeds menerbitkan Certificate of Authenticity yang berisi identitas digital dan riwayat distribusi produk. Sertifikat ini membantu meningkatkan transparansi, kepercayaan pembeli, dan mendukung kebutuhan keterlacakan produk.",
    },
    {
      title:
        'Bagaimana cara kerja "crowd supplying" untuk mengoptimalkan pasokan dari berbagai petani? ',
      answer:
        "Melalui fitur Crowd-Supplying Marketplace, CocoNeeds menggabungkan hasil panen dari beberapa petani melalui koperasi desa. Dengan demikian, perusahaan tetap dapat memperoleh pasokan dalam jumlah besar tanpa bergantung pada satu pemasok saja.",
    },
    {
      title: "Apakah CocoNeeds dapat digunakan tanpa koneksi internet?",
      answer:
        "Ya. CocoNeeds dikembangkan sebagai Progressive Web App (PWA) sehingga dapat diinstal seperti aplikasi. Pengguna tetap dapat mengakses data dan laporan yang telah tersimpan meskipun koneksi internet sedang terbatas.",
    },
  ];
  return (
    <>
      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-10 px-4">
        <div className="group text-center flex gap-4 flex-col items-center ">
          <h2 className="text-3xl text-[#283618] font-bold capitalize">
            frequently asked questions
          </h2>
          <button className="p-3 flex text-white flex-start items-center gap-4 bg-[#606C38] hover:bg-[#283618] rounded-full capitalize">
            contact us
            <span className="bg-white rounded-full p-2">
              <ArrowRight
                color="#606C38"
                className="w-3 h-3 group-hover:translate-x-1"
              />
            </span>
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {faqList.map((question, index) => {
            const isOpen = open === index;
            return (
              <div
                key={index}
                onClick={() => toggle(index)}
                className="flex flex-col p-4 gap-4 rounded-xl border border-gray-200 hover:border-[#606C38]/30  hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="text-md lg:text-xl font-semibold tracking-wider text-[#283618]">
                    {question.title}
                  </span>
                  <ArrowDown
                    className={`w-5 h-5 shrink-0 text-[#606C38] transition-transform duration-500 ${
                      isOpen ? "-rotate-180" : "rotate-0"
                    }`}
                    color="#283618"
                  />
                </div>
                <div
                  className={`grid transition-all duration-500 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0 mt-0"}`}
                >
                  <div className="overflow-hidden">
                    <p className="text-gray-600 leading-relaxed text-sm pr-8">
                      {question.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
