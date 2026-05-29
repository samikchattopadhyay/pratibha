"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import FormField from "@/components/forms/FormField";
import FormError from "@/components/forms/FormError";
import PasswordField from "@/components/forms/PasswordField";
import { FacebookLoginButton } from "@/components/auth/FacebookLoginButton";
import { registerSchema, type RegisterFormData } from "@/schemas/auth";
import { UserPlus, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        setError("root", {
          message: responseData.error || "Something went wrong. Please check your entries.",
        });
      } else {
        router.push("/login?callbackUrl=/account/dashboard&registered=true");
      }
    } catch (err) {
      console.error(err);
      setError("root", {
        message: "An unexpected error occurred. Please try again.",
      });
    }
  };

  const rootError = errors.root?.message;
  const passwordValue = watch("password");

  return (
    <>
      <Header />

      <main className="flex-1 bg-cream py-16 px-4 flex items-center justify-center alpana-pattern">
        <div className="w-full max-w-2xl bg-cream border border-terracotta/10 rounded-2xl p-8 shadow-xl relative overflow-hidden">

          <div className="text-center space-y-2 mb-8">
            <h1 className="font-serif text-3xl font-bold text-charcoal">
              Create <span className="text-terracotta">Parent Account</span>
            </h1>
            <p className="font-sans text-sm text-charcoal/60 uppercase font-bold tracking-wider">
              Register to participate in global council competitions
            </p>
          </div>

          {rootError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-200 rounded-xl text-red-800 text-sm font-sans flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{rootError}</span>
            </div>
          )}

          <div className="mb-6">
            <FacebookLoginButton />
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-terracotta/20"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-cream text-charcoal/60 font-bold uppercase tracking-wider">
                Or register with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            <div className="space-y-4">
              <h3 className="font-serif text-base font-bold text-terracotta border-b border-terracotta/5 pb-1">
                Account Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Parent Full Name"
                  placeholder="John Doe"
                  error={errors.name?.message}
                  {...register("name")}
                />
                <FormField
                  label="Mobile Number (WhatsApp)"
                  type="tel"
                  placeholder="+91 98306 12345"
                  error={errors.phone?.message}
                  {...register("phone")}
                />
                <FormField
                  label="Email Address"
                  type="email"
                  placeholder="your.email@example.com"
                  error={errors.email?.message}
                  {...register("email")}
                />
                <PasswordField
                  label="Create Password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  showRequirements={true}
                  value={passwordValue}
                  {...register("password")}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Parent Profile</span>
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-terracotta/5 text-center font-sans text-sm text-charcoal/60">
            Already have an account?{" "}
            <Link href="/login" className="text-terracotta font-bold hover:underline">
              Log In
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
