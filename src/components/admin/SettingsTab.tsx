"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import Loading from "@/components/Loading";

interface Category {
  id: string;
  name: string;
  grouping?: string | null;
  icon?: string | null;
}

interface BannerTemplate {
  id: string;
  slug: string;
  name: string;
  imageUrl: string;
  description: string | null;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface SettingsTabProps {
  whatsappUrl: string;
  setWhatsappUrl: (url: string) => void;
  fbInterval: string;
  setFbInterval: (interval: string) => void;
  handleSaveSettings: () => Promise<void>;
  categories: Category[];
  handleAddCategory: (name: string, grouping: string) => Promise<void>;
  bannerTemplates: BannerTemplate[];
  handleAddBannerTemplate: (name: string, imageUrl: string, description: string, tags: string[]) => Promise<void>;
}

const CATEGORY_GROUPS = [
  { value: "MUSIC_VOCAL", label: "Music (Vocal)" },
  { value: "MUSIC_INSTRUMENTAL", label: "Music (Instrumental)" },
  { value: "PERFORMING_ARTS", label: "Performing Arts" },
  { value: "VISUAL_ARTS", label: "Visual Arts" },
  { value: "LITERARY_ARTS", label: "Literary Arts" },
  { value: "SPOKEN_WORD", label: "Spoken Word" },
];

export default function SettingsTab({
  whatsappUrl,
  setWhatsappUrl,
  fbInterval,
  setFbInterval,
  handleSaveSettings,
  categories,
  handleAddCategory,
  bannerTemplates,
  handleAddBannerTemplate,
}: SettingsTabProps) {
  const searchParams = useSearchParams();
  const [activeSubTab, setActiveSubTab] = useState<"general" | "categories" | "banners">("general");
  const [newCatName, setNewCatName] = useState("");
  const [newCatGroup, setNewCatGroup] = useState("MUSIC_VOCAL");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerName, setBannerName] = useState("");
  const [bannerDesc, setBannerDesc] = useState("");
  const [bannerTags, setBannerTags] = useState<string[]>([]);
  const [bannerTagInput, setBannerTagInput] = useState("");
  const [bannerTagSuggestions, setBannerTagSuggestions] = useState<string[]>([]);
  const [showBannerTagSuggestions, setShowBannerTagSuggestions] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [uploadedBannerUrl, setUploadedBannerUrl] = useState("");
  const [bannerErrorMsg, setBannerErrorMsg] = useState("");
  const [isSeedingCategories, setIsSeedingCategories] = useState(false);

