import type { DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import { Role, ApprovalStatus } from "@prisma/client";

// augment tipe next-auth dan jwt secara global
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      approvalStatus: ApprovalStatus;
      isVerified?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    approvalStatus: ApprovalStatus;
    isVerified?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: Role;
    approvalStatus?: ApprovalStatus;
    isVerified?: boolean;
  }
}
