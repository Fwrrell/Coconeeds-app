import React from "react";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { getTierProgress } from "@/utils/TierCalculator";
import { Sparkles } from "lucide-react";
const benefitHijau = [
  {
    title: "Gratis Penjemputan 2x",
    desc: "Layanan gratis biaya penjemputan hasil panen ataupun limbah yang ingin dikirimkan ke koperasi desa",
  },
  {
    title: "Gratis 10 bibit kelapa",
    desc: "Dapatkan 10 Bibit kelapa setiap bulan yang dapat ditukarkan di koperasi desa",
  },
  {
    title: "Bonus EcoPoint 0.5x",
    desc: "Dapatkan bonus EcoPoint 0.25x setiap transaksi pengiriman hasil panen ke koperasi desa",
  },
];
interface prop {
  point: number;
}
export default function TierHijau({ point }: prop) {
  const { progress, remain, targetPoint } = getTierProgress(point, "hijau");
  console.log({
    point,
    progress,
    remain,
    targetPoint,
  });
  return (
    <div className="mx-auto flex max-w-5xl flex flex-col gap-12 px-6 py-10">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="rounded-full bg-gradient-to-br from-[#FDFBF4] via-white to-[#EEF8F2] p-4 shadow-lg ring-1 ring-[#606C38]/10">
          <Image
            src="/icon/hijau.png"
            width={250}
            height={250}
            alt="Tier Pemula"
          />
        </div>
        <div className="w-full max-w-xl space-y-5 text-center">
          <h1 className="text-5xl font-bold text-[#283618]">Tier Hijau</h1>
          <span className="text-[#283618] text-2xl font-semibold">
            {point.toLocaleString("id-ID")} EcoPoint
          </span>
          <div className="space-y-3 pt-2">
            <Progress
              value={progress}
              className="h-3 rounded-full bg-[#606C38]/10 flex-1 h-3 rounded-full"
            />

            <span className="text-lg text-[#606C38] font-semibold">
              Target {targetPoint.toLocaleString("id-ID")}
            </span>
          </div>
          <p className="text-[#606C38] font-semibold">
            Kurang {remain.toLocaleString("id-ID")} EcoPoint lagi
          </p>
        </div>
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="rounded-xl  bg-gradient-to-br from-[#EEF8F2] to-[#FDFBF4] p-2">
              <Sparkles className="h-5 w-5 text-[#606C38]" />
            </div>

            <h2 className="text-3xl font-bold text-[#283618]">
              Keuntungan Tier Hijau
            </h2>
          </div>

          {benefitHijau.map((benefit, index) => (
            <Card
              key={index}
              className="rounded-3xl border  border-[#606C38]/10 transition-all duration-300 hover:-translate-y-1 hover:border-[#606C38]/30 hover:shadow-lg"
            >
              <div className="flex items-center gap-6 p-6 ">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FDFBF4] via-white to-[#EEF8F2] ring-1 ring-[#606C38]/10">
                  <Image
                    src="/icon/pemula.png"
                    width={70}
                    height={70}
                    alt={benefit.title}
                  />
                </div>

                <div className="space-y-2 flex flex-col items-start ">
                  <h3 className="text-xl font-semibold text-slate-800">
                    {benefit.title}
                  </h3>

                  <p className="text-[15px] leading-7 text-slate-500">
                    {benefit.desc}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
