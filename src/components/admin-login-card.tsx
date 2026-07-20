"use client";

import { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function AdminLoginCard() {
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = async () => {
    setIsLoading(true);
    await signIn("google", { callbackUrl: "/admin" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center"
    >
      {/* Main Card */}
      <div className="relative w-full overflow-hidden rounded-[2.5rem] bg-white/90 px-8 py-12 shadow-[0_20px_60px_-15px_rgba(40,54,24,0.1)] backdrop-blur-xl border border-white sm:px-12">
        {/* titik 3x3 */}
        <div className="absolute top-6 right-8 flex gap-1 opacity-20">
          <div className="grid grid-cols-3 gap-1.5">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-1.5 w-1.5 rounded-full bg-[#DDA15E]" />
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center text-center">
          {/* Icon Shield */}
          <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-[#283618] shadow-xl ring-8 ring-[#DDA15E]/20">
            <ShieldCheck className="h-10 w-10 text-white" strokeWidth={2} />
          </div>

          {/* Teks Header */}
          <h2 className="font-serif text-3xl font-bold tracking-tight text-[#283618]">
            Selamat Datang
          </h2>

          <div className="mt-4 h-1 w-12 rounded-full bg-[#DDA15E]" />

          <p className="mt-6 text-sm leading-relaxed text-[#606C38]">
            Masuk menggunakan akun Google yang telah diotorisasi untuk mengakses
            dashboard admin.
          </p>
        </div>

        <div className="mt-8 flex flex-col space-y-4">
          <button
            type="button"
            disabled={isLoading}
            onClick={handleAdminLogin}
            className={cn(
              buttonVariants({
                className:
                  "h-14 w-full rounded-2xl bg-[#283618] text-base font-semibold text-white hover:bg-[#1a2310] transition-colors shadow-lg shadow-[#283618]/20 disabled:opacity-70 disabled:cursor-not-allowed",
              }),
            )}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#DDA15E]" />
            ) : (
              // Icon Google
              <svg
                className="mr-3 h-5 w-5 bg-white rounded-full p-0.5"
                viewBox="0 0 24 24"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Masuk dengan Google
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 flex flex-col items-center space-y-2 opacity-80">
        <Image src="/logo-text.png" alt="Coconeeds" width={100} height={100} />
        <p className="pt-2 text-sm text-[#606C38]/60">
          © 2026 Coconeeds. All rights reserved.
        </p>
      </div>
    </motion.div>
  );
}
