const { PrismaClient, Role, ApprovalStatus } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
require("dotenv").config();

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

// --- Configs ---
const ADMIN_EMAILS = ["muhammadfarrel0@gmail.com"];
// ---------------

const isLocal = !connectionString || connectionString.includes("localhost") || connectionString.includes("127.0.0.1");
const sslConfig = isLocal ? undefined : { rejectUnauthorized: false };

const pool = new Pool({ connectionString, ssl: sslConfig });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seed...");

  for (const email of ADMIN_EMAILS) {
    const normalizedEmail = email.toLowerCase().trim();
    console.log(`\nProcessing admin: ${normalizedEmail}`);

    // --- 1. Upsert AdminWhitelist ---
    const existingWhitelist = await prisma.adminWhitelist.findFirst({
      where: { email: { equals: normalizedEmail, mode: "insensitive" } },
    });

    if (existingWhitelist) {
      const updatedWhitelist = await prisma.adminWhitelist.update({
        where: { id: existingWhitelist.id },
        data: { email: normalizedEmail, addedBy: "seed_script" },
      });
      console.log(`   ✓ AdminWhitelist: Found and updated to canonical email '${updatedWhitelist.email}'`);
    } else {
      const newWhitelist = await prisma.adminWhitelist.create({
        data: { email: normalizedEmail, addedBy: "seed_script" },
      });
      console.log(`   ✓ AdminWhitelist: Created new entry for '${newWhitelist.email}'`);
    }

    // --- 2. Handle User record ---
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: "insensitive" } },
      include: { accounts: true, panens: true, wtbListings: true },
    });
    
    if (existingUser) {
        if (existingUser.accounts && existingUser.accounts.length > 0) {
            // User exists and is linked to an account - promote them
            const updatedUser = await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                    email: normalizedEmail, // ensure canonical email
                    role: Role.ADMIN,
                    approvalStatus: ApprovalStatus.APPROVED,
                }
            });
            console.log(`   ✓ User: Found user with linked account(s). Promoted '${updatedUser.email}' to ADMIN/APPROVED.`);
        } else {
            // User exists but has no linked accounts (orphan)
            if(existingUser.panens.length === 0 && existingUser.wtbListings.length === 0) {
                console.log(`   ! User: Found orphan user (no linked accounts or data). Deleting '${existingUser.email}' to allow clean link on next login.`);
                await prisma.user.delete({ where: { id: existingUser.id } });
                console.log(`   ✓ User: Deleted orphan user.`);
            } else {
                console.log(`   ✗ User: Found orphan user '${existingUser.email}' but it has associated data (panens/wtb). Cannot delete automatically. Please resolve manually.`);
            }
        }
    } else {
        // User does not exist, do nothing. Auth.js will create it on first login.
        console.log(`   ✓ User: No user found for '${normalizedEmail}'. It will be created by Auth.js on first Google login.`);
    }
  }

  console.log("\n🌱 Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
