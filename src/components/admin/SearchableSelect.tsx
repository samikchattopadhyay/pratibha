"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  grouping?: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  searchPlaceholder?: string;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  className = "",
  searchPlaceholder = "Search...",
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opt.description && opt.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHighlightedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchTerm("");
    }
  }, [isOpen]);

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        onChange(filteredOptions[highlightedIndex].value);
        setIsOpen(false);
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between gap-2 bg-charcoal border border-terracotta/30 rounded p-2.5 text-cream text-sm font-semibold transition-all ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:border-terracotta/50 focus:outline-none focus:border-terracotta"
        } ${isOpen ? "border-terracotta" : ""}`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Floating Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="absolute top-full left-0 right-0 mt-1 bg-charcoal border border-terracotta/30 rounded shadow-lg z-[9999] overflow-hidden"
        >
          {/* Search Input */}
          <div className="p-2 border-b border-terracotta/10 bg-charcoal-light">
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setHighlightedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              className="w-full bg-charcoal border border-terracotta/20 rounded px-2.5 py-1.5 text-cream text-sm focus:outline-none focus:border-terracotta"
            />
          </div>

          {/* Options List */}
          <ul className="max-h-[280px] overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, idx) => (
                <li
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`px-3 py-2 cursor-pointer transition-colors text-sm ${
                    idx === highlightedIndex
                      ? "bg-terracotta/20 text-cream"
                      : "text-cream/80 hover:bg-terracotta/10"
                  } ${value === option.value ? "bg-terracotta/30 font-semibold text-gold" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{option.label}</div>
                      {option.description && (
                        <div className="text-xs text-cream/50 truncate">{option.description}</div>
                      )}
                    </div>
                    {value === option.value && (
                      <span className="text-gold font-bold shrink-0">✓</span>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-xs text-cream/40 italic">No results found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
