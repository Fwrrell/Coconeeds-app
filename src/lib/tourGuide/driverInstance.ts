import { driver, DriveStep, Config, Driver } from "driver.js";
import { driverConfig } from "./driverConfig";

export function createDriver(
  steps: DriveStep[],
  overrides?: Partial<Config>
): Driver {
  return driver({
    ...driverConfig,
    ...overrides,
    steps,
  });
}
