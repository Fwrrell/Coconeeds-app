/**
 * Helper storage untuk tour onboarding.
 * Mengelola state alur tour dan status penyelesaian onboarding.
 */

const CURRENT_TOUR_KEY = "coconeeds-current-tour";
const NEXT_TOUR_KEY = "coconeeds-next-tour";
const TOUR_COMPLETED_KEY = "coconeeds-tour-completed";

export function isTourCompleted(): boolean {
  if (typeof window === "undefined") return false;
  return (
    localStorage.getItem(TOUR_COMPLETED_KEY) === "true" ||
    sessionStorage.getItem(TOUR_COMPLETED_KEY) === "true"
  );
}

export function setTourCompleted(completed: boolean = true): void {
  if (typeof window === "undefined") return;
  if (completed) {
    localStorage.setItem(TOUR_COMPLETED_KEY, "true");
    sessionStorage.setItem(TOUR_COMPLETED_KEY, "true");
  } else {
    localStorage.removeItem(TOUR_COMPLETED_KEY);
    sessionStorage.removeItem(TOUR_COMPLETED_KEY);
  }
}

export function resetTour(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOUR_COMPLETED_KEY);
  sessionStorage.removeItem(TOUR_COMPLETED_KEY);
  sessionStorage.removeItem(CURRENT_TOUR_KEY);
  sessionStorage.removeItem(NEXT_TOUR_KEY);
}

export function getCurrentTour(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(CURRENT_TOUR_KEY);
}

export function setCurrentTour(path: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CURRENT_TOUR_KEY, path);
}

export function getNextTour(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(NEXT_TOUR_KEY);
}

export function setNextTour(path: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(NEXT_TOUR_KEY, path);
}

export function consumeNextTour(): string | null {
  if (typeof window === "undefined") return null;
  const next = sessionStorage.getItem(NEXT_TOUR_KEY);
  if (next) {
    sessionStorage.removeItem(NEXT_TOUR_KEY);
  }
  return next;
}

export function clearTourState(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CURRENT_TOUR_KEY);
  sessionStorage.removeItem(NEXT_TOUR_KEY);
}
