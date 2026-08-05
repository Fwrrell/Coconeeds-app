"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import TourProvider from "./TourProvider";
import { Driver, DriveStep } from "driver.js";
import { consumeNextTour, setCurrentTour } from "./tourStorage";
import { isFirstTourPage, hasTourConfig } from "./tourFlow";
import {
  createStepsForPath,
  attachSidebarMenuListener,
} from "./tourController";

/**
 * TourLauncher adalah satu-satunya entry point yang menentukan tour apa yang berjalan
 * berdasarkan pathname dan alur tour di sessionStorage.
 */
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

    const nextTour = consumeNextTour();
    const isStartPage = isFirstTourPage(pathname);
    const isFromPreviousTour = nextTour === pathname;

    // Tour hanya boleh berjalan jika merupakan halaman awal atau berasal dari tour sebelumnya.
    // Jika user membuka URL secara manual maka tour tidak otomatis dimulai.
    if (isStartPage || isFromPreviousTour) {
      setCurrentTour(pathname);
      const steps = createStepsForPath(pathname, router, getDriver);
      setActiveSteps(steps);
    } else {
      setActiveSteps(null);
    }

    let cleanupSidebar: (() => void) | undefined;
    if (pathname === "/app") {
      cleanupSidebar = attachSidebarMenuListener(
        '[data-tour="menu-lahan"]',
        "/app/lahan",
        getDriver,
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
