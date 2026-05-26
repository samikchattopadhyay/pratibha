"use client";

import { useSearchParams } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

export interface SettingsSection {
  id: string;
  label: string;
  icon: ReactNode;
  content: ReactNode;
}

interface SettingsLayoutProps {
  sections: SettingsSection[];
  defaultSection?: string;
}

export default function SettingsLayout({
  sections,
  defaultSection,
}: SettingsLayoutProps) {
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const sectionFromUrl = searchParams.get("section");
    const initialSection =
      sectionFromUrl ||
      defaultSection ||
      sections[0]?.id ||
      "";
    Promise.resolve().then(() => {
      setActiveSection(initialSection);
      setMounted(true);
    });
  }, [searchParams, defaultSection, sections]);

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    const params = new URLSearchParams(searchParams);
    params.set("section", sectionId);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  };

  if (!mounted) return null;

  const currentSection = sections.find((s) => s.id === activeSection);

  return (
    <div className="flex gap-6 max-w-6xl">
      {/* Sidebar Menu */}
      <aside className="w-56 flex-shrink-0">
        <nav className="bg-cream dark:bg-charcoal-light border border-terracotta/10 dark:border-terracotta/20 rounded-2xl overflow-hidden sticky top-20">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => handleSectionChange(section.id)}
              className={`w-full flex items-center gap-3 px-6 py-4 text-left border-b border-terracotta/10 dark:border-terracotta/20 transition-colors ${
                index === sections.length - 1 ? "border-b-0" : ""
              } ${
                activeSection === section.id
                  ? "bg-terracotta/10 dark:bg-gold/10 text-terracotta dark:text-gold font-semibold"
                  : "text-charcoal/70 dark:text-cream/70 hover:bg-terracotta/5 dark:hover:bg-gold/5"
              }`}
            >
              <span className="flex-shrink-0 w-5 h-5">{section.icon}</span>
              <span className="text-sm">{section.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <div className="bg-cream dark:bg-charcoal-light border border-terracotta/10 dark:border-terracotta/20 rounded-2xl p-8">
          {currentSection && (
            <>
              <h2 className="text-2xl font-serif font-bold text-charcoal dark:text-cream mb-6">
                {currentSection.label}
              </h2>
              <div>{currentSection.content}</div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
