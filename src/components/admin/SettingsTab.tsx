"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import { Plus } from "lucide-react";
import SearchableSelect from "@/components/admin/SearchableSelect";

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
  onRefreshCategories?: () => Promise<void>;
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
  onRefreshCategories,
}: SettingsTabProps) {
  const searchParams = useSearchParams();
  const [activeSubTab, setActiveSubTab] = useState<"general" | "categories" | "banners" | "groupings" | "rubrics">("general");
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

  const [rubrics, setRubrics] = useState<any>(null);
  const [selectedGroup, setSelectedGroup] = useState("MUSIC_VOCAL");
  const [selectedScope, setSelectedScope] = useState<"STATE" | "NATIONAL">("STATE");
  const [isSavingRubrics, setIsSavingRubrics] = useState(false);
  const [rubricError, setRubricError] = useState("");
  const [rubricSuccess, setRubricSuccess] = useState("");
  const [newGroupName, setNewGroupName] = useState("");

  const [newCritLabel, setNewCritLabel] = useState("");
  const [newCritMax, setNewCritMax] = useState<number>(0);
  const [newCritDesc, setNewCritDesc] = useState("");

  const handleAddNewCriterionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCritLabel.trim() || !newCritMax || !rubrics) return;

    const updated = { ...rubrics };
    if (!updated[selectedScope]) updated[selectedScope] = {};
    if (!updated[selectedScope][selectedGroup]) updated[selectedScope][selectedGroup] = [];
    
    const currentList = [...updated[selectedScope][selectedGroup]];
    const key = `criteria_custom_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    currentList.push({
      key,
      label: newCritLabel.trim(),
      max: newCritMax,
      description: newCritDesc.trim(),
    });
    updated[selectedScope][selectedGroup] = currentList;

    setRubrics(updated);
    setNewCritLabel("");
    setNewCritMax(0);
    setNewCritDesc("");
    setRubricError("");
    setRubricSuccess("");

    setIsSavingRubrics(true);
    try {
      const res = await fetch("/api/admin/rubrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setRubricSuccess("Criterion added and saved successfully!");
        setTimeout(() => setRubricSuccess(""), 3000);
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save");
      }
    } catch (err) {
      setRubricError(err instanceof Error ? err.message : "Error saving rubrics");
    } finally {
      setIsSavingRubrics(false);
    }
  };

  const [showCriterionModal, setShowCriterionModal] = useState(false);
  const [editingCriterionIdx, setEditingCriterionIdx] = useState<number | null>(null);

  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState("");
  const [editingCatGroup, setEditingCatGroup] = useState("");

  const [editingGroupKey, setEditingGroupKey] = useState<string | null>(null);
  const [editingGroupLabel, setEditingGroupLabel] = useState("");

  const handleStartEdit = (cat: Category) => {
    setEditingCatId(cat.id);
    setEditingCatName(cat.name);
    setEditingCatGroup(cat.grouping || "");
  };

  const handleCancelEdit = () => {
    setEditingCatId(null);
    setEditingCatName("");
    setEditingCatGroup("");
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editingCatName.trim()) return;
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: editingCatName.trim(), grouping: editingCatGroup }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update specialization");
      
      setEditingCatId(null);
      if (onRefreshCategories) {
        await onRefreshCategories();
      } else {
        window.location.reload();
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to update specialization");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setErrorMsg("");
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete specialization");
      
      if (onRefreshCategories) {
        await onRefreshCategories();
      } else {
        window.location.reload();
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to delete specialization");
    }
  };

  const getCategoryGroupOptions = () => {
    if (!rubrics) return CATEGORY_GROUPS;
    const keys = Object.keys(rubrics.STATE || {});
    const prettyMap: Record<string, string> = {
      MUSIC_VOCAL: "Music (Vocal)",
      MUSIC_INSTRUMENTAL: "Music (Instrumental)",
      PERFORMING_ARTS: "Performing Arts",
      VISUAL_ARTS: "Visual Arts",
      LITERARY_ARTS: "Literary Arts",
      SPOKEN_WORD: "Spoken Word",
    };
    return keys.map((key) => ({
      value: key,
      label: prettyMap[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    }));
  };

  useEffect(() => {
    const fetchRubrics = async () => {
      try {
        const res = await fetch("/api/admin/rubrics");
        if (res.ok) {
          const data = await res.json();
          setRubrics(data);
          // Set default selected group from keys
          const keys = Object.keys(data.STATE || {});
          if (keys.length > 0) {
            setSelectedGroup(keys[0]);
            setNewCatGroup(keys[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load rubrics settings:", err);
      }
    };
    fetchRubrics();
  }, []);

  const handleAddCategoryGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !rubrics) return;
    setRubricError("");
    setRubricSuccess("");

    const formattedKey = newGroupName.trim().toUpperCase().replace(/[\s-]+/g, "_").replace(/[^\w]/g, "");
    if (!formattedKey) {
      setRubricError("Invalid group name format");
      return;
    }

    if (rubrics.STATE[formattedKey] || rubrics.NATIONAL[formattedKey]) {
      setRubricError("Group already exists");
      return;
    }

    const updated = { ...rubrics };
    updated.STATE[formattedKey] = [
      { key: "criteria1", label: "Technical Competence", max: 40, description: "Accuracy and basic technical execution." },
      { key: "criteria2", label: "Artistic Presentation", max: 30, description: "Styling, expression, and delivery choice." },
      { key: "criteria3", label: "Overall Impression", max: 30, description: "General aesthetic and performance balance." },
    ];
    updated.NATIONAL[formattedKey] = [
      { key: "criteria1", label: "Technical Competence", max: 35, description: "Technical proficiency and execution accuracy." },
      { key: "criteria2", label: "Artistic Presentation", max: 25, description: "Performance delivery, stylistic choices, and emotional depth." },
      { key: "criteria3", label: "General Aesthetic Choice", max: 25, description: "Composition selection, complexity, and overall balance." },
      { key: "criteria4", label: "Originality & Innovation", max: 15, description: "Creative uniqueness and novel presentation." },
    ];

    setIsSavingRubrics(true);
    try {
      const res = await fetch("/api/admin/rubrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setRubrics(updated);
        setNewGroupName("");
        setRubricSuccess(`Category Group "${newGroupName}" added successfully!`);
        setTimeout(() => setRubricSuccess(""), 3000);
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to add group");
      }
    } catch (err) {
      setRubricError(err instanceof Error ? err.message : "Error adding category group");
    } finally {
      setIsSavingRubrics(false);
    }
  };

  const handleRemoveCategoryGroup = async (groupKey: string) => {
    if (!rubrics) return;
    const isAssigned = categories.some((cat) => cat.grouping === groupKey);
    if (isAssigned) {
      setRubricError(`Cannot delete Group "${groupKey}". There are specializations assigned to it.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete Category Group "${groupKey}"?`)) return;

    setRubricError("");
    setRubricSuccess("");

    const updated = { ...rubrics };
    delete updated.STATE[groupKey];
    delete updated.NATIONAL[groupKey];

    setIsSavingRubrics(true);
    try {
      const res = await fetch("/api/admin/rubrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setRubrics(updated);
        if (selectedGroup === groupKey) {
          const keys = Object.keys(updated.STATE);
          setSelectedGroup(keys[0] || "");
          setNewCatGroup(keys[0] || "");
        }
        setRubricSuccess(`Category Group "${groupKey}" deleted successfully!`);
        setTimeout(() => setRubricSuccess(""), 3000);
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to delete group");
      }
    } catch (err) {
      setRubricError(err instanceof Error ? err.message : "Error deleting category group");
    } finally {
      setIsSavingRubrics(false);
    }
  };

  const handleUpdateRubricCriterion = (idx: number, field: string, value: any) => {
    if (!rubrics) return;
    setRubrics((prev: any) => {
      const updated = { ...prev };
      const currentList = [...(updated[selectedScope]?.[selectedGroup] || [])];
      currentList[idx] = { ...currentList[idx], [field]: value };
      updated[selectedScope][selectedGroup] = currentList;
      return updated;
    });
  };

  const handleAddRubricCriterion = () => {
    if (!rubrics) return;
    setRubrics((prev: any) => {
      const updated = { ...prev };
      const currentList = [...(updated[selectedScope]?.[selectedGroup] || [])];
      currentList.push({
        key: `criteria_custom_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        label: "",
        max: 10,
        description: "",
      });
      updated[selectedScope][selectedGroup] = currentList;
      return updated;
    });
  };

  const handleRemoveRubricCriterion = async (idx: number) => {
    if (!rubrics) return;
    const updated = { ...rubrics };
    const currentList = [...(updated[selectedScope]?.[selectedGroup] || [])];
    const filtered = currentList.filter((_, i) => i !== idx);
    updated[selectedScope][selectedGroup] = filtered;

    setRubrics(updated);
    setRubricError("");
    setRubricSuccess("");

    setIsSavingRubrics(true);
    try {
      const res = await fetch("/api/admin/rubrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setRubricSuccess("Criterion deleted and saved successfully!");
        setTimeout(() => setRubricSuccess(""), 3000);
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save");
      }
    } catch (err) {
      setRubricError(err instanceof Error ? err.message : "Error saving rubrics");
    } finally {
      setIsSavingRubrics(false);
    }
  };

  const handleSaveRubrics = async () => {
    if (!rubrics) return;
    setRubricError("");
    setRubricSuccess("");

    // Validation: check sum for selected group and scope
    const currentList = rubrics[selectedScope]?.[selectedGroup] || [];
    const totalPoints = currentList.reduce((sum: number, c: any) => sum + (parseInt(c.max) || 0), 0);
    if (totalPoints !== 100) {
      setRubricError(`Rubric points must sum up to exactly 100. Current total is ${totalPoints}.`);
      return;
    }

    setIsSavingRubrics(true);
    try {
      const res = await fetch("/api/admin/rubrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rubrics),
      });
      if (res.ok) {
        setRubricSuccess("Default rubrics saved successfully!");
        setTimeout(() => setRubricSuccess(""), 3000);
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save");
      }
    } catch (err) {
      setRubricError(err instanceof Error ? err.message : "Error saving rubrics");
    } finally {
      setIsSavingRubrics(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      const subTab = searchParams.get("subtab") as "general" | "categories" | "banners" | "groupings" | "rubrics";
      if (subTab && (subTab === "general" || subTab === "categories" || subTab === "banners" || subTab === "groupings" || subTab === "rubrics")) {
        setActiveSubTab(subTab);
      }
    });
  }, [searchParams]);

  const handleSubTabChange = (tab: "general" | "categories" | "banners" | "groupings" | "rubrics") => {
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
          ⚙️ General
        </button>
        <button
          onClick={() => handleSubTabChange("categories")}
          className={`cursor-pointer px-4 py-2.5 rounded-lg text-left text-sm font-bold transition-all whitespace-nowrap md:whitespace-normal shrink-0 ${
            activeSubTab === "categories"
              ? "bg-terracotta text-cream dark:bg-gold dark:text-charcoal shadow-sm"
              : "text-cream/60 hover:bg-cream/5 hover:text-cream"
          }`}
        >
          🏷️ Specialization
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
        <button
          onClick={() => handleSubTabChange("groupings")}
          className={`cursor-pointer px-4 py-2.5 rounded-lg text-left text-sm font-bold transition-all whitespace-nowrap md:whitespace-normal shrink-0 ${
            activeSubTab === "groupings"
              ? "bg-terracotta text-cream dark:bg-gold dark:text-charcoal shadow-sm"
              : "text-cream/60 hover:bg-cream/5 hover:text-cream"
          }`}
        >
          🎨 Visual Groupings
        </button>
        <button
          onClick={() => handleSubTabChange("rubrics")}
          className={`cursor-pointer px-4 py-2.5 rounded-lg text-left text-sm font-bold transition-all whitespace-nowrap md:whitespace-normal shrink-0 ${
            activeSubTab === "rubrics"
              ? "bg-terracotta text-cream dark:bg-gold dark:text-charcoal shadow-sm"
              : "text-cream/60 hover:bg-cream/5 hover:text-cream"
          }`}
        >
          🎯 Judging Criteria
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
            {/* Existing Categories List - Tabular View */}
            <div className="max-h-[350px] overflow-y-auto pr-2 border border-terracotta/15 rounded-xl bg-charcoal">
              {categories && categories.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-terracotta/15 bg-charcoal-light">
                      <th className="py-3 px-4 text-[10px] uppercase font-bold text-gold tracking-wider">Specialization Name</th>
                      <th className="py-3 px-4 text-[10px] uppercase font-bold text-gold tracking-wider">Visual Grouping</th>
                      <th className="py-3 px-4 text-[10px] uppercase font-bold text-gold tracking-wider">Status</th>
                      <th className="py-3 px-4 text-[10px] uppercase font-bold text-gold tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => {
                      const isEditing = editingCatId === cat.id;
                      return (
                        <tr
                          key={cat.id}
                          className="border-b border-terracotta/10 last:border-b-0 hover:bg-cream/5 transition-all text-xs font-semibold"
                        >
                          <td className="py-2.5 px-4">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editingCatName}
                                onChange={(e) => setEditingCatName(e.target.value)}
                                className="bg-charcoal border border-terracotta/30 rounded px-2 py-1 text-cream text-xs focus:outline-none focus:border-terracotta w-full"
                              />
                            ) : (
                              <span className="text-cream/90 font-serif font-bold">{cat.name}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4">
                            {isEditing ? (
                              <select
                                value={editingCatGroup}
                                onChange={(e) => setEditingCatGroup(e.target.value)}
                                className="bg-charcoal border border-terracotta/30 rounded px-2 py-1 text-cream text-xs focus:outline-none focus:border-terracotta w-full"
                              >
                                {getCategoryGroupOptions().map((group) => (
                                  <option key={group.value} value={group.value}>{group.label}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-terracotta/10 text-gold border border-terracotta/10">
                                {getCategoryGroupOptions().find(g => g.value === cat.grouping)?.label || cat.grouping || "Unassigned"}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="inline-block px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-[10px] text-green-400 font-sans">
                              Active
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            {isEditing ? (
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => handleUpdateCategory(cat.id)}
                                  className="cursor-pointer px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 hover:border-green-500/40 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all duration-200 transform active:scale-95"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="cursor-pointer px-3 py-1.5 bg-cream/5 hover:bg-cream/10 text-cream/60 hover:text-cream border border-cream/10 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all duration-200 transform active:scale-95"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => handleStartEdit(cat)}
                                  className="cursor-pointer px-3 py-1.5 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/20 hover:border-gold/40 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all duration-200 transform active:scale-95"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(cat.id)}
                                  className="cursor-pointer px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all duration-200 transform active:scale-95"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 space-y-4">
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
                    {getCategoryGroupOptions().map((group) => (
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

        {activeSubTab === "rubrics" && (
          <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6 space-y-6 shadow-md">
            <div>
              <h3 className="font-serif text-base font-bold">Default Judging Criteria Configurations</h3>
              <p className="text-sm text-cream/50 mt-1">Manage standard evaluation rubrics loaded automatically during Competition creation.</p>
            </div>

            {rubrics && (() => {
              const currentList = rubrics[selectedScope]?.[selectedGroup] || [];
              const total = currentList.reduce((sum: number, c: any) => sum + (parseInt(c.max) || 0), 0);
              if (total > 100) {
                return (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-semibold flex items-center gap-2">
                    <span>⚠️</span>
                    <span>Danger: Total point allocation exceeds 100 points (Current: {total}/100). Please adjust the criteria maximums to ensure scoring functions correctly.</span>
                  </div>
                );
              }
              return null;
            })()}

            {rubrics && (
              <>
                {rubricError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold">
                    {rubricError}
                  </div>
                )}
                {rubricSuccess && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold">
                    {rubricSuccess}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 max-w-xl">
                  <div className="space-y-1 text-sm font-semibold">
                    <label className="block text-cream/60">Category Group</label>
                    <SearchableSelect
                      options={getCategoryGroupOptions()}
                      value={selectedGroup}
                      onChange={(val) => {
                        setSelectedGroup(val);
                        setRubricError("");
                      }}
                      searchPlaceholder="Search category group..."
                    />
                  </div>
                  <div className="space-y-1 text-sm font-semibold">
                    <label className="block text-cream/60">Geographic Scope</label>
                    <SearchableSelect
                      options={[
                        { value: "STATE", label: "State Level (3 Criteria Default)" },
                        { value: "NATIONAL", label: "National Level (4 Criteria Default)" }
                      ]}
                      value={selectedScope}
                      onChange={(val) => {
                        setSelectedScope(val as any);
                        setRubricError("");
                      }}
                      searchPlaceholder="Search geographic scope..."
                    />
                 </div>
                </div>

                {/* Criteria List */}
                <div className="max-h-[350px] overflow-y-auto pr-2 border border-terracotta/15 rounded-xl bg-charcoal">
                  {(rubrics[selectedScope]?.[selectedGroup] || []).length > 0 ? (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-terracotta/15 bg-charcoal-light">
                          <th className="py-3 px-4 text-[10px] uppercase font-bold text-gold tracking-wider">Criterion</th>
                          <th className="py-3 px-4 text-[10px] uppercase font-bold text-gold tracking-wider">Max Points</th>
                          <th className="py-3 px-4 text-[10px] uppercase font-bold text-gold tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(rubrics[selectedScope]?.[selectedGroup] || []).map((criterion: any, idx: number) => (
                          <tr
                            key={criterion.key || idx}
                            className="border-b border-terracotta/10 last:border-b-0 hover:bg-cream/5 transition-all text-xs font-semibold"
                          >
                            <td className="py-2.5 px-4">
                              <span className="text-cream/90 font-serif font-bold">{criterion.label}</span>
                            </td>
                            <td className="py-2.5 px-4">
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-terracotta/10 text-gold border border-terracotta/10 font-mono">
                                {criterion.max}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              <div className="flex gap-2 justify-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingCriterionIdx(idx);
                                    setShowCriterionModal(true);
                                  }}
                                  className="cursor-pointer px-3 py-1.5 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/20 hover:border-gold/40 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all duration-200"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRubricCriterion(idx)}
                                  className="cursor-pointer px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all duration-200"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-cream/40 italic">No criteria defined.</p>
                    </div>
                  )}
                </div>


                {/* Add New Criterion Form */}
                <form onSubmit={handleAddNewCriterionSubmit} className="border-t border-terracotta/10 pt-6 space-y-4">
                  <h4 className="font-serif text-sm font-bold">Add New Judging Criterion</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div className="space-y-1 text-xs font-semibold">
                      <label className="block text-cream/60">Criterion Label</label>
                      <input
                        type="text"
                        placeholder="e.g. Tone & Articulation"
                        value={newCritLabel}
                        onChange={(e) => setNewCritLabel(e.target.value)}
                        className="w-full bg-charcoal border border-terracotta/30 rounded px-3 py-2 text-cream text-xs focus:outline-none focus:border-terracotta"
                        required
                      />
                    </div>
                    <div className="space-y-1 text-xs font-semibold">
                      <label className="block text-cream/60">Max Points</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        placeholder="e.g. 30"
                        value={newCritMax || ""}
                        onChange={(e) => setNewCritMax(parseInt(e.target.value) || 0)}
                        className="w-full bg-charcoal border border-terracotta/30 rounded px-3 py-2 text-cream text-xs focus:outline-none focus:border-terracotta text-center font-mono font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-1 text-xs font-semibold">
                      <label className="block text-cream/60">Description</label>
                      <input
                        type="text"
                        placeholder="Evaluation guideline / description..."
                        value={newCritDesc}
                        onChange={(e) => setNewCritDesc(e.target.value)}
                        className="w-full bg-charcoal border border-terracotta/30 rounded px-3 py-2 text-cream text-xs focus:outline-none focus:border-terracotta"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    variant="secondary"
                    size="md"
                    disabled={!newCritLabel.trim() || !newCritMax}
                    className="w-full sm:w-auto"
                  >
                    + Add Criterion
                  </Button>
                </form>

                 {/* Calculated Summary Rubric */}
                {(() => {
                  const currentList = rubrics[selectedScope]?.[selectedGroup] || [];
                  const total = currentList.reduce((sum: number, c: any) => sum + (parseInt(c.max) || 0), 0);
                  const isValid = total === 100;
                  return (
                    <div className="bg-charcoal border border-terracotta/15 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center border-b border-terracotta/10 pb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-gold">Calculated Summary Rubric</span>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          isValid ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {isValid ? "✓ Balanced (100 pts)" : `⚠️ Unbalanced (${total} pts)`}
                        </span>
                      </div>
                      
                      {currentList.length > 0 ? (
                        <div className="space-y-1.5 text-xs">
                          {currentList.map((c: any, index: number) => (
                            <div key={c.key || index} className="flex justify-between text-cream/70">
                              <span>{c.label || "Untitled Criterion"}</span>
                              <span className="font-mono font-bold text-cream">{c.max} pts</span>
                            </div>
                          ))}
                          <div className="flex justify-between font-serif font-bold text-cream border-t border-terracotta/10 pt-2 text-sm">
                            <span>Total Sum</span>
                            <span className={`font-mono ${total > 100 ? "text-red-400" : "text-green-400"}`}>{total} / 100 pts</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-cream/40 italic">No criteria defined yet.</p>
                      )}

                      {!isValid && (
                        <p className="text-[10px] text-amber-400 font-sans mt-2">
                          ⚠️ Point total must equal exactly 100 for scoring to work correctly.
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* Criterion Modal */}
                {showCriterionModal && editingCriterionIdx !== null && (
                  <div className="fixed inset-0 bg-charcoal/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-serif text-lg font-bold text-cream">Edit Criterion</h3>
                        <button
                          onClick={() => {
                            setShowCriterionModal(false);
                            setEditingCriterionIdx(null);
                          }}
                          className="text-cream/60 hover:text-cream text-2xl leading-none"
                        >
                          ✕
                        </button>
                      </div>

                      {(() => {
                        const currentList = rubrics[selectedScope]?.[selectedGroup] || [];
                        const criterion = currentList[editingCriterionIdx];
                        if (!criterion) return null;

                        return (
                          <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                              <div className="col-span-2 space-y-1">
                                <label className="block text-xs text-cream/60 font-semibold">Label</label>
                                <input
                                  type="text"
                                  value={criterion.label}
                                  onChange={(e) => handleUpdateRubricCriterion(editingCriterionIdx, "label", e.target.value)}
                                  placeholder="e.g. Rhythm & Composition"
                                  className="w-full bg-charcoal border border-terracotta/30 rounded px-3 py-2 text-cream text-xs focus:outline-none focus:border-terracotta"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="block text-xs text-cream/60 font-semibold">Max Points</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={criterion.max}
                                  onChange={(e) => handleUpdateRubricCriterion(editingCriterionIdx, "max", parseInt(e.target.value) || 0)}
                                  className="w-full bg-charcoal border border-terracotta/30 rounded px-3 py-2 text-cream text-xs focus:outline-none focus:border-terracotta text-center font-mono font-bold"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="block text-xs text-cream/60 font-semibold">Description / Evaluation Rubric Guidelines</label>
                              <textarea
                                value={criterion.description || ""}
                                onChange={(e) => handleUpdateRubricCriterion(editingCriterionIdx, "description", e.target.value)}
                                placeholder="What should judges look for when scoring this criterion..."
                                rows={4}
                                className="w-full bg-charcoal border border-terracotta/30 rounded px-3 py-2 text-cream text-xs focus:outline-none focus:border-terracotta resize-none"
                              />
                            </div>

                            <div className="flex gap-3 justify-end pt-4 border-t border-terracotta/10">
                              <Button
                                onClick={() => {
                                  setShowCriterionModal(false);
                                  setEditingCriterionIdx(null);
                                }}
                                variant="outline"
                                size="md"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={async () => {
                                  setShowCriterionModal(false);
                                  setEditingCriterionIdx(null);
                                  setRubricError("");
                                  setRubricSuccess("");
                                  setIsSavingRubrics(true);
                                  try {
                                    const res = await fetch("/api/admin/rubrics", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify(rubrics),
                                    });
                                    if (res.ok) {
                                      setRubricSuccess("Criterion updated and saved successfully!");
                                      setTimeout(() => setRubricSuccess(""), 3000);
                                    } else {
                                      const errData = await res.json();
                                      throw new Error(errData.error || "Failed to save");
                                    }
                                  } catch (err) {
                                    setRubricError(err instanceof Error ? err.message : "Error saving rubrics");
                                  } finally {
                                    setIsSavingRubrics(false);
                                  }
                                }}
                                variant="secondary"
                                size="md"
                              >
                                Done
                              </Button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </>
            )}

            {!rubrics && (
              <div className="p-4 text-center bg-charcoal border border-terracotta/10 rounded-xl">
                <p className="text-sm text-cream/50">Loading Judging Criteria...</p>
              </div>
            )}
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

        {activeSubTab === "groupings" && (
          <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6 space-y-6 shadow-md">
            <div>
              <h3 className="font-serif text-base font-bold">Visual Groupings</h3>
              <p className="text-sm text-cream/50 mt-1">Configure and manage category visual groupings. Note: Groups with active specializations assigned cannot be deleted.</p>
            </div>

            {rubrics && (
              <>
                {rubricError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold">
                    {rubricError}
                  </div>
                )}
                {rubricSuccess && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold">
                    {rubricSuccess}
                  </div>
                )}

                {/* Groupings Table */}
                <div className="max-h-[450px] overflow-y-auto pr-2 border border-terracotta/15 rounded-xl bg-charcoal">
                  {getCategoryGroupOptions().length > 0 ? (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-terracotta/15 bg-charcoal-light">
                          <th className="py-3 px-4 text-[10px] uppercase font-bold text-gold tracking-wider">Grouping Name</th>
                          <th className="py-3 px-4 text-[10px] uppercase font-bold text-gold tracking-wider">Key</th>
                          <th className="py-3 px-4 text-[10px] uppercase font-bold text-gold tracking-wider">Specializations</th>
                          <th className="py-3 px-4 text-[10px] uppercase font-bold text-gold tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getCategoryGroupOptions().map((group) => {
                          const isAssigned = categories.some((c) => c.grouping === group.value);
                          const assignedCount = categories.filter((c) => c.grouping === group.value).length;
                          const isEditing = editingGroupKey === group.value;

                          return (
                            <tr
                              key={group.value}
                              className="border-b border-terracotta/10 last:border-b-0 hover:bg-cream/5 transition-all text-xs font-semibold"
                            >
                              <td className="py-2.5 px-4">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editingGroupLabel}
                                    onChange={(e) => setEditingGroupLabel(e.target.value)}
                                    className="bg-charcoal border border-terracotta/30 rounded px-2 py-1 text-cream text-xs focus:outline-none focus:border-terracotta w-full"
                                  />
                                ) : (
                                  <span className="text-cream/90 font-serif font-bold">{group.label}</span>
                                )}
                              </td>
                              <td className="py-2.5 px-4">
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-terracotta/10 text-gold border border-terracotta/10 font-mono">
                                  {group.value}
                                </span>
                              </td>
                              <td className="py-2.5 px-4">
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                  {assignedCount}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 text-right">
                                {isEditing ? (
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      onClick={() => {
                                        setEditingGroupKey(null);
                                        setEditingGroupLabel("");
                                      }}
                                      className="cursor-pointer px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 hover:border-green-500/40 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all duration-200 transform active:scale-95"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingGroupKey(null);
                                        setEditingGroupLabel("");
                                      }}
                                      className="cursor-pointer px-3 py-1.5 bg-cream/5 hover:bg-cream/10 text-cream/60 hover:text-cream border border-cream/10 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all duration-200 transform active:scale-95"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      onClick={() => {
                                        setEditingGroupKey(group.value);
                                        setEditingGroupLabel(group.label);
                                      }}
                                      className="cursor-pointer px-3 py-1.5 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/20 hover:border-gold/40 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all duration-200 transform active:scale-95"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleRemoveCategoryGroup(group.value)}
                                      disabled={isAssigned}
                                      className={`cursor-pointer px-3 py-1.5 border rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all duration-200 transform active:scale-95 ${
                                        isAssigned
                                          ? "bg-red-500/5 text-red-300/40 border-red-500/10 cursor-not-allowed"
                                          : "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20 hover:border-red-500/40"
                                      }`}
                                      title={isAssigned ? `Cannot delete: ${assignedCount} specialization(s) assigned` : "Delete grouping"}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-cream/40 italic">No visual groupings loaded.</p>
                    </div>
                  )}
                </div>

                {/* Add Grouping Form */}
                <form onSubmit={handleAddCategoryGroup} className="border-t border-terracotta/10 pt-6 space-y-4">
                  <h4 className="font-serif text-sm font-bold">Add New Visual Grouping</h4>
                  <div className="flex flex-col sm:flex-row gap-3 max-w-xl items-end">
                    <div className="flex-1 space-y-1 text-xs font-semibold w-full">
                      <label className="block text-cream/60">New Grouping Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Theatre & Drama"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="w-full bg-charcoal border border-terracotta/30 rounded px-3 py-2 text-cream text-xs focus:outline-none focus:border-terracotta"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="secondary"
                      size="md"
                      disabled={isSavingRubrics || !newGroupName.trim()}
                      className="whitespace-nowrap w-full sm:w-auto"
                    >
                      + Add Grouping
                    </Button>
                  </div>
                </form>
              </>
            )}

            {!rubrics && (
              <div className="p-4 text-center bg-charcoal border border-terracotta/10 rounded-xl">
                <p className="text-sm text-cream/50">Loading Visual Groupings...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
