"use client";

import React, { useState, useMemo } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  showRequirements?: boolean;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

function evaluatePasswordStrength(password: string): {
  requirements: PasswordRequirement[];
  strength: "weak" | "fair" | "good" | "strong";
  score: number;
} {
  const requirements: PasswordRequirement[] = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "At least one uppercase letter", met: /[A-Z]/.test(password) },
    { label: "At least one lowercase letter", met: /[a-z]/.test(password) },
    { label: "At least one number", met: /[0-9]/.test(password) },
    { label: "At least one special character", met: /[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>?]/.test(password) },
  ];

  const score = requirements.filter((r) => r.met).length;
  let strength: "weak" | "fair" | "good" | "strong" = "weak";

  if (score >= 4) strength = "strong";
  else if (score === 3) strength = "good";
  else if (score === 2) strength = "fair";
  else strength = "weak";

  return { requirements, strength, score };
}

export default function PasswordInput({
  label,
  showRequirements = true,
  value = "",
  onChange,
  className = "",
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { requirements, strength, score } = useMemo(
    () => evaluatePasswordStrength(String(value) || ""),
    [value]
  );

  const strengthColors = {
    weak: "bg-red-500",
    fair: "bg-yellow-500",
    good: "bg-blue-500",
    strong: "bg-green-600",
  };

  const strengthLabels = {
    weak: "Weak",
    fair: "Fair",
    good: "Good",
    strong: "Strong",
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="font-sans text-sm font-bold text-charcoal/80 uppercase">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          className={`w-full font-sans text-base bg-cream border border-terracotta/20 rounded-lg px-4 py-3.5 pr-12 text-charcoal focus:outline-none focus:border-terracotta transition-colors ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/60 hover:text-charcoal transition-colors p-1"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>

      {value && showRequirements && (
        <div className="space-y-3 mt-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between mb-1">
              <span className="font-sans text-xs font-bold text-charcoal/60 uppercase">
                Password Strength
              </span>
              <span
                className={`font-sans text-xs font-bold px-2 py-0.5 rounded ${
                  strength === "weak"
                    ? "text-red-700 bg-red-100"
                    : strength === "fair"
                      ? "text-yellow-700 bg-yellow-100"
                      : strength === "good"
                        ? "text-blue-700 bg-blue-100"
                        : "text-green-700 bg-green-100"
                }`}
              >
                {strengthLabels[strength]}
              </span>
            </div>
            <div className="w-full bg-charcoal/10 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${strengthColors[strength]}`}
                style={{ width: `${(score / 5) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="font-sans text-xs font-bold text-charcoal/60 uppercase">
              Requirements
            </span>
            <div className="space-y-1">
              {requirements.map((req) => (
                <div
                  key={req.label}
                  className="flex items-center gap-2 font-sans text-xs text-charcoal/70"
                >
                  {req.met ? (
                    <Check className="w-4 h-4 text-green-600 shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-charcoal/30 shrink-0" />
                  )}
                  <span className={req.met ? "text-green-700" : ""}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
