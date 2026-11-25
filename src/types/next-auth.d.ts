import type { DefaultSession } from "next-auth";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  /**
   * Extends the session user object to include database ID and Role.
   */
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  /**
   * Extends the user object returned by authorize() and adapter.
   */
  interface User {
    role?: Role;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extends JWT token payload with user ID and Role.
   */
  interface JWT {
    id?: string;
    role?: Role;
  }
}
