import { Driver, DriveStep } from "driver.js";
import { setNextTour, clearTourState, setTourCompleted } from "./tourStorage";
import { TOUR_STEP_FACTORIES, StepContext } from "./tourFlow";

const dialogRegistry: Record<string, (() => void) | undefined> = {};
export function registerDialog(key: string, fn: () => void) {
  dialogRegistry[key] = fn;
}
export function waitForElement(
  selector: string,
  timeoutMs: number = 5000,
): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(selector) as HTMLElement | null;
    if (existing) {
      resolve(existing);
      return;
    }

    let timeoutId: number | null = null;

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector) as HTMLElement | null;
      if (el) {
        if (timeoutId !== null) clearTimeout(timeoutId);
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    timeoutId = window.setTimeout(() => {
      observer.disconnect();
      reject(
        new Error(
          `Timeout menunggu elemen "${selector}" muncul di DOM setelah ${timeoutMs}ms.`,
        ),
      );
    }, timeoutMs);
  });
}

export function waitForElementToDisappear(
  selector: string,
  timeoutMs: number = 3000,
): Promise<void> {
  return new Promise((resolve) => {
    const el = document.querySelector(selector);
    if (!el) {
      resolve();
      return;
    }

    let timeoutId: number | null = null;

    const observer = new MutationObserver(() => {
      const stillThere = document.querySelector(selector);
      if (!stillThere) {
        if (timeoutId !== null) clearTimeout(timeoutId);
        observer.disconnect();
        resolve();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    timeoutId = window.setTimeout(() => {
      observer.disconnect();
      resolve();
    }, timeoutMs);
  });
}

export async function openDialogAndProceed(
  driver: Driver | null,
  dialogKey: string,
  selectorAfterOpen: string,
) {
  if (!driver) return;

  const dialog = dialogRegistry[dialogKey];

  if (!dialog) {
    console.warn(dialogKey + " belum diregister");
    return;
  }
  dialog();
  try {
    if (dialogKey.startsWith("close-")) {
      await waitForElementToDisappear('[role="dialog"]');
    }
    await waitForElement(selectorAfterOpen);

    driver.moveNext();
  } catch (err) {
    console.error(err);
  }
}

export function destroyTour(getDriver?: () => Driver | null): void {
  setTourCompleted(true);
  clearTourState();
  if (getDriver) {
    const driver = getDriver();
    if (driver) {
      driver.destroy();
    }
  }
}

/**
 * Mengembalikan selector yang sesuai tergantung tampilan Desktop vs Mobile (Island Nav)
 */
export function getNavSelector(
  desktopSelector: string,
  mobileSelector: string,
): string {
  if (typeof window !== "undefined" && window.innerWidth < 768) {
    return mobileSelector;
  }
  return desktopSelector;
}

export function attachSidebarMenuListener(
  menuSelector: string,
  targetPath: string,
  getDriver: () => Driver | null,
  isFinal?: boolean,
): () => void {
  const menuElements = document.querySelectorAll(menuSelector);
  if (!menuElements || menuElements.length === 0) return () => {};

  const handleClick = () => {
    if (isFinal) {
      destroyTour(getDriver);
    } else {
      setNextTour(targetPath);
      const driver = getDriver();
      if (driver) {
        driver.destroy();
      }
    }
  };

  menuElements.forEach((el) => el.addEventListener("click", handleClick));
  return () => {
    menuElements.forEach((el) => el.removeEventListener("click", handleClick));
  };
}

export function createStepsForPath(
  pathname: string,
  router: { push: (url: string) => void },
  getDriver: () => Driver | null,
): DriveStep[] {
  const factory = TOUR_STEP_FACTORIES[pathname];
  if (!factory) return [];

  const context: StepContext = {
    getDriver,
    navigateToNext: (targetPath: string) => {
      setNextTour(targetPath);
      const driver = getDriver();
      if (driver) {
        driver.destroy();
      }
      router.push(targetPath);
    },
    onOpenDialogAndProceed: (dialogKey: string, selector: string) => {
      openDialogAndProceed(getDriver(), dialogKey, selector);
    },
  };

  return factory(context);
}

/**
 * Handler saat tour selesai atau di-destroy
 */
export function handleTourDestroyed(): void {
  // Hanya membersihkan state tour jika tidak sedang berpindah ke halaman berikutnya
}
