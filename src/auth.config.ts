import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

/**
 * Edge-compatible NextAuth / Auth.js configuration.
 * Contains lightweight callbacks and routing rules without Node runtime dependencies.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        if ("role" in user && user.role) {
          token.role = user.role as Role;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id as string) || (token.sub as string) || "";
        session.user.role = (token.role as Role) || "CUSTOMER";
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
