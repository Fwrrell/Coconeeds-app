"use client";

import { useState, useRef } from "react";
import { z } from "zod";
import { signIn } from "next-auth/react";
import {
  Loader2,
  Sprout,
  CheckCircle2,
  User,
  Phone,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  Tractor,
  Store,
} from "lucide-react";

import { defineStepper } from "@stepperize/react";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Schema untuk input account dan security validation
const accountSchema = z.object({
  name: z.string().min(3, "Nama Lengkap minimal 3 huruf"),
  phoneNumber: z
    .string()
    .min(10, "Nomor HP minimal 10 angka")
    .regex(/^[0-9]+$/, "Nomor HP hanya boleh berisi angka"),
});

const securitySchema = z.object({
  pin: z
    .string()
    .length(6, "PIN wajib 6 angka")
    .regex(/^[0-9]+$/, "PIN hanya boleh berisi angka"),
});

// Item stepper
const onboarding = defineStepper(
  [
    {
      id: "pengenalan",
      title: "Selamat Datang",
      description:
        "Pilih peran Anda dalam ekosistem logistik kelapa Coconeeds.",
    },
    {
      id: "account",
      title: "Data Diri",
      description: "Masukkan nama lengkap dan nomor telepon aktif Anda.",
      schema: accountSchema,
    },
    {
      id: "security",
      title: "Keamanan Akun",
      description: "Buat 6 digit PIN untuk keamanan masuk Anda nanti.",
      schema: securitySchema,
    },
    {
      id: "confirm",
      title: "Konfirmasi Akun",
      description: "Pastikan data Anda sudah benar sebelum mendaftar.",
    },
  ] as const,
  {
    defaultData: {
      account: { name: "", phoneNumber: "" },
      security: { pin: "" },
    },
  },
);

const { Stepper } = onboarding;
type Errors = Record<string, string>;

function toErrors(
  issues: ReadonlyArray<{ message: string; path?: ReadonlyArray<unknown> }>,
): Errors {
  const out: Errors = {};
  for (const issue of issues) {
    const seg = issue.path?.[0];
    const key =
      typeof seg === "object" && seg !== null
        ? String((seg as { key: PropertyKey }).key)
        : String(seg ?? "_");
    out[key] ??= issue.message;
  }
  return out;
}

