"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import TourProvider from "./TourProvider";
import { Driver, DriveStep } from "driver.js";
import {
  consumeNextTour,
  setCurrentTour,
  isTourCompleted,
} from "./tourStorage";
import { isFirstTourPage, hasTourConfig } from "./tourFlow";
import {
  createStepsForPath,
  attachSidebarMenuListener,
} from "./tourController";

export default function TourLauncher() {
  const pathname = usePathname();
  const router = useRouter();
  const driverRef = useRef<Driver | null>(null);
  const [activeSteps, setActiveSteps] = useState<DriveStep[] | null>(null);

  const getDriver = useCallback(() => driverRef.current, []);

  useEffect(() => {
    if (!pathname || !hasTourConfig(pathname)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveSteps(null);
      return;
    }

    // Jika tour sudah selesai (onboarding complete), jangan jalankan tour lagi
    if (isTourCompleted()) {
      setActiveSteps(null);
      return;
    }

    const nextTour = consumeNextTour();
    const isStartPage = isFirstTourPage(pathname);
    const isFromPreviousTour = nextTour === pathname;

    if (isStartPage || isFromPreviousTour) {
      setCurrentTour(pathname);
      const steps = createStepsForPath(pathname, router, getDriver);
      setActiveSteps(steps);
    } else {
      setActiveSteps(null);
    }

    const SIDEBAR_NAV_TARGETS: Record<
      string,
      { selector: string; targetPath: string; isFinal?: boolean }
    > = {
      "/app": {
        selector: '[data-tour="menu-lahan"]',
        targetPath: "/app/lahan",
      },
      "/app/lahan": {
        selector: '[data-tour="menu-produksi"]',
        targetPath: "/app/produksi",
      },
      "/app/produksi": {
        selector: '[data-tour="menu-pengiriman"]',
        targetPath: "/app/pengiriman",
      },
      "/app/pengiriman": {
        selector: '[data-tour="menu-Ecopoint"]',
        targetPath: "/app/eco-points",
      },
      "/app/eco-points": {
        selector: '[data-tour="menu-dashboard"]',
        targetPath: "/app",
        isFinal: true,
      },
    };

    let cleanupSidebar: (() => void) | undefined;
    const navConfig = SIDEBAR_NAV_TARGETS[pathname];
    if (navConfig) {
      cleanupSidebar = attachSidebarMenuListener(
        navConfig.selector,
        navConfig.targetPath,
        getDriver,
        navConfig.isFinal,
      );
    }

    return () => {
      if (cleanupSidebar) {
        cleanupSidebar();
      }
    };
  }, [pathname, router, getDriver]);

  const handleDriverCreated = useCallback((driver: Driver) => {
    driverRef.current = driver;
  }, []);

  if (!activeSteps || activeSteps.length === 0) {
    return null;
  }

  return (
    <TourProvider
      key={pathname}
      steps={activeSteps}
      autoStart
      onDriverCreated={handleDriverCreated}
    />
  );
}
