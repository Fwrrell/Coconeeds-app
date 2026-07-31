import type { DefaultSession } from "next-auth";
import { Role, ApprovalStatus } from "@prisma/client";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      role: Role;
      status: ApprovalStatus;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    status: ApprovalStatus;
  }
}
