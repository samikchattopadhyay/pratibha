import React from "react";

interface LoadingProps {
  variant?: "inline" | "overlay" | "screen";
  text?: string;
  className?: string;
}

export default function Loading({
  variant = "inline",
  text = "Loading...",
  className = "",
}: LoadingProps) {
  const spinnerSvg = (
    <svg
      className={`animate-spin ${
        variant === "inline" ? "w-4 h-4 text-current" : "w-12 h-12 text-gold"
      }`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  if (variant === "overlay") {
    return (
      <div className={`fixed inset-0 bg-charcoal/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}>
        <div className="bg-white dark:bg-charcoal-light border border-terracotta/20 dark:border-terracotta/30 rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm w-full mx-4 transition-all animate-in fade-in zoom-in-95 duration-200">
          {spinnerSvg}
          {text && (
            <p className="text-charcoal dark:text-cream font-sans font-bold text-sm tracking-wide text-center">
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (variant === "screen") {
    return (
      <div className={`min-h-screen bg-cream dark:bg-charcoal flex flex-col items-center justify-center p-6 ${className}`}>
        <div className="bg-white dark:bg-charcoal-light border border-terracotta/20 dark:border-terracotta/30 rounded-2xl p-8 shadow-xl flex flex-col items-center gap-4 max-w-sm w-full mx-4 transition-all">
          <div className="relative flex items-center justify-center">
            {/* Pulsing glow under the spinner for premium feel */}
            <div className="absolute w-16 h-16 bg-gold/10 rounded-full blur-xl animate-pulse" />
            {spinnerSvg}
          </div>
          {text && (
            <p className="text-charcoal dark:text-cream font-sans font-bold text-sm tracking-wide text-center animate-pulse">
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  // default 'inline' variant
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {spinnerSvg}
      {text && <span className="font-sans font-semibold text-sm">{text}</span>}
    </div>
  );
}
