import { NextRequest } from "next/server";
import { getToken, decode } from "next-auth/jwt";
import { cookies } from "next/headers";

export interface EdgeSession {
  user: {
    id: string;
    email: string;
    role: string;
    needsProfileSetup?: boolean;
  };
}

export async function getEdgeSession(req?: NextRequest | Request | any): Promise<EdgeSession | null> {
  if (req) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token || !token.id || !token.email || !token.role) return null;
    return {
      user: {
        id: token.id as string,
        email: token.email as string,
        role: token.role as string,
        needsProfileSetup: token.needsProfileSetup as boolean | undefined,
      },
    };
  }

  // Server Component/Page fallback (no request passed)
  try {
    const cookieStore = await cookies();
    const tokenString = cookieStore.get("next-auth.session-token")?.value || 
                       cookieStore.get("__Secure-next-auth.session-token")?.value;
    if (!tokenString) return null;
    const token = await decode({
      token: tokenString,
      secret: process.env.NEXTAUTH_SECRET || "",
    });
    if (!token || !token.id || !token.email || !token.role) return null;
    return {
      user: {
        id: token.id as string,
        email: token.email as string,
        role: token.role as string,
        needsProfileSetup: token.needsProfileSetup as boolean | undefined,
      },
    };
  } catch (err) {
    console.error("Failed to decode token in Edge Server Component:", err);
    return null;
  }
}