export default function UserOnboardingBlock() {
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<"PETANI" | "POS">("PETANI");

  return (
    <Stepper.Root
      className="min-h-screen flex flex-col justify-between max-w-lg mx-auto w-full bg-white sm:border-x sm:border-gray-200 font-['Quicksand',sans-serif] relative"
      linear
      beforeStepChange={async ({ direction, validate }) => {
        if (direction !== "next") {
          setErrors({});
          return true;
        }
        const result = await validate();
        if (!result.success) {
          setErrors(toErrors((result as any).issues));
          return false;
        }
        setErrors({});
        return true;
      }}
    >
      {({ stepper }) => (
        <>
          {/* Scrollable Main Body */}
          <div className="flex-1 overflow-y-auto pb-28 p-5 sm:p-6 space-y-6">
            {/* Top Brand Header */}
            <div className="flex items-center gap-2 pt-2 pb-1 border-b border-gray-100">
              <div className="h-9 w-9 rounded-lg bg-[#606C38] text-white flex items-center justify-center shrink-0">
                <Sprout className="h-5 w-5" />
              </div>
              <span className="text-xl font-extrabold text-gray-900 tracking-tight">
                Coconeeds
              </span>
            </div>

            {/* Stepper Progress Bar */}
            <div className="space-y-4">
              <Stepper.List className="flex w-full items-center justify-between gap-2">
                <Stepper.Items>
                  {(step) => (
                    <Stepper.Item
                      key={step.id}
                      step={step.id}
                      className="relative flex flex-1 justify-center"
                    >
                      <Stepper.Trigger className="flex w-full disabled:cursor-not-allowed">
                        <Stepper.Indicator className="h-2 w-full rounded-full transition-all duration-300 data-[status=active]:bg-[#606C38] data-[status=previous]:bg-[#606C38] data-[status=upcoming]:bg-gray-200" />
                      </Stepper.Trigger>
                    </Stepper.Item>
                  )}
                </Stepper.Items>
              </Stepper.List>

              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  {stepper.current.title}
                </h1>
                <p className="text-sm font-medium text-gray-500">
                  {stepper.current.description}
                </p>
              </div>
            </div>

            {/* Step Contents */}
            <div className="pt-2">
              {stepper.current.id === "pengenalan" && (
                <Stepper.Content step="pengenalan">
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Pilih Profil Pendaftaran
                    </p>

                    {/* Blocky Selection Card 1 */}
                    <div
                      onClick={() => setSelectedRole("PETANI")}
                      className={cn(
                        "w-full p-5 border border-gray-200 rounded-xl mb-3 flex items-center justify-between cursor-pointer transition-colors shadow-none",
                        selectedRole === "PETANI"
                          ? "border-[#606C38] bg-[#606C38]/5 text-gray-900 font-bold"
                          : "bg-white text-gray-700 hover:border-gray-300",
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                            selectedRole === "PETANI"
                              ? "bg-[#606C38] text-white"
                              : "bg-gray-100 text-gray-600",
                          )}
                        >
                          <Tractor className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-900">
                            Petani / Kelompok Tani
                          </h3>
                          <p className="text-xs font-medium text-gray-500 mt-0.5">
                            Menjual hasil panen kelapa & menyetorkan komoditas
                            ke Kopdes.
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        className={cn(
                          "h-5 w-5 shrink-0",
                          selectedRole === "PETANI"
                            ? "text-[#606C38]"
                            : "text-gray-400",
                        )}
                      />
                    </div>
                  </div>
                </Stepper.Content>
              )}

              {stepper.current.id === "account" && (
                <Stepper.Content step="account">
                  <div className="space-y-5">
                    <AccountFields errors={errors} />
                  </div>
                </Stepper.Content>
              )}

              {stepper.current.id === "security" && (
                <Stepper.Content step="security">
                  <div className="space-y-5">
                    <SecurityFields errors={errors} />
                  </div>
                </Stepper.Content>
              )}

              {stepper.current.id === "confirm" && (
                <Stepper.Content step="confirm">
                  <div className="flex flex-col items-center justify-center text-center space-y-4 py-6 border border-gray-200 rounded-xl bg-gray-50/50 p-6">
                    <div className="h-16 w-16 rounded-full bg-[#606C38]/10 text-[#606C38] flex items-center justify-center">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Data Pendaftaran Lengkap
                      </h3>
                      <p className="text-sm font-medium text-gray-500 mt-1 max-w-xs mx-auto">
                        Tekan tombol <b>Buat Akun Sekarang</b> di bawah untuk
                        langsung mendaftar dan masuk ke sistem.
                      </p>
                    </div>
                  </div>
                </Stepper.Content>
              )}
            </div>
          </div>

          {/* Native App Fixed Bottom Action Bar */}
          <div className="fixed bottom-0 left-0 right-0 w-full max-w-lg mx-auto p-4 bg-white border-t border-gray-100 z-20">
            <Stepper.Actions className="flex w-full gap-3">
              {stepper.isLast ? (
                <div className="flex w-full flex-col gap-2">
                  {serverError && (
                    <p className="text-center text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                      {serverError}
                    </p>
                  )}
                  <div className="flex w-full gap-3">
                    {!stepper.isFirst && (
                      <Stepper.Prev
                        className={buttonVariants({
                          variant: "outline",
                          className:
                            "w-1/3 h-14 rounded-xl border-gray-300 text-gray-700 font-semibold text-base shadow-none hover:bg-gray-50 cursor-pointer",
                        })}
                      >
                        Kembali
                      </Stepper.Prev>
                    )}
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={async () => {
                        setIsSubmitting(true);
                        setServerError(null);

                        const account = stepper.data.get("account");
                        const security = stepper.data.get("security");

                        try {
                          const res = await fetch("/api/register", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              name: account?.name,
                              phoneNumber: account?.phoneNumber,
                              pin: security?.pin,
                            }),
                          });

                          const result = await res.json();

                          if (!res.ok) {
                            throw new Error(
                              result.message || "Gagal mendaftar",
                            );
                          }

                          const signInResult = await signIn("credentials", {
                            phoneNumber: account?.phoneNumber,
                            pin: security?.pin,
                            redirect: false,
                          });

                          if (signInResult?.error) {
                            throw new Error(
                              "Pendaftaran berhasil, tetapi gagal masuk otomatis.",
                            );
                          }

                          window.location.href = "/app";
                        } catch (error: any) {
                          console.error(error);
                          setServerError(error.message);
                        } finally {
                          setIsSubmitting(false);
                        }
                      }}
                      className={cn(
                        buttonVariants({
                          className:
                            "flex-1 h-14 rounded-xl bg-[#606C38] text-white text-lg font-semibold hover:bg-[#283618] transition-colors shadow-none disabled:opacity-70 disabled:cursor-not-allowed",
                        }),
                      )}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        "Buat Akun Sekarang"
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex w-full gap-3">
                  {!stepper.isFirst && (
                    <Stepper.Prev
                      className={buttonVariants({
                        variant: "outline",
                        className:
                          "w-1/3 h-14 rounded-xl border-gray-300 text-gray-700 font-semibold text-base shadow-none hover:bg-gray-50",
                      })}
                    >
                      Kembali
                    </Stepper.Prev>
                  )}
                  <Stepper.Next
                    className={cn(
                      buttonVariants({
                        className:
                          "flex-1 h-14 rounded-xl bg-[#606C38] text-white text-lg font-semibold hover:bg-[#283618] transition-colors shadow-none cursor-pointer",
                      }),
                    )}
                  >
                    Lanjut <ArrowRight className="ml-2 h-5 w-5" />
                  </Stepper.Next>
                </div>
              )}
            </Stepper.Actions>
          </div>
        </>
      )}
    </Stepper.Root>
  );
}

