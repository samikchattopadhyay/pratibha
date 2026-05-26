import React from "react";
import Loading from "./Loading";

type ButtonVariant = "primary" | "secondary" | "destructive" | "outline" | "ghost" | "link";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-terracotta hover:bg-terracotta-light text-cream dark:bg-gold dark:hover:bg-gold-light dark:text-charcoal shadow-md hover:shadow-lg hover:-translate-y-[1px]",
  secondary:
    "bg-charcoal/10 dark:bg-gold/10 text-charcoal dark:text-gold hover:bg-charcoal/20 dark:hover:bg-gold/20 border border-charcoal/20 dark:border-gold/20",
  destructive:
    "bg-red-600 hover:bg-red-700 text-cream dark:bg-red-700 dark:hover:bg-red-800 shadow-md hover:shadow-lg hover:-translate-y-[1px]",
  outline:
    "border border-terracotta/20 dark:border-terracotta/40 text-charcoal dark:text-cream hover:border-terracotta dark:hover:border-gold hover:bg-terracotta/5 dark:hover:bg-gold/5",
  ghost:
    "text-charcoal/80 dark:text-cream/80 hover:text-terracotta dark:hover:text-gold hover:bg-terracotta/5 dark:hover:bg-gold/5",
  link:
    "text-terracotta dark:text-gold hover:text-terracotta-light dark:hover:text-gold-light underline-offset-2 hover:underline",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm font-semibold rounded-lg",
  md: "px-4 py-2.5 text-sm font-bold rounded-lg",
  lg: "px-6 py-3 text-base font-bold rounded-xl",
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 font-sans font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

export default function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {isLoading ? (
        <Loading variant="inline" text="Processing..." className="text-current" />
      ) : (
        children
      )}
    </button>
  );
}
