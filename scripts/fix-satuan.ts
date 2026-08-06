// scripts/fix-satuan.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// List of liquid products that should have 'Liter' as their unit
const LIQUID_PRODUCTS = [
  "Minyak Kelapa",
  "VCO (Virgin Coconut Oil)",
  "VCO",
  "Minyak Kelapa Murni (VCO)", // Standardized name
  "Air Kelapa",
];

async function main() {
  console.log("Starting data fix for product units...");

  // 1. Standardize "VCO" product names in FarmerInventory
  const updatedInventoryNames = await prisma.farmerInventory.updateMany({
    where: {
      jenisProduk: {
        in: ["VCO", "VCO (Virgin Coconut Oil)"],
      },
    },
    data: {
      jenisProduk: "Minyak Kelapa Murni (VCO)",
    },
  });
  console.log(`Standardized ${updatedInventoryNames.count} FarmerInventory product names to "Minyak Kelapa Murni (VCO)".`);

  // 2. Standardize "VCO" product names in InventoryMutation
  const updatedMutationNames = await prisma.inventoryMutation.updateMany({
    where: {
      komoditas: {
        in: ["VCO", "VCO (Virgin Coconut Oil)"],
      },
    },
    data: {
      komoditas: "Minyak Kelapa Murni (VCO)",
    },
  });
  console.log(`Standardized ${updatedMutationNames.count} InventoryMutation product names.`);

  // 3. Fix units for liquid products in FarmerInventory
  const updatedInventoryUnits = await prisma.farmerInventory.updateMany({
    where: {
      jenisProduk: {
        in: LIQUID_PRODUCTS,
      },
      satuan: "Kg",
    },
    data: {
      satuan: "Liter",
    },
  });
  console.log(`Fixed ${updatedInventoryUnits.count} FarmerInventory records to use 'Liter'.`);

  // 4. Fix units for liquid products in InventoryMutation
  const updatedMutationUnits = await prisma.inventoryMutation.updateMany({
    where: {
      komoditas: {
        in: LIQUID_PRODUCTS,
      },
      satuan: "Kg",
    },
    data: {
      satuan: "Liter",
    },
  });
  console.log(`Fixed ${updatedMutationUnits.count} InventoryMutation records to use 'Liter'.`);

  // 5. Fix units for liquid products in Panen
  const updatedPanenUnits = await prisma.panen.updateMany({
    where: {
      type: {
        in: LIQUID_PRODUCTS,
      },
      satuan: "Kg",
    },
    data: {
      satuan: "Liter",
    },
  });
  console.log(`Fixed ${updatedPanenUnits.count} Panen records to use 'Liter'.`);


  console.log("Data fix complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
