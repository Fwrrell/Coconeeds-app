import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, Sparkles } from "lucide-react";
const DONUT_COLORS = ["#606C38", "#DDA15E", "#283618", "#BC6C25", "#70E000"];
export default function HeaderPoint() {
  return (
    <section className=" overflow-hidden rounded-3xl border shadow-sm ">
      <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-4 w-full rounded-xl p-5">
        <div className="col-span-3 flex justify-center">
          <Image
            src="/icon/EcoPointMascot.png"
            width={220}
            height={220}
            alt="ecoPoint mascot"
            className="shrink-0 w-40 md:w-52 lg:w-60"
          />
        </div>
        <div className="lg:col-span-5 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="#283618 font-semibold">Level:</span>
            <span>Petani Hijau</span>
          </div>
          <div className="flex items-end gap-2 flex-wrap">
            <h2 className="font-extrabold text-5xl text-[#DDA15E]">
              {(1250).toLocaleString("id-ID")}
            </h2>
            <span className="font-semibold text-lg text-[#BC6C25]">
              EcoPoints
            </span>
          </div>
          <div className="h-2 bg-[#E8F3E8] rounded-full overflow-hidden">
            <div className="h-full bg-[#BC6C25] rounded-full w-[83%]"></div>
          </div>
          <span className="text-sm font-[#283618]-900 font-medium">
            300 poin lagi menuju organik
          </span>
        </div>
        <div className="lg:col-span-4">
          <div className="rounded-2xl min-h-[220px]  flex flex-col gap-2 items-center justify-center text-center h-full">
            <Image
              src="/icon/hijauTier.png"
              width={150}
              height={150}
              alt="petani Hijau"
              className="mx-auto"
            />
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-5 h-5 text-[#BC6C25]" />

              <h3 className="font-bold text-md">Benefit Saat Ini</h3>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-[#606C38] font-medium">
                  Bonus EcoPoint
                </span>

                <span className="font-semibold text-sm text-[#BC6C25]">
                  +0.5%
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-[#606C38] font-medium">
                  Bonus Penjemputan
                </span>

                <span className="font-semibold text-[#BC6C25]">2x</span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-[#606C38] font-medium">
                  Hadiah Bulanan
                </span>

                <span className="font-semibold text-[#BC6C25]">Pupuk 3 Kg</span>
              </div>
            </div>
            <Link
              href="#"
              className="font-semibold text-[#DDA15E]  text-sm flex items-center gap-2"
            >
              Lihat Detail <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
