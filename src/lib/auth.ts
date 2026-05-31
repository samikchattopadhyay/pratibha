import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";
import { getUserByEmail, getUserByFacebookId } from "@/lib/db/queries";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await getUserByEmail(credentials.email);

          if (!user) {
            return null;
          }

          // CRITICAL: Check if password hash exists (not OAuth-only user)
          if (!user.passwordHash) {
            console.warn(
              `Login attempt with password on OAuth-only user: ${credentials.email}`
            );
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!isValid) {
            console.warn(`Invalid password for: ${credentials.email}`);
            return null;
          }

          // CRITICAL: Check if email is verified (after password validation)
          console.log(`User ${credentials.email} - emailVerified: ${user.emailVerified}, type: ${typeof user.emailVerified}`);
          if (!user.emailVerified) {
            console.warn(
              `Login attempt with unverified email: ${credentials.email}`
            );
            const error = new Error("UNVERIFIED_EMAIL") as Error & { code?: string };
            error.code = "UNVERIFIED_EMAIL";
            throw error;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.email.split("@")[0],
            role: user.role,
          };
        } catch (error) {
          if (error instanceof Error && error.message === "UNVERIFIED_EMAIL") {
            throw error;
          }
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_APP_ID || "",
      clientSecret: process.env.FACEBOOK_APP_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.type === "oauth") {
        token.needsProfileSetup = true;
      }
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        const customUser = session.user as {
          id?: string;
          role?: string;
          needsProfileSetup?: boolean;
        };
        customUser.id = token.id as string;
        customUser.role = token.role as string;
        customUser.needsProfileSetup = token.needsProfileSetup as boolean;
      }
      return session;
    },
    async signIn({ account }) {
      if (account?.provider === "facebook") {
        // Facebook login is allowed; setup flow happens on client
        return true;
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
export default authOptions;
