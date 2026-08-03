import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// helper initials avatar buat profil petani
export function getAvatarInitials(name?: string | null): string {
  if (!name) return "US";
  const trimmed = name.trim();
  if (!trimmed) return "US";

  const words = trimmed.split(/\s+/);
  if (words.length === 1) {
    return trimmed.substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
}
