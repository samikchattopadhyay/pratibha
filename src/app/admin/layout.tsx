"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Header from "@/components/Header";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const getActiveTab = () => {
    const tabParam = searchParams.get("tab");
    if (tabParam) return tabParam;

    if (pathname.includes("/competitions")) return "competitions";
    if (pathname.includes("/judges")) return "judges";
    if (pathname.includes("/finance")) return "finance";
    if (pathname.includes("/facebook")) return "facebook";
    if (pathname.includes("/settings")) return "settings";

    return "dashboard";
  };

  const activeTab = getActiveTab();

  const navigateToTab = (tab: string) => {
    router.push(`/admin/dashboard?tab=${tab}`);
  };

  return (
    <div className="min-h-screen bg-charcoal text-cream flex flex-col font-sans dark">
      <Header />
      <div className="flex flex-1 relative overflow-hidden">
        <AdminSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeTab={activeTab}
          navigateToTab={navigateToTab}
        />
        <div className="flex-1 bg-charcoal overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
