"use client";

import { useEffect, useRef } from "react";
import { createDriver } from "./driverInstance";
import { DriveStep, Driver, Config } from "driver.js";
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

    const driverObj = createDriver(steps, configOverrides);
    driverRef.current = driverObj;

    if (onDriverCreated) {
      onDriverCreated(driverObj);
    }

    driverObj.drive();

    return () => {
      driverObj.destroy();
      driverRef.current = null;
    };
  }, [steps, autoStart, configOverrides, onDriverCreated]);

  return null;
}
