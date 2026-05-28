import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/auth";

export default async function SetupPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Redirect to password setup
  redirect("/auth/setup/set-password");
}
