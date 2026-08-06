"use client";

import { useEffect, useRef } from "react";
import { createDriver } from "./driverInstance";
import { DriveStep, Driver, Config } from "driver.js";
import { waitForElement } from "./tourController";
import "driver.js/dist/driver.css";

interface PropsDriver {
  steps: DriveStep[];
  autoStart?: boolean;
  configOverrides?: Partial<Config>;
  onDriverCreated?: (driver: Driver) => void;
}

/**
 * Komponen Provider murni untuk menjalankan Driver.js berdasarkan steps yang diberikan.
 */
export default function TourProvider({
  steps,
  autoStart = true,
  configOverrides,
  onDriverCreated,
}: PropsDriver) {
  const driverRef = useRef<Driver | null>(null);

  useEffect(() => {
    if (!autoStart || !steps || steps.length === 0) return;

    let isCancelled = false;

    const startTour = async () => {
      const firstSelector =
        typeof steps[0]?.element === "string" ? steps[0].element : null;

      if (firstSelector) {
        try {
          await waitForElement(firstSelector, 5000);
        } catch {
          // Lanjut jika timeout agar tidak memblokir user
        }
      }

      if (isCancelled) return;

      const driverObj = createDriver(steps, configOverrides);
      driverRef.current = driverObj;

      if (onDriverCreated) {
        onDriverCreated(driverObj);
      }

      driverObj.drive();
    };

    startTour();

    return () => {
      isCancelled = true;
      if (driverRef.current) {
        driverRef.current.destroy();
        driverRef.current = null;
      }
    };
  }, [steps, autoStart, configOverrides, onDriverCreated]);

  return null;
}
