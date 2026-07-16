"use client";

import { useState, useRef } from "react";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

import { defineStepper } from "@stepperize/react";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
        "Mari mulai perjalanan memberdayakan petani bersama Coconeeds.",
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
      title: "Selesai",
      description: "Pastikan data Anda sudah benar sebelum membuat akun.",
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

const stepVariants = {
  hidden: { opacity: 0, x: 15 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, x: -15, transition: { duration: 0.2 } },
};

export default function UserOnboardingBlock() {
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  return (
    <Stepper.Root
      className="flex min-h-dvh w-full max-w-lg flex-col bg-background px-5 pt-5 pb-6 sm:min-h-[90dvh] sm:rounded-2xl sm:border sm:shadow-sm overflow-hidden"
      linear
      beforeStepChange={async ({ direction, validate }) => {
        if (direction !== "next") {
          setErrors({});
          return true;
        }
        const result = await validate();
        if (!result.success) {
          setErrors(toErrors(result.issues));
          return false;
        }
        setErrors({});
        return true;
      }}
    >
      {({ stepper }) => (
        <>
          {/* Header: Progress bar, Title */}
          <div className="space-y-6 shrink-0 z-10 relative">
            <Stepper.List className="flex w-full items-center justify-between gap-1.5">
              <Stepper.Items>
                {(step, index) => (
                  <Stepper.Item
                    key={step.id}
                    step={step.id}
                    className="relative flex flex-1 justify-center"
                  >
                    <Stepper.Trigger className="flex w-full disabled:cursor-not-allowed">
                      <Stepper.Indicator className="h-2 w-full rounded-full transition-all duration-300 data-[status=active]:bg-[#606C38] data-[status=previous]:bg-[#606C38] data-[status=upcoming]:bg-slate-200" />{" "}
                    </Stepper.Trigger>
                  </Stepper.Item>
                )}
              </Stepper.Items>
            </Stepper.List>

            <motion.div
              key={`header-${stepper.current.id}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#283618]">
                {stepper.current.title}
              </h2>
              <p className="max-w-xs text-base leading-6 text-[#606C38]">
                {stepper.current.description}
              </p>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="mt-8 flex flex-1 flex-col relative">
            <AnimatePresence mode="wait">
              {stepper.current.id === "pengenalan" && (
                <Stepper.Content key="pengenalan" step="pengenalan">
                  <motion.div
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex flex-1 flex-col items-center justify-end"
                  >
                    <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#DDA15E]/20 blur-3xl" />

                    <div className="relative mt-auto translate-y-[20px] sm:translate-y-[24px]">
                      <Image
                        src="/maskot.png"
                        alt="Maskot Coconeeds"
                        width={250}
                        height={250}
                        priority
                        className="relative z-10 w-[240px] h-auto drop-shadow-xl"
                      />
                    </div>
                  </motion.div>
                </Stepper.Content>
              )}

              {stepper.current.id === "account" && (
                <Stepper.Content key="account" step="account">
                  <motion.div
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex flex-1 flex-col justify-center space-y-6"
                  >
                    <AccountFields errors={errors} />
                  </motion.div>
                </Stepper.Content>
              )}

              {stepper.current.id === "security" && (
                <Stepper.Content key="security" step="security">
                  <motion.div
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex flex-1 flex-col justify-center space-y-6"
                  >
                    <SecurityFields errors={errors} />
                  </motion.div>
                </Stepper.Content>
              )}

              {stepper.current.id === "confirm" && (
                <Stepper.Content key="confirm" step="confirm">
                  <motion.div
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex flex-1 items-center justify-center"
                  >
                    <div className="flex w-full flex-col items-center text-center">
                      <div className="relative mb-8">
                        <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#DDA15E]/20 blur-3xl" />
                        <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-[#606C38] text-5xl text-white shadow-xl shadow-[#606C38]/30">
                          ✓
                        </div>
                      </div>
                      <h3 className="text-2xl font-black text-[#283618]">
                        Data Siap Disimpan
                      </h3>
                      <p className="mt-2 max-w-[250px] text-sm leading-6 text-[#606C38]">
                        Tekan <b>Buat Akun</b> di bawah untuk bergabung ke dalam
                        platform.
                      </p>
                    </div>
                  </motion.div>
                </Stepper.Content>
              )}
            </AnimatePresence>
          </div>

          {/* Footer: Action Button */}
          <Stepper.Actions
            className={`
              flex w-full gap-3 pt-6 shrink-0 z-20
              ${stepper.current.id === "pengenalan" ? "pb-2" : "mt-auto pb-2"}
            `}
          >
            {stepper.isLast ? (
              <div className="flex w-full flex-col gap-2">
                {serverError && (
                  <p className="text-center text-sm font-medium text-destructive">
                    {serverError}
                  </p>
                )}
                <div className="flex w-full gap-3">
                  {!stepper.isFirst && (
                    <Stepper.Prev
                      className={buttonVariants({
                        variant: "outline",
                        className:
                          "flex-1 h-14 rounded-xl border-[#606C38] text-[#606C38] font-semibold hover:bg-[#606C38]/5 transition-colors",
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
                          throw new Error(result.message || "Gagal mendaftar");
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
                    className={buttonVariants({
                      className:
                        "flex-1 h-14 rounded-xl bg-[#606C38] text-base font-semibold text-white hover:bg-[#283618] transition-colors shadow-lg shadow-[#606C38]/20 disabled:opacity-70 disabled:cursor-not-allowed",
                    })}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      "Buat Akun"
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
                        "flex-1 h-14 rounded-xl border-[#606C38] text-[#606C38] font-semibold hover:bg-[#606C38]/5 transition-colors",
                    })}
                  >
                    Kembali
                  </Stepper.Prev>
                )}
                <Stepper.Next
                  className={buttonVariants({
                    className:
                      "flex-1 h-14 rounded-xl bg-[#606C38] text-base font-semibold text-white hover:bg-[#283618] transition-colors shadow-lg shadow-[#606C38]/20",
                  })}
                >
                  Lanjut
                </Stepper.Next>
              </div>
            )}
          </Stepper.Actions>
        </>
      )}
    </Stepper.Root>
  );
}

// Komponen Input Akun (Step 2)
function AccountFields({ errors }: { errors: Errors }) {
  const stepper = onboarding.useStepper();
  const account = stepper.data.get("account") ?? { name: "", phoneNumber: "" };
  const set = (patch: Partial<typeof account>) =>
    stepper.data.set("account", { ...account, ...patch });

  return (
    <>
      <Field
        label="Nama Lengkap"
        placeholder="Contoh: Budi Santoso"
        value={account.name}
        error={errors.name}
        onChange={(event) => set({ name: event.target.value })}
        className="h-14 rounded-xl"
      />
      <div className="space-y-2">
        <Label className="text-[#283618] font-semibold">Nomor Handphone</Label>
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
          className="h-14 rounded-xl"
        />
        {errors.phoneNumber && (
          <p className="text-xs font-medium text-destructive">
            {errors.phoneNumber}
          </p>
        )}
      </div>
    </>
  );
}

// Komponen Input PIN 6 Box
function SecurityFields({ errors }: { errors: Errors }) {
  const stepper = onboarding.useStepper();
  const security = stepper.data.get("security") ?? { pin: "" };
  const set = (patch: Partial<typeof security>) =>
    stepper.data.set("security", { ...security, ...patch });

  const inputRef = useRef<HTMLInputElement>(null);
  const pinArray = Array.from({ length: 6 });

  return (
    <div className="space-y-4">
      <Label className="text-center sm:text-left block text-[#283618] font-semibold">
        PIN 6 Angka
      </Label>

      <div
        className="relative flex w-full justify-between gap-2"
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
        />

        {pinArray.map((_, index) => {
          const char = security.pin[index];
          const isActive = security.pin.length === index;

          return (
            <div
              key={index}
              className={`flex h-14 w-12 items-center justify-center rounded-xl border-2 bg-background text-3xl font-bold transition-all sm:h-16 sm:w-14
                ${isActive ? "border-[#606C38] ring-4 ring-[#606C38]/10" : "border-slate-200"}
                ${char ? "border-[#606C38] text-[#283618]" : "text-transparent"}
              `}
            >
              {char ? "•" : ""}
            </div>
          );
        })}
      </div>

      {errors.pin && (
        <p className="text-xs text-center sm:text-left font-medium text-destructive">
          {errors.pin}
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  error,
  className,
  ...props
}: { label: string; error?: string; className?: string } & React.ComponentProps<
  typeof Input
>) {
  return (
    <div className="space-y-2">
      <Label className="text-[#283618] font-semibold">{label}</Label>
      <Input
        aria-invalid={error ? true : undefined}
        className={className}
        {...props}
      />
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
