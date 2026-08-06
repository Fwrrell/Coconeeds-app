// src/lib/satuan.ts

/**
 * A centralized mapping for product names to their default units.
 * This ensures consistency across the application for liquids vs. solids.
 *
 * Standardized Product Names:
 * "VCO" and "VCO (Virgin Coconut Oil)" are merged into "Minyak Kelapa Murni (VCO)".
 */
export const DEFAULT_SATUAN: Record<string, string> = {
  "Minyak Kelapa": "Liter",
  "Minyak Kelapa Murni (VCO)": "Liter", // Standardized name
  "Air Kelapa": "Liter",
};

/**
 * Gets the default unit for a given product.
 * @param {string} jenisProduk The name of the product.
 * @returns {string} The default unit ('Liter' or 'Kg').
 */
export function getDefaultSatuan(jenisProduk: string): string {
  return DEFAULT_SATUAN[jenisProduk] || "Kg";
}
