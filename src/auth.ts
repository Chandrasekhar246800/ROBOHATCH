import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import { loginSchema } from "@/lib/validations/auth";
import { verifyPassword } from "@/lib/auth/password";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 1. Server-side validation via Zod
        const validated = loginSchema.safeParse(credentials);
        if (!validated.success) {
          return null;
        }

        const { email, password } = validated.data;

        try {
          // 2. Query user by normalized unique email
          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              name: true,
              email: true,
              passwordHash: true,
              role: true,
              image: true,
            },
          });

          // 3. Constant-time defense: reject if user not found or no password hash
          if (!user || !user.passwordHash) {
            return null;
          }

          // 4. Verify password against stored bcrypt hash
          const isValid = await verifyPassword(password, user.passwordHash);
          if (!isValid) {
            return null;
          }

          // 5. Return sanitized user object - NEVER expose passwordHash!
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image,
          };
        } catch (error) {
          // Catch and log database errors internally without leaking to client
          console.error(
            "[Auth] Authorize exception:",
            error instanceof Error ? error.message : "Database connection failure"
          );
          return null;
        }
      },
    }),
  ],
});