  const handleSeedCategories = async () => {
    setIsSeedingCategories(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/categories/seed", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to seed categories");
      setErrorMsg("");
      window.location.reload();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to seed categories");
    } finally {
      setIsSeedingCategories(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      const subTab = searchParams.get("subtab") as "general" | "categories" | "banners";
      if (subTab && (subTab === "general" || subTab === "categories" || subTab === "banners")) {
        setActiveSubTab(subTab);
      }
    });
  }, [searchParams]);

  const handleSubTabChange = (tab: "general" | "categories" | "banners") => {
    setActiveSubTab(tab);
    const params = new URLSearchParams(searchParams);
    params.set("subtab", tab);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  };

  const onSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await handleAddCategory(newCatName.trim(), newCatGroup);
      setNewCatName("");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to add category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addBannerTag = (tagValue?: string) => {
    const tag = (tagValue || bannerTagInput).trim();
    if (tag && !bannerTags.includes(tag)) {
      setBannerTags([...bannerTags, tag]);
      setBannerTagInput("");
      setShowBannerTagSuggestions(false);
    }
  };

  const handleBannerTagInputChange = (value: string) => {
    setBannerTagInput(value);

    if (value.trim()) {
      const allExistingTags = bannerTemplates
        .flatMap((t) => t.tags)
        .filter(Boolean);

      const uniqueTags = Array.from(new Set(allExistingTags));

      const filtered = uniqueTags
        .filter((tag) =>
          tag.toLowerCase().includes(value.toLowerCase()) &&
          !bannerTags.includes(tag)
        )
        .slice(0, 5);

      setBannerTagSuggestions(filtered);
      setShowBannerTagSuggestions(filtered.length > 0);
    } else {
      setShowBannerTagSuggestions(false);
    }
  };

  const removeBannerTag = (index: number) => {
    setBannerTags(bannerTags.filter((_, i) => i !== index));
  };

  const handleBannerTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "," || e.key === "Enter") && bannerTagInput.trim()) {
      e.preventDefault();
      addBannerTag();
    } else if (e.key === "Backspace" && !bannerTagInput && bannerTags.length > 0) {
      const lastTag = bannerTags[bannerTags.length - 1];
      setBannerTags(bannerTags.slice(0, -1));
      setBannerTagInput(lastTag);
    } else if (e.key === "Escape") {
      setShowBannerTagSuggestions(false);
    }
  };

  const onSubmitBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerFile || !bannerName.trim() || !uploadedBannerUrl) {
      setBannerErrorMsg("Please upload an image and provide a template name");
      return;
    }
    setIsUploadingBanner(true);
    setBannerErrorMsg("");
    try {
      await handleAddBannerTemplate(bannerName.trim(), uploadedBannerUrl, bannerDesc, bannerTags);
      setBannerFile(null);
      setBannerName("");
      setBannerDesc("");
      setBannerTags([]);
      setBannerTagInput("");
      setUploadedBannerUrl("");
    } catch (err) {
      setBannerErrorMsg(err instanceof Error ? err.message : "Failed to add banner template");
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const onUploadBannerImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBannerErrorMsg("");
    setIsUploadingBanner(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/banner-templates/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload image");

      setBannerFile(file);
      setUploadedBannerUrl(data.url);
    } catch (err) {
      setBannerErrorMsg(err instanceof Error ? err.message : "Failed to upload image");
      setBannerFile(null);
    } finally {
      setIsUploadingBanner(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Settings Sub-Menu (Left sidebar) */}
      <div className="w-full md:w-48 shrink-0 flex flex-row md:flex-col gap-1 border-b md:border-b-0 md:border-r border-terracotta/15 pb-4 md:pb-0 md:pr-4 overflow-x-auto md:overflow-x-visible">
        <button
          onClick={() => handleSubTabChange("general")}
          className={`cursor-pointer px-4 py-2.5 rounded-lg text-left text-sm font-bold transition-all whitespace-nowrap md:whitespace-normal shrink-0 ${
            activeSubTab === "general"
              ? "bg-terracotta text-cream dark:bg-gold dark:text-charcoal shadow-sm"
              : "text-cream/60 hover:bg-cream/5 hover:text-cream"
          }`}
        >
          ⚙️ General Configuration
        </button>
        <button
          onClick={() => handleSubTabChange("categories")}
          className={`cursor-pointer px-4 py-2.5 rounded-lg text-left text-sm font-bold transition-all whitespace-nowrap md:whitespace-normal shrink-0 ${
            activeSubTab === "categories"
              ? "bg-terracotta text-cream dark:bg-gold dark:text-charcoal shadow-sm"
              : "text-cream/60 hover:bg-cream/5 hover:text-cream"
          }`}
        >
          🏷️ Category Specializations
        </button>
        <button
          onClick={() => handleSubTabChange("banners")}
          className={`cursor-pointer px-4 py-2.5 rounded-lg text-left text-sm font-bold transition-all whitespace-nowrap md:whitespace-normal shrink-0 ${
            activeSubTab === "banners"
              ? "bg-terracotta text-cream dark:bg-gold dark:text-charcoal shadow-sm"
              : "text-cream/60 hover:bg-cream/5 hover:text-cream"
          }`}
        >
          🖼️ Banner Templates
        </button>
      </div>

      {/* Content Area (Right panel) */}
      <div className="flex-1 min-w-0">
        {activeSubTab === "general" && (
          <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6 space-y-4 shadow-md max-w-xl">
            <h3 className="font-serif text-base font-bold">Workspace Configuration</h3>
            <div className="space-y-4 text-sm font-semibold">
              <div className="space-y-1">
                <label className="block text-cream/60">WhatsApp Business API URL</label>
                <input 
                  type="text" 
                  value={whatsappUrl} 
                  onChange={(e) => setWhatsappUrl(e.target.value)}
                  className="w-full bg-charcoal border border-terracotta/30 rounded p-2.5 text-cream focus:outline-none focus:border-terracotta" 
                />
              </div>
              <div className="space-y-1">
                <label className="block text-cream/60">FB Scraper Recurrence Interval (minutes)</label>
                <input 
                  type="number" 
                  value={fbInterval} 
                  onChange={(e) => setFbInterval(e.target.value)}
                  className="w-full bg-charcoal border border-terracotta/30 rounded p-2.5 text-cream focus:outline-none focus:border-terracotta" 
                />
              </div>
              <Button
                onClick={handleSaveSettings}
                variant="primary"
                size="md"
                className="w-full sm:w-auto"
              >
                Save Configuration
              </Button>
            </div>
          </div>
        )}

        {activeSubTab === "categories" && (
          <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6 space-y-6 shadow-md">
            <div>
              <h3 className="font-serif text-base font-bold">Category Specializations</h3>
              <p className="text-sm text-cream/50 mt-1">Configure baseline disciplines and categories registered in the database.</p>
            </div>

            {/* Existing Categories List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[350px] overflow-y-auto pr-2">
              {categories && categories.length > 0 ? (
                categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-charcoal border border-terracotta/10 rounded-xl p-4 flex items-center justify-between shadow-sm select-none"
                  >
                    <div className="space-y-1">
                      <p className="font-serif text-sm font-bold text-cream">{cat.name}</p>
                      <p className="text-[10px] uppercase font-bold text-gold tracking-wider">
                        {CATEGORY_GROUPS.find(g => g.value === cat.grouping)?.label || cat.grouping || "Unassigned"}
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded bg-cream/5 border border-cream/10 text-xs text-cream/60 font-sans">
                      Active
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-8 space-y-4">
                  <p className="text-sm text-cream/40 italic">No category specializations loaded.</p>
                  <Button
                    onClick={handleSeedCategories}
                    variant="secondary"
                    size="md"
                    disabled={isSeedingCategories}
                  >
                    {isSeedingCategories ? "Seeding..." : "Seed Default Categories"}
                  </Button>
                </div>
              )}
            </div>

            {/* Add New Category Form */}
            <form onSubmit={onSubmitCategory} className="border-t border-terracotta/10 pt-6 space-y-4">
              <h4 className="font-serif text-sm font-bold">Add New Specialization</h4>
              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold">
                  {errorMsg}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                <div className="space-y-1 text-sm font-semibold">
                  <label className="block text-cream/60">Category Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Kathak Dance" 
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full bg-charcoal border border-terracotta/30 rounded p-2.5 text-cream focus:outline-none focus:border-terracotta" 
                    required
                  />
                </div>
                <div className="space-y-1 text-sm font-semibold">
                  <label className="block text-cream/60">Visual Grouping</label>
                  <select 
                    value={newCatGroup}
                    onChange={(e) => setNewCatGroup(e.target.value)}
                    className="w-full bg-charcoal border border-terracotta/30 rounded p-2.5 text-cream focus:outline-none focus:border-terracotta"
                  >
                    {CATEGORY_GROUPS.map((group) => (
                      <option key={group.value} value={group.value}>{group.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Button
                type="submit"
                variant="secondary"
                size="md"
                disabled={isSubmitting || !newCatName.trim()}
              >
                {isSubmitting ? "Adding Specialization..." : "+ Add Specialization"}
              </Button>
            </form>
          </div>
        )}

        {activeSubTab === "banners" && (
          <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6 space-y-6 shadow-md">
            <div>
              <h3 className="font-serif text-base font-bold">Banner Templates</h3>
              <p className="text-sm text-cream/50 mt-1">Manage competition banner designs. Upload images to R2 and create reusable templates.</p>
            </div>

            {/* Existing Banner Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto pr-2">
              {bannerTemplates && bannerTemplates.length > 0 ? (
                bannerTemplates.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    className="bg-charcoal border border-terracotta/10 rounded-xl overflow-hidden shadow-sm hover:border-terracotta/20 transition-all"
                  >
                    <img
                      src={tmpl.imageUrl}
                      alt={tmpl.name}
                      className="w-full h-24 object-cover"
                    />
                    <div className="p-3 space-y-2">
                      <p className="font-serif text-sm font-bold text-cream">{tmpl.name}</p>
                      {tmpl.tags && tmpl.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {tmpl.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-terracotta/10 text-gold border border-terracotta/10"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <span className="inline-block px-2 py-1 rounded bg-cream/5 border border-cream/10 text-xs text-cream/60 font-sans">
                        {tmpl.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-cream/40 italic col-span-3">No banner templates loaded.</p>
              )}
            </div>

            {/* Upload New Banner Form */}
            <form onSubmit={onSubmitBanner} className="border-t border-terracotta/10 pt-6 space-y-4">
              <h4 className="font-serif text-sm font-bold">Add New Banner Template</h4>
              {bannerErrorMsg && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold">
                  {bannerErrorMsg}
                </div>
              )}

              {/* File Upload */}
              <div className="space-y-2">
                <label className="block text-cream/60 text-sm font-semibold">Banner Image</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onUploadBannerImage}
                    disabled={isUploadingBanner}
                    className="w-full p-3 bg-charcoal border border-terracotta/30 rounded text-cream text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-terracotta file:text-charcoal file:font-bold"
                  />
                  {isUploadingBanner && (
                    <Loading variant="inline" text="Uploading to R2..." />
                  )}
                </div>
                {uploadedBannerUrl && (
                  <div className="p-2 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-xs font-semibold flex items-center gap-2">
                    ✓ Image uploaded successfully
                  </div>
                )}
              </div>

              {/* Template Details */}
              <div className="space-y-4">
                <div className="space-y-1 text-sm font-semibold">
                  <label className="block text-cream/60">Template Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Bharatanatyam Dance"
                    value={bannerName}
                    onChange={(e) => setBannerName(e.target.value)}
                    className="w-full bg-charcoal border border-terracotta/30 rounded p-2.5 text-cream focus:outline-none focus:border-terracotta"
                    required
                  />
                </div>
                <div className="space-y-2 text-sm font-semibold relative">
                  <label className="block text-cream/60">Tags (press comma or enter)</label>
                  <div className="flex flex-wrap gap-2 mb-2 p-2 bg-charcoal border border-terracotta/30 rounded min-h-[40px] items-start">
                    {bannerTags.length > 0 ? (
                      bannerTags.map((tag, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 bg-terracotta/20 px-3 py-1 rounded-full border border-terracotta/40"
                        >
                          <span className="text-sm text-cream">{tag}</span>
                          <button
                            type="button"
                            onClick={() => removeBannerTag(idx)}
                            className="text-terracotta/60 hover:text-terracotta font-bold leading-none"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    ) : (
                      <span className="text-cream/40 italic text-xs self-center">No tags added</span>
                    )}
                    <input
                      type="text"
                      placeholder="add a tag..."
                      value={bannerTagInput}
                      onChange={(e) => handleBannerTagInputChange(e.target.value)}
                      onKeyDown={handleBannerTagKeyDown}
                      onFocus={() => {
                        if (bannerTagInput.trim() && bannerTagSuggestions.length > 0) {
                          setShowBannerTagSuggestions(true);
                        }
                      }}
                      className="flex-1 min-w-[100px] bg-transparent text-cream text-sm focus:outline-none placeholder-cream/30"
                    />
                  </div>

                  {showBannerTagSuggestions && bannerTagSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-charcoal border border-terracotta/30 rounded shadow-lg z-10">
                      {bannerTagSuggestions.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => addBannerTag(tag)}
                          className="w-full text-left px-3 py-2 hover:bg-terracotta/10 text-cream text-sm border-b border-terracotta/10 last:border-b-0 transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              <div className="space-y-1 text-sm font-semibold">
                <label className="block text-cream/60">Description (Optional)</label>
                <textarea
                  placeholder="Describe this banner template..."
                  value={bannerDesc}
                  onChange={(e) => setBannerDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-charcoal border border-terracotta/30 rounded p-2.5 text-cream focus:outline-none focus:border-terracotta resize-none"
                />
              </div>
              </div>

              <Button
                type="submit"
                variant="secondary"
                size="md"
                disabled={isUploadingBanner || !bannerName.trim() || !uploadedBannerUrl}
              >
                {isUploadingBanner ? "Creating Template..." : "+ Create Template"}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
