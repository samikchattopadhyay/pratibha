"use client";

import { useState, InputHTMLAttributes } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import FormError from "./FormError";

interface PasswordFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  showRequirements?: boolean;
}

export default function PasswordField({
  label,
  error,
  showRequirements = false,
  value = "",
  className,
  ...props
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const passwordValue = String(value);
  const hasMinLength = passwordValue.length >= 8;
  const hasUpperCase = /[A-Z]/.test(passwordValue);
  const hasNumber = /[0-9]/.test(passwordValue);

  const allRequirementsMet = hasMinLength && hasUpperCase && hasNumber;

  return (
    <div className="space-y-1.5">
      <label className="font-sans text-sm font-bold text-charcoal/80 uppercase">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          className={`w-full font-sans text-base bg-cream border border-terracotta/20 rounded-lg px-4 py-3.5 pr-10 text-charcoal focus:outline-none focus:border-terracotta transition-colors ${
            error ? "border-red-300 focus:border-red-400" : ""
          } ${className || ""}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/60 hover:text-charcoal transition-colors"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>

      {error && <FormError error={error} />}

      {showRequirements && (
        <div className="space-y-1.5 pt-2 border-t border-terracotta/10">
          <p className="text-xs font-sans text-charcoal/70 font-semibold uppercase">
            Password Requirements:
          </p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-sans">
              {hasMinLength ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <X className="w-4 h-4 text-red-400" />
              )}
              <span className={hasMinLength ? "text-green-700" : "text-charcoal/60"}>
                At least 8 characters
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-sans">
              {hasUpperCase ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <X className="w-4 h-4 text-red-400" />
              )}
              <span className={hasUpperCase ? "text-green-700" : "text-charcoal/60"}>
                One uppercase letter (A-Z)
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-sans">
              {hasNumber ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <X className="w-4 h-4 text-red-400" />
              )}
              <span className={hasNumber ? "text-green-700" : "text-charcoal/60"}>
                One number (0-9)
              </span>
            </div>
          </div>
          {allRequirementsMet && (
            <p className="text-xs font-sans text-green-700 font-semibold">
              ✓ Password strength: Strong
            </p>
          )}
        </div>
      )}
    </div>
  );
}
