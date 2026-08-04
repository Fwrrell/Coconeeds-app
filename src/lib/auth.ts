import NextAuth, { CredentialsSignin, Profile } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./prisma";
import bcrypt from "bcrypt";
import { Role, ApprovalStatus } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role: Role;
    status: ApprovalStatus;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: Role;
    status?: ApprovalStatus;
  }
}

class CustomAuthError extends CredentialsSignin {
  constructor(msg: string) {
    super();
    this.code = msg;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: Role.PETANI, // Default role
          status: ApprovalStatus.PENDING, // Default status
        };
      },
    }),

    CredentialsProvider({
      name: "Phone dan PIN",
      credentials: {
        phoneNumber: { label: "Nomor HP", type: "text" },
        pin: { label: "PIN", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.phoneNumber || !credentials?.pin) {
          throw new CustomAuthError("Nomor HP dan PIN wajib diisi");
        }
        const user = await prisma.user.findUnique({
          where: { phoneNumber: credentials.phoneNumber as string },
        });
        if (!user || !user.pin) {
          throw new CustomAuthError("Nomor HP tidak terdaftar.");
        }
        const isPinValid = await bcrypt.compare(
          credentials.pin as string,
          user.pin,
        );
        if (!isPinValid) {
          throw new CustomAuthError("PIN yang Anda masukkan salah.");
        }
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          status: user.approvalStatus,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account, trigger, profile }) {
      if (user && user.id) {
        // This branch runs only on initial sign-in
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { email: true, role: true, approvalStatus: true },
        });

        if (dbUser) {
          token.id = user.id;

          // Repair email if it's missing in DB but present in OAuth profile
          if (!dbUser.email && profile?.email) {
            try {
              await prisma.user.update({
                where: { id: user.id },
                data: { email: profile.email },
              });
              dbUser.email = profile.email; // Update in-memory for this run
              console.log(
                `[AUTH_REPAIR] Repaired missing email for user ${user.id} to ${profile.email}`,
              );
            } catch (e) {
              console.error(
                `[AUTH_REPAIR] Failed to repair email for user ${user.id}:`,
                e,
              );
            }
          }

          const email = dbUser.email?.toLowerCase().trim();

          console.log(
            `[AUTH_DIAGNOSTIC] JWT Sign-In Trigger: ${trigger}, Provider: ${account?.provider}, Email: ${email}`,
          );

          if (email) {
            const whitelistedAdmin = await prisma.adminWhitelist.findFirst({
              where: { email: { equals: email, mode: "insensitive" } },
            });

            if (whitelistedAdmin) {
              console.log(`[AUTH_DIAGNOSTIC] Whitelist HIT for ${email}.`);
              if (
                dbUser.role !== Role.ADMIN ||
                dbUser.approvalStatus !== ApprovalStatus.APPROVED
              ) {
                console.log(
                  `[AUTH_DIAGNOSTIC] Promoting ${email} to ADMIN/APPROVED.`,
                );
                const updatedUser = await prisma.user.update({
                  where: { id: user.id },
                  data: {
                    role: Role.ADMIN,
                    approvalStatus: ApprovalStatus.APPROVED,
                  },
                });
                dbUser.role = updatedUser.role;
                dbUser.approvalStatus = updatedUser.approvalStatus;
              }
              token.role = Role.ADMIN;
              token.status = ApprovalStatus.APPROVED;
            } else if (trigger === "signUp" && account?.provider === "google") {
              console.log(
                `[AUTH_DIAGNOSTIC] New Google user ${email}. Setting to PERUSAHAAN/PENDING.`,
              );
              const updatedUser = await prisma.user.update({
                where: { id: user.id },
                data: {
                  role: Role.PERUSAHAAN,
                  approvalStatus: ApprovalStatus.PENDING,
                },
              });
              dbUser.role = updatedUser.role;
              dbUser.approvalStatus = updatedUser.approvalStatus;

              token.role = Role.PERUSAHAAN;
              token.status = ApprovalStatus.PENDING;
            } else {
              // Existing user, not whitelisted
              console.log(
                `[AUTH_DIAGNOSTIC] Existing user ${email}. Role: ${dbUser.role}`,
              );
              token.role = dbUser.role;
              token.status = dbUser.approvalStatus;
            }
          } else {
            // User has no email (e.g., credentials user), use existing DB roles
            token.role = dbUser.role;
            token.status = dbUser.approvalStatus;
          }
        }
      } else if (
        token.role === Role.ADMIN &&
        process.env.NEXT_RUNTIME === "nodejs"
      ) {
        // For existing ADMIN sessions, re-validate against the DB on each request
        // in Node.js runtime only. This prevents proxy crashes on Edge.
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, approvalStatus: true },
        });
        token.role = dbUser?.role ?? undefined;
        token.status = dbUser?.approvalStatus ?? undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.status = token.status as ApprovalStatus;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});
