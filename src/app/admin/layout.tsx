"use client";

import { useState } from "react";
import Header from "@/components/Header";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigateToTab = (tab: string) => {
    // Navigation handled by Header/Sidebar onClick handlers
  };

  return (
    <div className="min-h-screen bg-charcoal text-cream flex flex-col font-sans dark">
      <Header />
      <div className="flex flex-1 relative overflow-hidden">
        <AdminSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeTab=""
          navigateToTab={navigateToTab}
        />
        <main className="flex-1 bg-charcoal overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
