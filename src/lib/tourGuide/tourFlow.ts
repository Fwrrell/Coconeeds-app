import { DriveStep, Driver } from "driver.js";
import { getDashboardSteps } from "./steps/dashboard";
import { getLahanSteps } from "./steps/lahan";
import { getProduksiSteps } from "./steps/produksi";
import { getPengirimanSteps } from "./steps/pengiriman";
import { getEcoSteps } from "./steps/ecopoint";
import { destroyTour } from "./tourController";

/**
 * Urutan alur tour onboarding di seluruh aplikasi.
 *
 * Pengembangan alur tour di masa depan sangat mudah:
 * 1. Buat file baru di `/lib/tourGuide/steps/<nama_page>.ts`
 * 2. Daftarkan rutenya di `TOUR_FLOW_ORDER` di bawah ini
 * 3. Daftarkan builder fungsinya di `TOUR_STEP_FACTORIES`
 */
export const TOUR_FLOW_ORDER = [
  "/app",
  "/app/lahan",
  "/app/produksi",
  "/app/pengiriman",
  "/app/eco-points",
] as const;

export type TourPath = (typeof TOUR_FLOW_ORDER)[number] | string;

export interface StepContext {
  getDriver: () => Driver | null;
  navigateToNext: (targetPath: string) => void;
  onOpenDialogAndProceed?: (
    dialogKey: string,
    selectorAfterOpen: string,
  ) => void;
}

export type StepFactory = (context: StepContext) => DriveStep[];

export const TOUR_STEP_FACTORIES: Record<string, StepFactory> = {
  "/app": (context) =>
    getDashboardSteps(() => context.navigateToNext("/app/lahan")),
  "/app/lahan": (context: StepContext) =>
    getLahanSteps(
      {
        getDriver: context.getDriver,
        onOpenDialogAndProceed: context.onOpenDialogAndProceed ?? (() => {}),
      },
      () => context.navigateToNext("/app/produksi"),
    ),
  "/app/produksi": (context: StepContext) =>
    getProduksiSteps(
      {
        getDriver: context.getDriver,
        onOpenDialogAndProceed: context.onOpenDialogAndProceed ?? (() => {}),
      },
      () => context.navigateToNext("/app/pengiriman"),
    ),
  "/app/pengiriman": (context: StepContext) =>
    getPengirimanSteps(
      {
        getDriver: context.getDriver,
        onOpenDialogAndProceed: context.onOpenDialogAndProceed ?? (() => {}),
      },
      () => context.navigateToNext("/app/eco-points"),
    ),
  "/app/eco-points": (context: StepContext) =>
    getEcoSteps(
      {
        getDriver: context.getDriver,
        onOpenDialogAndProceed: context.onOpenDialogAndProceed ?? (() => {}),
      },
      () => {
        destroyTour(context.getDriver);
        context.navigateToNext("/app");
      },
    ),
};

/**
 * Mendapatkan rute tour berikutnya dalam urutan alur.
 */
export function getNextFlowPath(currentPath: string): string | null {
  const currentIndex = (TOUR_FLOW_ORDER as readonly string[]).indexOf(
    currentPath,
  );
  if (currentIndex >= 0 && currentIndex < TOUR_FLOW_ORDER.length - 1) {
    return TOUR_FLOW_ORDER[currentIndex + 1];
  }
  return null;
}

/**
 * Mengecek apakah rute saat ini adalah halaman awal tour onboarding.
 */
export function isFirstTourPage(pathname: string): boolean {
  return pathname === TOUR_FLOW_ORDER[0];
}

/**
 * Mengecek apakah rute memiliki konfigurasi step tour yang terdaftar.
 */
export function hasTourConfig(pathname: string): boolean {
  return Boolean(TOUR_STEP_FACTORIES[pathname]);
}
