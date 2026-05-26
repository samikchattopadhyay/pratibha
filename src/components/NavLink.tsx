import Link from "next/link";
import React from "react";

type NavLinkVariant = "nav" | "button" | "subtle" | "ghost" | "underline";
type NavLinkSize = "sm" | "md" | "lg";

interface NavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: NavLinkVariant;
  size?: NavLinkSize;
  isActive?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<NavLinkVariant, string | ((isActive: boolean) => string)> = {
  nav: (isActive) =>
    isActive
      ? "text-terracotta dark:text-gold font-bold"
      : "text-charcoal/75 dark:text-cream/75 hover:text-terracotta dark:hover:text-gold font-semibold",
  button:
    "px-4 py-2.5 rounded-lg bg-terracotta hover:bg-terracotta-light text-cream dark:bg-gold dark:hover:bg-gold-light dark:text-charcoal font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-[1px] transition-all",
  subtle:
    "text-charcoal/80 dark:text-cream/80 hover:text-charcoal dark:hover:text-cream font-semibold transition-colors",
  ghost:
    "text-charcoal/80 dark:text-cream/80 hover:text-terracotta dark:hover:text-gold hover:bg-terracotta/5 dark:hover:bg-gold/5 px-2 py-1 rounded-lg transition-all",
  underline:
    "text-terracotta dark:text-gold hover:text-terracotta-light dark:hover:text-gold-light underline-offset-2 hover:underline font-semibold transition-colors",
};

const sizeStyles: Record<NavLinkSize, string> = {
  sm: "text-sm",
  md: "text-sm",
  lg: "text-base",
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer";

export default function NavLink({
  href,
  variant = "nav",
  size = "md",
  isActive = false,
  className = "",
  children,
  ...props
}: NavLinkProps) {
  const variantClass =
    variant === "nav"
      ? (variantStyles[variant] as (isActive: boolean) => string)(isActive)
      : (variantStyles[variant] as string);

  return (
    <Link
      href={href}
      {...props}
      className={`${baseStyles} ${variantClass} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </Link>
  );
}
