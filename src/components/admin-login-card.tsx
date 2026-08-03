"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2, Sprout, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function AdminLoginCard() {
  const [isLoading, setIsLoading] = useState(true); // Start as true to handle initial session check
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Phase 2: Check session on mount (after returning from OAuth)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionRes = await fetch("/api/auth/session");
        if (!sessionRes.ok) { // Not logged in or error
            setIsLoading(false);
            return;
        }
        
        const session = await sessionRes.json();
        
        // Check if there's an active session with a user object
        if (session && session.user && session.user.id) {
          const isApprovedAdmin = session.user.role === "ADMIN" && session.user.status === "APPROVED";
          
          if (isApprovedAdmin) {
            router.replace("/admin");
          } else {
            // Logged in, but not an approved admin. Show error and sign out.
            setError("Email tidak terdaftar sebagai admin platform.");
            await signOut({ redirect: false });
          }
        }
      } catch (e) {
        console.error("Failed to check session", e);
        setError("Gagal memverifikasi sesi Anda.");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router]);


  // Phase 1: Handle the login button click
  const handleAdminLogin = async () => {
    setIsSigningIn(true);
    setError(null);

    const result = await signIn("google", {
      redirect: false,
      callbackUrl: "/admin/login", // Important: callback here to trigger useEffect check
    });

    if (result?.error) {
      setError("Gagal memulai proses login Google. Silakan coba lagi.");
      setIsSigningIn(false);
      return;
    }

    if (result?.url) {
      // Manually navigate to the Google OAuth page
      window.location.href = result.url;
    } else {
      // This case should not happen in a normal flow
      setError("URL otentikasi tidak ditemukan.");
      setIsSigningIn(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center w-full font-['Quicksand',sans-serif]"
    >
      {/* Main Card */}
      <div className="w-full bg-white border border-gray-200 rounded-md p-6 sm:p-10 shadow-none space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Icon Shield */}
          <div className="flex h-14 w-14 items-center justify-center rounded-md bg-[#606C38] text-white">
            <ShieldCheck className="h-7 w-7" />
          </div>

          {/* Teks Header */}
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Otentikasi Administrator
            </h2>
            <p className="text-xs font-medium text-gray-500 max-w-xs">
              Masuk menggunakan akun Google terverifikasi untuk mengakses konsol
              manajemen Coconeeds.
            </p>
          </div>
        </div>
        
        {error && (
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800"
            >
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <p>{error}</p>
            </motion.div>
        )}

        <div className="pt-2">
          <button
            type="button"
            disabled={isLoading || isSigningIn}
            onClick={handleAdminLogin}
            className={cn(
              buttonVariants({
                className:
                  "h-11 w-full rounded-md bg-[#606C38] text-xs font-semibold text-white hover:bg-[#283618] transition-colors shadow-none disabled:opacity-70 disabled:cursor-not-allowed",
              }),
            )}
          >
            {isSigningIn || isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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
            {isSigningIn ? "Mengarahkan..." : isLoading ? "Memeriksa Sesi..." : "Masuk dengan Google Administrator"}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-center gap-2 text-gray-400">
        <Sprout className="h-4 w-4 text-[#606C38]" />
        <span className="text-xs font-bold text-gray-700">Coconeeds</span>
        <span className="text-xs text-gray-400">• © 2026</span>
      </div>
    </motion.div>
  );
}
