"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import SettingsLayout, { SettingsSection } from "@/components/SettingsLayout";

export default function ParentProfilePage() {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    profileImageUrl: "",
  });

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/account/profile");
      if (response.ok) {
        const data = await response.json();
        setFormData(data);
      } else {
        setErrorMessage("Failed to load profile data");
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      setErrorMessage("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      Promise.resolve().then(() => {
        fetchProfile();
      });
    }
  }, [status, router, fetchProfile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setFormData((prev) => ({
          ...prev,
          profileImageUrl: base64,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          profileImage: formData.profileImageUrl.startsWith("data:") ? formData.profileImageUrl : null,
        }),
      });

      if (response.ok) {
        setSuccessMessage("Profile updated successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        const data = await response.json();
        setErrorMessage(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setErrorMessage("Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return <Loading variant="screen" text="Loading profile..." />;
  }

  const sections: SettingsSection[] = [
    {
      id: "account",
      label: "Account",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      content: (
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4 pb-6 border-b border-terracotta/10 dark:border-terracotta/20">
            <div className="w-24 h-24 rounded-full bg-terracotta/10 dark:bg-gold/10 border-2 border-terracotta/20 dark:border-gold/20 flex items-center justify-center overflow-hidden">
              {formData.profileImageUrl && formData.profileImageUrl.startsWith("data:") ? (
                <img src={formData.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : formData.profileImageUrl ? (
                <img src={formData.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-12 h-12 text-terracotta/40 dark:text-gold/40" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                </svg>
              )}
            </div>
            <label className="px-4 py-2 rounded-lg bg-terracotta/10 dark:bg-gold/10 text-terracotta dark:text-gold font-semibold text-sm cursor-pointer hover:bg-terracotta/20 dark:hover:bg-gold/20 transition-colors">
              Change Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-charcoal/70 dark:text-cream/70 mb-2">
              Email (Read-only)
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-3 rounded-xl border border-terracotta/10 bg-terracotta/5 dark:bg-gold/5 text-charcoal dark:text-cream/70 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-charcoal dark:text-cream mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-terracotta/20 dark:border-terracotta/40 bg-white dark:bg-charcoal/50 text-charcoal dark:text-cream placeholder:text-charcoal/40 dark:placeholder:text-cream/40 focus:outline-none focus:border-terracotta dark:focus:border-gold transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-charcoal dark:text-cream mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-terracotta/20 dark:border-terracotta/40 bg-white dark:bg-charcoal/50 text-charcoal dark:text-cream placeholder:text-charcoal/40 dark:placeholder:text-cream/40 focus:outline-none focus:border-terracotta dark:focus:border-gold transition-colors"
            />
          </div>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={submitting}
          >
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      ),
    },
    {
      id: "address",
      label: "Address",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-charcoal dark:text-cream mb-2">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-terracotta/20 dark:border-terracotta/40 bg-white dark:bg-charcoal/50 text-charcoal dark:text-cream placeholder:text-charcoal/40 dark:placeholder:text-cream/40 focus:outline-none focus:border-terracotta dark:focus:border-gold transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-charcoal dark:text-cream mb-2">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-terracotta/20 dark:border-terracotta/40 bg-white dark:bg-charcoal/50 text-charcoal dark:text-cream placeholder:text-charcoal/40 dark:placeholder:text-cream/40 focus:outline-none focus:border-terracotta dark:focus:border-gold transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-charcoal dark:text-cream mb-2">
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-terracotta/20 dark:border-terracotta/40 bg-white dark:bg-charcoal/50 text-charcoal dark:text-cream placeholder:text-charcoal/40 dark:placeholder:text-cream/40 focus:outline-none focus:border-terracotta dark:focus:border-gold transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-charcoal dark:text-cream mb-2">
                Postal Code
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-terracotta/20 dark:border-terracotta/40 bg-white dark:bg-charcoal/50 text-charcoal dark:text-cream placeholder:text-charcoal/40 dark:placeholder:text-cream/40 focus:outline-none focus:border-terracotta dark:focus:border-gold transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-charcoal dark:text-cream mb-2">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-terracotta/20 dark:border-terracotta/40 bg-white dark:bg-charcoal/50 text-charcoal dark:text-cream placeholder:text-charcoal/40 dark:placeholder:text-cream/40 focus:outline-none focus:border-terracotta dark:focus:border-gold transition-colors"
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={submitting}
          >
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl">
          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
              {errorMessage}
            </div>
          )}

          <SettingsLayout
            sections={sections}
            defaultSection="account"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
