"use client";

import {
  Menu, LayoutDashboard, Calendar, Scale, DollarSign, Database, Settings
} from "lucide-react";
import Button from "@/components/Button";

interface AdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeTab: string;
  navigateToTab: (tab: string) => void;
}

export default function AdminSidebar({
  sidebarOpen,
  setSidebarOpen,
  activeTab,
  navigateToTab,
}: AdminSidebarProps) {
  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "competitions", label: "Competitions", icon: Calendar },
    { id: "judges", label: "Judges", icon: Scale },
    { id: "finance", label: "Finance & Revenue", icon: DollarSign },
    { id: "facebook", label: "FB Scraper Info", icon: Database },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  return (
    <aside className={`${sidebarOpen ? "w-48" : "w-16"} bg-charcoal-light border-r border-terracotta/15 flex flex-col transition-all duration-300 z-30`}>
      <div className="p-4 border-b border-terracotta/15 flex items-center justify-between">
        <span className={`${sidebarOpen ? "block" : "hidden"} text-sm font-bold uppercase tracking-wider text-gold`}>
          Control Deck
        </span>
        <Button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          variant="ghost"
          size="md"
          className="p-1 text-terracotta"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>
      
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {sidebarItems.map(item => {
          const IconComp = item.icon;
          const isSelected = activeTab === item.id;
          return (
            <Button
              key={item.id}
              onClick={() => navigateToTab(item.id)}
              variant={isSelected ? "primary" : "ghost"}
              size="md"
              className={`w-full justify-start h-auto ${isSelected ? "shadow-md" : ""}`}
              title={item.label}
            >
              <IconComp className="w-4 h-4 shrink-0" />
              <span className={`${sidebarOpen ? "block" : "hidden"} truncate text-sm`}>{item.label}</span>
            </Button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-terracotta/15 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-terracotta/20 text-gold flex items-center justify-center font-bold text-xs">
          AD
        </div>
        <div className={`${sidebarOpen ? "block" : "hidden"} truncate text-sm`}>
          <p className="font-bold">Super Admin</p>
          <p className="text-cream/50">admin@pratibhaparishad.org</p>
        </div>
      </div>
    </aside>
  );
}
