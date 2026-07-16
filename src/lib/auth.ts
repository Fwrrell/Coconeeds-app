import NextAuth, { CredentialsSignin } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import prisma from "./prisma";
import bcrypt from "bcrypt";

class CustomAuthError extends CredentialsSignin {
  constructor(msg: string) {
    super();
    this.code = msg;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    // OAuth Provider untuk ADMIN / PERUSAHAAN
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Credentials (Phone Number + PIN) Provider untuk PETANI
    CredentialsProvider({
      name: "Phone dan PIN",
      credentials: {
        phoneNumber: { label: "Nomor HP", type: "text" },
        pin: { label: "PIN", type: "password" },
      },
      async authorize(credentials) {
        // cek input
        if (!credentials?.phoneNumber || !credentials?.pin) {
          throw new CustomAuthError("Nomor HP dan PIN wajib diisi");
        }

        // cari petani di db dari nomor hp
        const user = await prisma.user.findUnique({
          where: { phoneNumber: credentials.phoneNumber as string },
        });

        // kalo usernya gaada
        if (!user || !user.pin) {
          throw new CustomAuthError("Nomor HP tidak terdaftar.");
        }

        // verify PIN
        const isPinValid = await bcrypt.compare(
          credentials.pin as string,
          user.pin,
        );
        if (!isPinValid) {
          throw new CustomAuthError("PIN yang Anda masukkan salah.");
        }

        // return data user
        return {
          id: user.id,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    // Inject role ke jwt dan session
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "google") {
          token.role = "PERUSAHAAN";
        } else if ("role" in user) {
          token.role = user.role; // PETANI | PERUSAHAAN | ADMIN
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});
