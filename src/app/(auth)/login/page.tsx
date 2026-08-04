"use client";

import React, { useRef, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
import { buttonVariants } from "@/components/ui/button";
import {
  Loader2,
  Sprout,
  Building2,
  Phone,
  Lock,
  ArrowLeft,
  LogIn,
} from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type RoleType = "PETANI" | "PERUSAHAAN";
type LoginStep = "NOMOR" | "PIN";

export default function LoginPage() {
  const [role, setRole] = useState<RoleType>("PETANI");

  // State petani
  const [loginStep, setLoginStep] = useState<LoginStep>("NOMOR");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");

  // Global state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // tangkep error dr callback auth js trs kluarin toast
  const searchParams = useSearchParams();
  useEffect(() => {
    const errParam = searchParams?.get("error");
    if (errParam === "PendingApproval") {
      toast.error("Akun Anda terdaftar sebagai Mitra dan sedang menunggu verifikasi Admin.");
    }
  }, [searchParams]);

  const inputPinRef = useRef<HTMLInputElement>(null);
  const pinArray = Array.from({ length: 6 });

  const handlePetaniLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate step 1: check phone number
    if (loginStep === "NOMOR") {
      if (phoneNumber.length < 10) {
        setError("Nomor Telepon minimal 10 angka.");
        return;
      }
      setLoginStep("PIN");
      return;
    }

    // Validate step 2: check pin
    if (loginStep === "PIN") {
      if (pin.length !== 6) {
        setError("PIN harus 6 angka.");
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
        setError("Terjadi kesalahan pada sistem. Coba lagi.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBackToNomor = () => {
    setLoginStep("NOMOR");
    setPin("");
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between max-w-lg mx-auto w-full bg-white sm:border-x sm:border-gray-200 font-['Quicksand',sans-serif] relative">
      {/* Scrollable Main Content */}
      <div className="flex-1 overflow-y-auto pb-28 p-5 sm:p-6 space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-2 pt-2 pb-1 border-b border-gray-100">
          <div className="h-9 w-9 rounded-lg bg-[#606C38] text-white flex items-center justify-center shrink-0">
            <Sprout className="h-5 w-5" />
          </div>
          <span className="text-xl font-extrabold text-gray-900 tracking-tight">
            Coconeeds
          </span>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Masuk Akun
          </h1>
          <p className="text-sm font-medium text-gray-500">
            Masuk ke sistem logistik & pasar komoditas kelapa.
          </p>
        </div>

        {/* Role Capsule Toggle */}
        <div className="flex w-full bg-gray-100 p-1 rounded-xl border border-gray-200">
          {(["PETANI", "PERUSAHAAN"] as const).map((r) => {
            const isActive = role === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRole(r);
                  setError(null);
                }}
                className={cn(
                  "flex flex-1 items-center justify-center py-2.5 text-xs font-bold rounded-lg transition-all",
                  isActive
                    ? "bg-white text-[#606C38] shadow-none border border-gray-200"
                    : "text-gray-500 hover:text-gray-800",
                )}
              >
                {r === "PERUSAHAAN"
                  ? "MITRA PERUSAHAAN"
                  : "PETANI / POS KOPDES"}
              </button>
            );
          })}
        </div>

        {/* Error Notification Alert */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-center text-xs font-bold text-red-600">
            {error}
          </div>
        )}

        {/* Form Body */}
        <div>
          {role === "PETANI" && (
            <form
              id="login-form"
              onSubmit={handlePetaniLogin}
              className="space-y-5"
            >
              {loginStep === "NOMOR" ? (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#606C38]" />
                    Nomor Handphone Terdaftar
                  </Label>
                  <Input
                    placeholder="Contoh: 081234567890"
                    value={phoneNumber}
                    onChange={(e) =>
                      setPhoneNumber(e.target.value.replace(/\D/g, ""))
                    }
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={15}
                    className="h-14 rounded-xl border-gray-300 focus:border-[#606C38] focus:ring-[#606C38] text-lg px-4"
                    autoFocus
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Lock className="h-4 w-4 text-[#606C38]" />
                      PIN Keamanan 6 Digit
                    </Label>
                    <span className="text-xs font-bold text-[#606C38] bg-[#606C38]/10 px-2.5 py-1 rounded-md">
                      {phoneNumber}
                    </span>
                  </div>

                  {/* 6-box OTP-style PIN Layout */}
                  <div
                    className="relative flex justify-center gap-2 sm:gap-3 w-full my-4 cursor-pointer"
                    onClick={() => inputPinRef.current?.focus()}
                  >
                    <input
                      ref={inputPinRef}
                      value={pin}
                      onChange={(e) =>
                        setPin(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="absolute inset-0 z-10 w-full opacity-0 cursor-pointer"
                      autoFocus
                    />
                    {pinArray.map((_, index) => {
                      const char = pin[index];
                      const isActive = pin.length === index;
                      return (
                        <div
                          key={index}
                          className={cn(
                            "w-12 h-14 sm:w-14 sm:h-16 flex items-center justify-center text-center text-3xl font-bold border-2 rounded-xl transition-colors outline-none",
                            isActive
                              ? "border-[#606C38] ring-2 ring-[#606C38]/20 bg-white"
                              : "border-gray-200 bg-white",
                            char
                              ? "border-[#606C38] text-gray-900"
                              : "text-transparent",
                          )}
                        >
                          {char ? "•" : ""}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </form>
          )}

          {role === "PERUSAHAAN" && (
            <div className="space-y-6 py-2">
              <div className="text-center space-y-2 border border-gray-200 bg-gray-50/50 p-6 rounded-xl">
                <Building2 className="mx-auto h-10 w-10 text-[#606C38]" />
                <h3 className="text-base font-bold text-gray-900">
                  Portal Off-taker & Perusahaan
                </h3>
                <p className="text-xs font-medium text-gray-500 max-w-xs mx-auto">
                  Akses instan untuk negosiasi WTB, pemesanan kargo, dan
                  transparansi kontrak logistik.
                </p>
              </div>

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
                      "h-14 w-full rounded-xl border-gray-300 text-base font-bold bg-white text-gray-700 hover:bg-gray-50 shadow-none disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2",
                  }),
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
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
                Masuk dengan Google Korporat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 w-full max-w-lg mx-auto p-4 bg-white border-t border-gray-100 z-20 space-y-2">
        {role === "PETANI" && (
          <div className="space-y-2">
            <button
              type="submit"
              form="login-form"
              disabled={isLoading}
              className={cn(
                buttonVariants({
                  className:
                    "w-full h-14 rounded-xl bg-[#606C38] text-white text-lg font-semibold hover:bg-[#283618] transition-colors flex items-center justify-center gap-2 shadow-none disabled:opacity-70 disabled:cursor-not-allowed",
                }),
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Memproses...
                </>
              ) : loginStep === "NOMOR" ? (
                <>
                  Lanjutkan <LogIn className="h-5 w-5" />
                </>
              ) : (
                <>
                  Masuk Sekarang <LogIn className="h-5 w-5" />
                </>
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
                      "w-full h-11 rounded-xl text-sm font-semibold text-gray-600 border-gray-300 hover:bg-gray-50 shadow-none disabled:opacity-70 flex items-center justify-center gap-1.5",
                  }),
                )}
              >
                <ArrowLeft className="h-4 w-4" /> Ubah Nomor HP
              </button>
            )}
          </div>
        )}

        <div className="text-center pt-1 pb-2">
          <p className="text-xs font-medium text-gray-500">
            Belum memiliki akun?{" "}
            <Link
              href="/register"
              className="font-bold text-[#606C38] hover:underline"
            >
              Daftar Akun Baru
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
