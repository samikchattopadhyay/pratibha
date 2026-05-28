"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Search } from "lucide-react";
import NavLink from "./NavLink";
import Button from "./Button";

interface FooterProps {
  variant?: "default" | "minimal";
}

export default function Footer({ variant = "default" }: FooterProps) {
  const [certId, setCertId] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (certId.trim()) {
      window.location.href = `/verify/${encodeURIComponent(certId.trim())}`;
    }
  };

  if (variant === "minimal") {
    return (
      <footer className="bg-charcoal text-cream-dark border-t border-gold/20 mt-auto transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
            <p className="font-sans text-cream/40">© {new Date().getFullYear()} Pratibha Parishad Council. All rights reserved.</p>
            <div className="flex gap-6">
              <NavLink href="/privacy-policy" variant="ghost" className="text-xs text-cream/70 hover:text-gold p-0">Privacy Policy</NavLink>
              <NavLink href="/terms-of-use" variant="ghost" className="text-xs text-cream/70 hover:text-gold p-0">Terms of Use</NavLink>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-charcoal text-cream-dark border-t-2 border-gold/30 mt-auto transition-colors duration-300 relative overflow-hidden">
      {/* Subtle Alpana Motif background indicator */}
      <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none select-none">
        <svg width="400" height="400" viewBox="0 0 100 100" fill="currentColor">
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="0.5" fill="none" />
          <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="0.5" fill="none" />
          <path d="M 50 5 L 50 95 M 5 50 L 95 50 M 18 18 L 82 82 M 18 82 L 82 18" stroke="currentColor" strokeWidth="0.3" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <img src="/images/pp-logo.png" alt="Pratibha Parishad Logo" className="h-[60px] object-cover object-center shadow-lg" style={{ width: '180px' }} />
            </Link>
            <p className="font-sans text-sm text-cream/60 leading-relaxed max-w-xs">
              The Global Council for Indian Fine Arts. Dedicated to preserving, promoting, and certifying traditional performing and visual arts digitally.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-base font-bold text-gold tracking-wide uppercase border-b border-gold/10 pb-2">
              Navigation
            </h4>
            <ul className="space-y-2.5">
              <li>
                <NavLink href="/" variant="ghost" className="text-sm p-0 text-cream/80 hover:text-gold">Home</NavLink>
              </li>
              <li>
                <NavLink href="/competitions" variant="ghost" className="text-sm p-0 text-cream/80 hover:text-gold">Competitions</NavLink>
              </li>
              <li>
                <NavLink href="/about" variant="ghost" className="text-sm p-0 text-cream/80 hover:text-gold">About Board</NavLink>
              </li>
              <li>
                <NavLink href="/faq" variant="ghost" className="text-sm p-0 text-cream/80 hover:text-gold">FAQs</NavLink>
              </li>
              <li>
                <NavLink href="/contact" variant="ghost" className="text-sm p-0 text-cream/80 hover:text-gold">Contact Us</NavLink>
              </li>
            </ul>
          </div>

          {/* Core Categories */}
          <div className="space-y-4">
            <h4 className="font-serif text-base font-bold text-gold tracking-wide uppercase border-b border-gold/10 pb-2">
              Fine Arts Divisions
            </h4>
            <ul className="space-y-2.5 font-sans text-sm text-cream/70">
              <li>Bengali Recitation</li>
              <li>Rabindra Sangeet</li>
              <li>Nazrul Geeti</li>
              <li>Classical Dance</li>
              <li>Visual Arts & Drawing</li>
            </ul>
          </div>

          {/* Verification & Support */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-serif text-base font-bold text-gold tracking-wide uppercase border-b border-gold/10 pb-2">
                Verify Credentials
              </h4>
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Certificate ID"
                  value={certId}
                  onChange={(e) => setCertId(e.target.value)}
                  className="w-full font-sans text-base bg-charcoal-light border border-gold/20 rounded-lg px-3 py-2 text-cream placeholder-cream/30 focus:outline-none focus:border-gold transition-colors duration-300"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="p-2.5"
                  title="Verify Certificate"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </form>
            </div>

            <div className="space-y-2 font-sans text-sm text-cream/60">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-gold" />
                <span>support@pratibhaparishad.org</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gold" />
                <span>+91 98300 12345</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-gold" />
                <span>Kolkata Operations Base, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="border-t border-gold/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p className="font-sans text-cream/40">© {new Date().getFullYear()} Pratibha Parishad Council. All rights reserved.</p>
          <div className="flex gap-6">
            <NavLink href="/privacy-policy" variant="ghost" className="text-xs text-cream/70 hover:text-gold p-0">Privacy Policy</NavLink>
            <NavLink href="/terms-of-use" variant="ghost" className="text-xs text-cream/70 hover:text-gold p-0">Terms of Use</NavLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
