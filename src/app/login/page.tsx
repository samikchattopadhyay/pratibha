"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import { LogIn, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasCustomCallback = !!searchParams.get("callbackUrl");
  const callbackUrl = searchParams.get("callbackUrl") || "/parent/dashboard";
  const urlError = searchParams.get("error");

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(urlError === "UNVERIFIED_EMAIL" ? "" : "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
        callbackUrl,
      });

      if (res?.error) {
        if (res.error === "UNVERIFIED_EMAIL") {
          setError(`Email not verified. Please check your inbox and verify your email address to continue.`);
        } else {
          setError("Invalid email address or password combination");
        }
        setLoading(false);
      } else {
        // Fetch current session to determine user role and target dashboard
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();
        const role = sessionData?.user?.role;

        let targetUrl = callbackUrl;
        if (!hasCustomCallback) {
          if (role === "SUPER_ADMIN" || role === "MODERATOR") {
            targetUrl = "/admin/dashboard";
          } else if (role === "JUDGE") {
            targetUrl = "/judge/dashboard";
          } else if (role === "PARENT") {
            // For PARENT users, check if onboarding is complete
            try {
              const statusRes = await fetch("/api/parent/onboarding-status");
              if (statusRes.ok) {
                const statusData = await statusRes.json();
                if (!statusData.passwordSet || !statusData.phoneSet || !statusData.emailVerified || !statusData.addressSet) {
                  // Onboarding incomplete, redirect to onboarding
                  const tokenParam = statusData.setupToken ? `?token=${statusData.setupToken}` : "";
                  router.push(`/onboarding${tokenParam}`);
                  router.refresh();
                  setLoading(false);
                  return;
                }
              }
            } catch (err) {
              console.error("Error checking onboarding status:", err);
              // Continue to dashboard on error
            }
            targetUrl = "/parent/dashboard";
          }
        }

        router.push(targetUrl);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <>
      <Header />
      
      <main className="flex-1 bg-cream py-16 px-4 flex items-center justify-center alpana-pattern">
        <div className="w-full max-w-md bg-cream border border-terracotta/10 rounded-2xl p-8 shadow-xl relative overflow-hidden">
          
          <div className="absolute right-0 top-0 opacity-[0.03] pointer-events-none select-none text-terracotta">
            <svg width="150" height="150" viewBox="0 0 100 100" fill="currentColor">
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1" fill="none" />
            </svg>
          </div>

          <div className="text-center space-y-2 mb-8">
            <h1 className="font-serif text-3xl font-bold text-charcoal">
              Welcome <span className="text-terracotta">Back</span>
            </h1>
            <p className="font-sans text-sm text-charcoal/60 uppercase font-bold tracking-wider">
              Student & Parent Portal Login
            </p>
          </div>

          {(error || urlError === "UNVERIFIED_EMAIL") && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-200 rounded-xl text-red-800 text-sm font-sans space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span>{error || (urlError === "UNVERIFIED_EMAIL" ? "Email not verified. Please verify your email address to continue." : "")}</span>
              </div>
              {(error?.includes("not verified") || urlError === "UNVERIFIED_EMAIL") && (
                <div className="ml-6 pt-2 text-xs text-red-700">
                  <Link href={`/auth/verify-email?email=${encodeURIComponent(formData.email)}`} className="text-red-600 font-semibold hover:underline">
                    Resend verification email
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-sans text-sm font-bold text-charcoal/80 uppercase">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full font-sans text-base bg-cream border border-terracotta/20 rounded-lg px-4 py-3.5 text-charcoal focus:outline-none focus:border-terracotta transition-colors"
                placeholder="your.email@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="font-sans text-sm font-bold text-charcoal/80 uppercase">Password</label>
                <Link href="/forgot-password" className="font-sans text-sm text-terracotta font-semibold hover:underline py-2 px-1 -my-2">Forgot?</Link>
              </div>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full font-sans text-base bg-cream border border-terracotta/20 rounded-lg px-4 py-3.5 text-charcoal focus:outline-none focus:border-terracotta transition-colors"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In</span>
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-terracotta/5 text-center font-sans text-sm text-charcoal/60">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-terracotta font-bold hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Loading variant="screen" />}>
      <LoginForm />
    </Suspense>
  );
}
