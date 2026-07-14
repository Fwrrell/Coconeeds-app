import { PrismaClient } from "../generated/client/client";

const prismaClientSingleton = () => {
  return new PrismaClient({
    // Explicitly inject the pooled connection string into the runtime client
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

export const db = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = db;
