"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import { UserPlus, AlertCircle } from "lucide-react";
import { INDIA_STATES } from "@/lib/constants";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    city: "",
    state: "",
    preferredState: "",
    postalCode: "",
    country: "India",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please check your entries.");
        setLoading(false);
      } else {
        router.push("/login?callbackUrl=/parent/dashboard&registered=true");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      
      <main className="flex-1 bg-cream py-16 px-4 flex items-center justify-center alpana-pattern">
        <div className="w-full max-w-2xl bg-cream border border-terracotta/10 rounded-2xl p-8 shadow-xl relative overflow-hidden">
          
          <div className="text-center space-y-2 mb-8">
            <h1 className="font-serif text-3xl font-bold text-charcoal">
              Create <span className="text-terracotta">Parent Account</span>
            </h1>
            <p className="font-sans text-sm text-charcoal/60 uppercase font-bold tracking-wider">
              Register to participate in global council competitions
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-200 rounded-xl text-red-800 text-sm font-sans flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Grid 1: Basic Info */}
            <div className="space-y-4">
              <h3 className="font-serif text-base font-bold text-terracotta border-b border-terracotta/5 pb-1">
                Account Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-sans text-sm font-bold text-charcoal/80 uppercase">Parent Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full font-sans text-base bg-cream border border-terracotta/20 rounded-lg px-4 py-3.5 text-charcoal focus:outline-none focus:border-terracotta transition-colors"
                    placeholder="Avik Chattopadhyay"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-sans text-sm font-bold text-charcoal/80 uppercase">Mobile Number (WhatsApp)</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full font-sans text-base bg-cream border border-terracotta/20 rounded-lg px-4 py-3.5 text-charcoal focus:outline-none focus:border-terracotta transition-colors"
                    placeholder="9830098300"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-sans text-sm font-bold text-charcoal/80 uppercase">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full font-sans text-base bg-cream border border-terracotta/20 rounded-lg px-4 py-3.5 text-charcoal focus:outline-none focus:border-terracotta transition-colors"
                    placeholder="parent@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-sans text-sm font-bold text-charcoal/80 uppercase">Create Password</label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full font-sans text-base bg-cream border border-terracotta/20 rounded-lg px-4 py-3.5 text-charcoal focus:outline-none focus:border-terracotta transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Grid 2: Shipping Address */}
            <div className="space-y-4">
              <h3 className="font-serif text-base font-bold text-terracotta border-b border-terracotta/5 pb-1">
                Postal Address (For Physical Medal Shipping)
              </h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="font-sans text-sm font-bold text-charcoal/80 uppercase">Street Address</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full font-sans text-base bg-cream border border-terracotta/20 rounded-lg px-4 py-3.5 text-charcoal focus:outline-none focus:border-terracotta transition-colors"
                    placeholder="House No, Apartment Name, Street, Locality"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-sans text-sm font-bold text-charcoal/80 uppercase">City</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full font-sans text-base bg-cream border border-terracotta/20 rounded-lg px-4 py-3.5 text-charcoal focus:outline-none focus:border-terracotta transition-colors"
                      placeholder="Kolkata"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-sans text-sm font-bold text-charcoal/80 uppercase">PIN / Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      required
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="w-full font-sans text-base bg-cream border border-terracotta/20 rounded-lg px-4 py-3.5 text-charcoal focus:outline-none focus:border-terracotta transition-colors"
                      placeholder="700019"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-sans text-sm font-bold text-charcoal/80 uppercase">State of Residence</label>
                    <select
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full font-sans text-base bg-cream border border-terracotta/20 rounded-lg px-4 py-3.5 text-charcoal focus:outline-none focus:border-terracotta transition-colors"
                    >
                      <option value="">Select State</option>
                      {INDIA_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-sans text-sm font-bold text-charcoal/80 uppercase">Preferred State for Competitions</label>
                    <select
                      name="preferredState"
                      required
                      value={formData.preferredState}
                      onChange={handleChange}
                      className="w-full font-sans text-base bg-cream border border-terracotta/20 rounded-lg px-4 py-3.5 text-charcoal focus:outline-none focus:border-terracotta transition-colors"
                    >
                      <option value="">Select State (Default: Same as Residence)</option>
                      {INDIA_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Parent Profile</span>
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-terracotta/5 text-center font-sans text-sm text-charcoal/60">
            Already have an account?{" "}
            <Link href="/login" className="text-terracotta font-bold hover:underline">
              Log In
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
