"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
import { buttonVariants } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type RoleType = "PETANI" | "PERUSAHAAN";
type LoginStep = "NOMOR" | "PIN";

export default function LoginPage() {
  const [role, setRole] = useState<RoleType>("PETANI");

  // state petani
  const [loginStep, setLoginStep] = useState<LoginStep>("NOMOR");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");

  // global state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputPinRef = useRef<HTMLInputElement>(null);
  const pinArray = Array.from({ length: 6 });

  // TODO: PASTIIN CUMAN BISA NERIMA ANGKA GABISA HURUF
  const handlePetaniLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // validate step 1: cek nomor yang dimasukkin
    if (loginStep === "NOMOR") {
      if (phoneNumber.length < 10) {
        setError("Nomor Telepon minimal 11 angka.");
        return;
      }
      setLoginStep("PIN");
      return;
    }

    // validate step 2: cek pin yang dimasukkin
    if (loginStep === "PIN") {
      if (pin.length !== 6) {
        setError("PIN harus 6 angka");
        return;
      }

      setIsLoading(true);
      try {
        const res = await signIn("credentials", {
          phoneNumber,
          pin,
          redirect: false,
        });

        if (res?.error) {
          if (res.error === "CredentialsSignin") {
            setError("Nomor HP atau PIN yang Anda masukkan salah.");
          } else {
            setError("Terjadi kesalahan pada sistem. Silakan coba lagi.");
          }
        } else {
          window.location.href = "/app";
        }
      } catch (err) {
        setError("Terjadi kesalah pada sistem. Coba Lagi");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // handle reset pin kalo back
  const handleBackToNomor = () => {
    setLoginStep("NOMOR");
    setPin("");
    setError(null);
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#F8F5E6] sm:px-4 sm:py-6">
      <div className="relative flex min-h-dvh w-full max-w-md flex-col overflow-hidden bg-[#F8F5E6] sm:min-h-[90dvh] sm:rounded-2xl sm:border sm:shadow-sm">
        {/* Logo Section */}
        <div className="relative flex h-[35dvh] min-h-[220px] shrink-0 items-center justify-center  ">
          <div className="absolute h-48 w-48 rounded-full bg-[#DDA15E]/30 blur-3xl" />
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative z-10 translate-y-4"
          >
            <Image
              src="/coco-idle.png"
              alt="Maskot Coconeeds"
              width={200}
              height={200}
              priority
              className="h-auto w-[160px] drop-shadow-2xl sm:w-[220px]"
            />
          </motion.div>
        </div>

        {/* Form Section */}
        <div className="relative z-20 flex flex-1 flex-col rounded-t-[2.5rem] bg-white px-6 pb-8 pt-6 shadow-[0_-15px_40px_rgba(0,0,0,0.05)] sm:px-10">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-tight text-[#283618]">
              Masuk Akun
            </h1>
            <p className="mt-2 text-sm text-[#606C38]">
              Pilih peran Anda untuk melanjutkan
            </p>
          </div>

          {/* Capsule Toggle */}
          <div className="mx-auto mt-6 flex w-full max-w-[300px] rounded-full bg-slate-100 p-1 shadow-inner">
            {(["PETANI", "PERUSAHAAN"] as const).map((r) => {
              const isActive = role === r;
              return (
                <button
                  key={r}
                  onClick={() => {
                    setRole(r);
                    setError(null);
                  }}
                  className={cn(
                    "relative flex flex-1 items-center justify-center rounded-full py-2.5 text-sm font-semibold transition-colors duration-200",
                    isActive
                      ? "text-white"
                      : "text-slate-500 hover:text-slate-700",
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="capsule-indicator"
                      className="absolute inset-0 rounded-full bg-[#606C38] shadow-md"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.5,
                      }}
                    />
                  )}
                  <span className="relative z-10">
                    {r === "PERUSAHAAN" ? "MITRA" : r}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Form Section */}
          <div className="mt-8 flex flex-1 flex-col">
            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-lg bg-red-50 p-3 text-center text-sm font-medium text-red-600"
              >
                {error}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {role === "PETANI" && (
                <motion.form
                  key="form-petani"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-1 flex-col"
                  onSubmit={handlePetaniLogin}
                >
                  <div className="flex-1 space-y-6">
                    <AnimatePresence mode="wait">
                      {loginStep === "NOMOR" ? (
                        <motion.div
                          key="input-phone"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-2"
                        >
                          <Label className="text-[#283618] font-semibold">
                            Nomor Handphone
                          </Label>
                          <Input
                            placeholder="Cth: 081234567890"
                            value={phoneNumber}
                            onChange={(e) =>
                              setPhoneNumber(e.target.value.replace(/\D/g, ""))
                            }
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={15}
                            className="h-14 rounded-xl"
                            autoFocus
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="input-pin"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <Label className="text-[#283618] font-semibold">
                              Masukkan PIN 6 Angka
                            </Label>
                          </div>

                          <div
                            className="relative flex w-full justify-between gap-2"
                            onClick={() => inputPinRef.current?.focus()}
                          >
                            <input
                              ref={inputPinRef}
                              value={pin}
                              onChange={(e) =>
                                setPin(
                                  e.target.value.replace(/\D/g, "").slice(0, 6),
                                )
                              }
                              type="tel"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={6}
                              className="absolute inset-0 z-10 w-full cursor-text opacity-0"
                              autoFocus
                            />

                            {pinArray.map((_, index) => {
                              const char = pin[index];
                              const isActive = pin.length === index;
                              return (
                                <div
                                  key={index}
                                  className={`flex h-14 w-12 items-center justify-center rounded-xl border-2 bg-background text-3xl font-bold transition-all
                                  ${isActive ? "border-[#606C38] ring-4 ring-[#606C38]/10" : "border-slate-200"}
                                  ${char ? "border-[#606C38] text-[#283618]" : "text-transparent"}
                                `}
                                >
                                  {char ? "•" : ""}
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="mt-8 space-y-4 shrink-0">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={cn(
                        buttonVariants({
                          className:
                            "h-14 w-full rounded-xl bg-[#606C38] text-base font-semibold text-white hover:bg-[#283618] transition-colors shadow-lg shadow-[#606C38]/20 disabled:opacity-70 disabled:cursor-not-allowed",
                        }),
                      )}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                          Memproses...
                        </>
                      ) : loginStep === "NOMOR" ? (
                        "Lanjut"
                      ) : (
                        "Masuk Sekarang"
                      )}
                    </button>

                    {loginStep === "PIN" && (
                      <button
                        type="button"
                        onClick={handleBackToNomor}
                        disabled={isLoading}
                        className={cn(
                          buttonVariants({
                            variant: "outline",
                            className:
                              "h-14 w-full rounded-xl text-base font-semibold text-slate-600 border-slate-300 hover:bg-slate-50 disabled:opacity-70",
                          }),
                        )}
                      >
                        Kembali
                      </button>
                    )}

                    <p className="text-center text-sm font-medium text-slate-500">
                      Belum punya akun?{" "}
                      <Link
                        href="/register"
                        className="text-[#606C38] hover:underline"
                      >
                        Daftar di sini
                      </Link>
                    </p>
                  </div>
                </motion.form>
              )}

              {role === "PERUSAHAAN" && (
                <motion.div
                  key="form-perusahaan"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-1 flex-col justify-center"
                >
                  <div className="flex-1 flex flex-col items-center justify-center space-y-6 py-6 text-center">
                    <div className="rounded-full bg-slate-100 p-4">
                      {/* Icon Bangunan/Corporate sederhana */}
                      <svg
                        className="w-8 h-8 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        ></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#283618]">
                        Portal Mitra Perusahaan
                      </h3>
                      <p className="mt-2 text-sm text-slate-500 max-w-[250px] mx-auto">
                        Masuk menggunakan akun Google korporat Anda untuk mulai
                        mengatur logistik dan kargo.
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto shrink-0 pb-6">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={async () => {
                        setIsLoading(true);
                        await signIn("google", { callbackUrl: "/app" });
                      }}
                      className={cn(
                        buttonVariants({
                          variant: "outline",
                          className:
                            "h-14 w-full rounded-xl border-2 text-base font-bold bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-70 disabled:cursor-not-allowed",
                        }),
                      )}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        // Ikon Google
                        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
