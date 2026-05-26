"use client";

import { useState, useMemo } from "react";
import { X } from "lucide-react";
import type { BannerTemplate } from "@prisma/client";

interface BannerTemplatePickerProps {
  templates: BannerTemplate[];
  value: string;
  onChange: (slug: string) => void;
}

export default function BannerTemplatePicker({
  templates,
  value,
  onChange,
}: BannerTemplatePickerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    templates.forEach((t) => {
      t.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch = template.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => template.tags.includes(tag));
      return matchesSearch && matchesTags && template.isActive;
    });
  }, [templates, searchTerm, selectedTags]);

  const selectedTemplate = templates.find((t) => t.slug === value);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search template name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full bg-charcoal border border-terracotta/20 rounded px-3 py-2 text-cream text-sm focus:outline-none focus:border-terracotta"
      />

      {/* Tag Filters */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                selectedTags.includes(tag)
                  ? "bg-gold text-charcoal"
                  : "bg-terracotta/20 text-cream border border-terracotta/30 hover:bg-terracotta/30"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Template Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {filteredTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => onChange(template.slug)}
              className={`group relative overflow-hidden rounded border-2 transition-all ${
                value === template.slug
                  ? "border-gold shadow-lg"
                  : "border-terracotta/20 hover:border-terracotta/50"
              }`}
            >
              <img
                src={template.imageUrl}
                alt={template.name}
                className="aspect-video w-full object-cover group-hover:opacity-90 transition-opacity"
              />
              <div className="absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-cream font-semibold text-sm">Select</span>
              </div>
              <div className="p-2 bg-charcoal-light border-t border-terracotta/20">
                <p className="text-cream text-xs font-semibold truncate">
                  {template.name}
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-cream/40 text-sm italic">
          No templates found
        </div>
      )}

      {/* Selected Template Description */}
      {selectedTemplate && (
        <div className="p-4 bg-gold/10 border border-gold/30 rounded">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-gold font-semibold text-sm">
                {selectedTemplate.name}
              </p>
              {selectedTemplate.description && (
                <p className="text-cream/70 text-xs mt-2">
                  {selectedTemplate.description}
                </p>
              )}
              {selectedTemplate.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedTemplate.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gold/20 text-gold text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => onChange("")}
              className="text-cream/50 hover:text-cream transition-colors shrink-0"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
