import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Global Object
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

// konfigurasi SSL opsional berdasarkan environment
const isLocal = !connectionString || connectionString.includes("localhost") || connectionString.includes("127.0.0.1");
const sslConfig = isLocal
  ? undefined
  : {
      rejectUnauthorized: process.env.DB_VERIFY_SSL === "true",
    };

// setup pool dari Postgres
const pool =
  globalForPrisma.pgPool ??
  new Pool({
    connectionString,
    ssl: sslConfig,
  });

// adapter prisma untuk postgresql
const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pgPool = pool;
  globalForPrisma.prisma = prisma;
}

export default prisma;
