"use client";

import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import FormField from "@/components/forms/FormField";
import FormError from "@/components/forms/FormError";
import { loginSchema, type LoginFormData } from "@/schemas/auth";
import { LogIn, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasCustomCallback = !!searchParams.get("callbackUrl");
  const callbackUrl = searchParams.get("callbackUrl") || "/account/dashboard";
  const urlError = searchParams.get("error");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
        callbackUrl,
      });

      if (res?.error) {
        if (res.error === "UNVERIFIED_EMAIL") {
          setError("root", {
            message: "Email not verified. Please check your inbox and verify your email address to continue.",
          });
        } else {
          setError("root", {
            message: "Invalid email address or password combination",
          });
        }
      } else {
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
            try {
              const statusRes = await fetch("/api/account/onboarding-status");
              if (statusRes.ok) {
                const statusData = await statusRes.json();
                if (!statusData.passwordSet || !statusData.phoneSet || !statusData.emailVerified || !statusData.addressSet) {
                  const tokenParam = statusData.setupToken ? `?token=${statusData.setupToken}` : "";
                  router.push(`/onboarding${tokenParam}`);
                  router.refresh();
                  return;
                }
              }
            } catch (err) {
              console.error("Error checking onboarding status:", err);
            }
            targetUrl = "/account/dashboard";
          }
        }

        router.push(targetUrl);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("root", {
        message: "An unexpected error occurred. Please try again.",
      });
    }
  };

  const rootError = errors.root?.message;

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

          {(rootError || urlError === "UNVERIFIED_EMAIL") && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-200 rounded-xl text-red-800 text-sm font-sans space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span>{rootError || (urlError === "UNVERIFIED_EMAIL" ? "Email not verified. Please verify your email address to continue." : "")}</span>
              </div>
              {(rootError?.includes("not verified") || urlError === "UNVERIFIED_EMAIL") && (
                <div className="ml-6 pt-2 text-xs text-red-700">
                  <Link href={`/auth/verify-email?email=${encodeURIComponent(register("email").name)}`} className="text-red-600 font-semibold hover:underline">
                    Resend verification email
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              label="Email Address"
              placeholder="your.email@example.com"
              type="email"
              error={errors.email?.message}
              {...register("email")}
            />

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="font-sans text-sm font-bold text-charcoal/80 uppercase">Password</label>
                <Link href="/forgot-password" className="font-sans text-sm text-terracotta font-semibold hover:underline py-2 px-1 -my-2">Forgot?</Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className={`w-full font-sans text-base bg-cream border border-terracotta/20 rounded-lg px-4 py-3.5 text-charcoal focus:outline-none focus:border-terracotta transition-colors ${
                  errors.password ? "border-red-300 focus:border-red-400" : ""
                }`}
                {...register("password")}
              />
              {errors.password && <FormError error={errors.password.message} />}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
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
