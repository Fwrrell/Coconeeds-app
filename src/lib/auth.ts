import NextAuth, { CredentialsSignin } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./prisma";
import bcrypt from "bcrypt";
import { Role, ApprovalStatus } from "@prisma/client";

class CustomAuthError extends CredentialsSignin {
  code: string;
  constructor(msg: string) {
    super(msg);
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
      profile(profile: Record<string, any>) {
        // fix type error vercel, ganti status ke approvalStatus
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: Role.PERUSAHAAN,
          approvalStatus: ApprovalStatus.PENDING,
        };
      },
    }),

    CredentialsProvider({
      name: "Phone dan PIN",
      credentials: {
        phoneNumber: { label: "Nomor HP", type: "text" },
        pin: { label: "PIN", type: "password" },
      },
      async authorize(credentials: Record<string, any> | undefined) {
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
          approvalStatus: user.approvalStatus,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }: { user: any; account: any }) {
      if (account?.provider === "google" && user.email) {
        const email = user.email.toLowerCase().trim();

        // 1. FIRST check if whitelisted admin
        const isWhitelisted = await prisma.adminWhitelist.findFirst({
          where: { email: { equals: email, mode: "insensitive" } },
        });

        if (isWhitelisted) {
          return true;
        }

        // 2. THEN handle non-whitelisted users
        const dbUser = await prisma.user.findUnique({
          where: { email },
        });

        if (!dbUser) {
          try {
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name,
                image: user.image,
                role: Role.PERUSAHAAN,
                approvalStatus: ApprovalStatus.PENDING,
                accounts: {
                  create: {
                    type: account.type,
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    access_token: account.access_token,
                    refresh_token: account.refresh_token,
                    expires_at: account.expires_at,
                    token_type: account.token_type,
                    scope: account.scope,
                    id_token: account.id_token,
                  },
                },
              },
            });
          } catch (err) {
            console.error("[AUTH_GOOGLE_CREATE_ERR]", err);
          }
          return "/login?error=PendingApproval";
        }

        if (dbUser.approvalStatus === ApprovalStatus.PENDING) {
          return "/login?error=PendingApproval";
        }

        return true;
      }
      return true;
    },

    async jwt({
      token,
      user,
      profile,
    }: {
      token: any;
      user?: any;
      account?: any;
      trigger?: any;
      profile?: any;
    }) {
      if (user && user.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { email: true, role: true, approvalStatus: true },
        });

        if (dbUser) {
          token.id = user.id;

          if (!dbUser.email && profile?.email) {
            try {
              await prisma.user.update({
                where: { id: user.id },
                data: { email: profile.email },
              });
              dbUser.email = profile.email;
            } catch (e) {
              console.error(
                `[AUTH_REPAIR] Failed to repair email for user ${user.id}:`,
                e,
              );
            }
          }

          const email = dbUser.email?.toLowerCase().trim();

          if (email) {
            const whitelistedAdmin = await prisma.adminWhitelist.findFirst({
              where: { email: { equals: email, mode: "insensitive" } },
            });

            if (whitelistedAdmin) {
              if (
                dbUser.role !== Role.ADMIN ||
                dbUser.approvalStatus !== ApprovalStatus.APPROVED
              ) {
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
              token.approvalStatus = ApprovalStatus.APPROVED;
            } else {
              token.role = dbUser.role;
              token.approvalStatus = dbUser.approvalStatus;
            }
          } else {
            token.role = dbUser.role;
            token.approvalStatus = dbUser.approvalStatus;
          }
        }
      } else if (
        token.role === Role.ADMIN &&
        process.env.NEXT_RUNTIME === "nodejs"
      ) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, approvalStatus: true },
        });
        token.role = dbUser?.role ?? undefined;
        token.approvalStatus = dbUser?.approvalStatus ?? undefined;
      }
      return token;
    },

    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.approvalStatus = token.approvalStatus as ApprovalStatus;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});
