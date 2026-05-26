"use client";

import React, { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ToastProvider } from "./ToastProvider";

function ThemeManager({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const htmlElement = document.documentElement;
    const isAdminOrJudge = pathname.startsWith("/admin") || pathname.startsWith("/judge");

    if (isAdminOrJudge) {
      htmlElement.classList.add("dark");
    } else {
      htmlElement.classList.remove("dark");
    }
  }, [pathname]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <ThemeManager>{children}</ThemeManager>
      </ToastProvider>
    </SessionProvider>
  );
}