// Input Akun (Step 2)
function AccountFields({ errors }: { errors: Errors }) {
  const stepper = onboarding.useStepper();
  const account = stepper.data.get("account") ?? { name: "", phoneNumber: "" };
  const set = (patch: Partial<typeof account>) =>
    stepper.data.set("account", { ...account, ...patch });

  return (
    <>
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <User className="h-4 w-4 text-[#606C38]" /> Nama Lengkap Petani
        </Label>
        <Input
          placeholder="Contoh: Budi Santoso"
          value={account.name}
          onChange={(event) => set({ name: event.target.value })}
          className="h-14 rounded-xl border-gray-300 focus:border-[#606C38] focus:ring-[#606C38] text-lg px-4"
        />
        {errors.name && (
          <p className="text-xs font-bold text-red-600 mt-1">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Phone className="h-4 w-4 text-[#606C38]" /> Nomor Handphone
        </Label>
        <Input
          placeholder="Contoh: 081234567890"
          value={account.phoneNumber}
          onChange={(event) =>
            set({ phoneNumber: event.target.value.replace(/\D/g, "") })
          }
          aria-invalid={errors.phoneNumber ? true : undefined}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={15}
          className="h-14 rounded-xl border-gray-300 focus:border-[#606C38] focus:ring-[#606C38] text-lg px-4"
        />
        {errors.phoneNumber && (
          <p className="text-xs font-bold text-red-600 mt-1">
            {errors.phoneNumber}
          </p>
        )}
      </div>
    </>
  );
}

// Input PIN 6 Box OTP Style (Step 3)
function SecurityFields({ errors }: { errors: Errors }) {
  const stepper = onboarding.useStepper();
  const security = stepper.data.get("security") ?? { pin: "" };
  const set = (patch: Partial<typeof security>) =>
    stepper.data.set("security", { ...security, ...patch });

  const inputRef = useRef<HTMLInputElement>(null);
  const pinArray = Array.from({ length: 6 });

  return (
    <div className="space-y-4">
      <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-[#606C38]" /> Buat PIN Keamanan (6
        Digit Angka)
      </Label>
      <p className="text-xs font-medium text-gray-500">
        PIN ini akan digunakan setiap kali Anda masuk ke akun.
      </p>

      {/* 6-box OTP-style Layout */}
      <div
        className="relative flex justify-center gap-2 sm:gap-3 w-full my-4 cursor-pointer"
        onClick={() => inputRef.current?.focus()}
      >
        <input
          ref={inputRef}
          value={security.pin}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "").slice(0, 6);
            set({ pin: val });
          }}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          className="absolute inset-0 z-10 w-full cursor-text opacity-0"
          autoFocus
        />

        {pinArray.map((_, index) => {
          const char = security.pin[index];
          const isActive = security.pin.length === index;

          return (
            <div
              key={index}
              className={cn(
                "w-12 h-14 sm:w-14 sm:h-16 flex items-center justify-center text-center text-3xl font-bold border-2 rounded-xl transition-colors outline-none",
                isActive
                  ? "border-[#606C38] ring-2 ring-[#606C38]/20 bg-white"
                  : "border-gray-200 bg-white",
                char ? "border-[#606C38] text-gray-900" : "text-transparent",
              )}
            >
              {char ? "•" : ""}
            </div>
          );
        })}
      </div>

      {errors.pin && (
        <p className="text-xs text-center font-bold text-red-600">
          {errors.pin}
        </p>
      )}
    </div>
  );
}
