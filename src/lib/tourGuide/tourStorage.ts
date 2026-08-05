/**
 * Helper storage untuk tour onboarding.
 * Hanya mengelola "current tour" dan "next tour" di sessionStorage.
 */

const CURRENT_TOUR_KEY = "coconeeds-current-tour";
const NEXT_TOUR_KEY = "coconeeds-next-tour";

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
