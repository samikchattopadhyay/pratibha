"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { X, Check, ChevronDown } from "lucide-react";

interface Option {
  readonly value: string;
  readonly label: string;
}

interface ChipMultiSelectProps {
  readonly options: readonly Option[];
  readonly selectedValues: readonly string[];
  readonly onChange: (values: string[]) => void;
  readonly placeholder?: string;
  readonly allOptions?: readonly Option[];
}

interface PanelPosition {
  top: number;
  left: number;
  width: number;
}

export default function ChipMultiSelect({
  options,
  selectedValues,
  onChange,
  placeholder = "Select specializations...",
  allOptions,
}: ChipMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [panelPosition, setPanelPosition] = useState<PanelPosition>({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Calculate panel position and focus input when opened
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      inputRef.current?.focus();
      const rect = triggerRef.current.getBoundingClientRect();
      setPanelPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  // Adjust active index when options list changes
  useEffect(() => {
    setActiveIndex(-1);
  }, [searchQuery]);

  const handleSelectOption = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
    setSearchQuery("");
    inputRef.current?.focus();
  };

  const handleRemoveValue = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedValues.filter((v) => v !== value));
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !searchQuery && selectedValues.length > 0) {
      // Remove last element on Backspace if query is empty
      onChange(selectedValues.slice(0, -1));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex((prev) => (prev + 1 < filteredOptions.length ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredOptions.length - 1));
    } else if (e.key === "Enter" && isOpen) {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
        handleSelectOption(filteredOptions[activeIndex].value);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const selectedChips = useMemo(() => {
    const sourceList = allOptions || options;
    return selectedValues
      .map((val) => {
        const found = sourceList.find((opt) => opt.value === val);
        if (found) return found;
        // Fallback display format if not found
        return {
          value: val,
          label: val.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
        };
      });
  }, [selectedValues, options, allOptions]);

  return (
    <div ref={containerRef} className="relative w-full font-sans">
      {/* Combobox Selection Area */}
      <div
        ref={triggerRef}
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
        className="relative h-10 w-full bg-charcoal border border-terracotta/20 rounded-lg px-3 flex flex-nowrap gap-2 items-center cursor-text focus-within:border-gold hover:border-terracotta/40 transition-all duration-200"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {/* Scrollable Content Area */}
        <div className="flex-1 flex flex-nowrap gap-2 items-center overflow-x-auto scroll-smooth scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {selectedChips.map((chip) => (
            <span
              key={chip.value}
              className="h-7 inline-flex items-center gap-1 bg-gold/10 text-gold border border-gold/30 rounded-full pl-3 pr-2 text-sm font-semibold select-none animate-in fade-in zoom-in-95 duration-150 w-fit white-space-nowrap shrink-0"
            >
              <span>{chip.label}</span>
              <button
                type="button"
                onClick={(e) => handleRemoveValue(chip.value, e)}
                className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-gold/20 text-gold transition-colors focus:outline-none cursor-pointer"
                aria-label={`Remove ${chip.label}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            placeholder={selectedValues.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[120px] bg-transparent text-sm text-cream placeholder-cream/35 focus:outline-none"
            aria-autocomplete="list"
          />
        </div>

        {/* Sticky Arrow - Outside Scroll Container */}
        <div className="flex-shrink-0 flex items-center text-cream/40 pointer-events-none pl-2">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {/* Dropdown Options */}
      {isOpen && filteredOptions.length > 0 && (
        <ul
          ref={dropdownRef}
          className="fixed z-[9999] bg-charcoal-light border border-terracotta/20 shadow-2xl rounded-lg max-h-56 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-terracotta/20"
          style={{
            top: `${panelPosition.top}px`,
            left: `${panelPosition.left}px`,
            width: `${panelPosition.width}px`,
          }}
          role="listbox"
          aria-multiselectable="true"
        >
          {filteredOptions.map((opt, idx) => {
            const isSelected = selectedValues.includes(opt.value);
            const isActive = idx === activeIndex;

            return (
              <li
                key={opt.value}
                onClick={() => handleSelectOption(opt.value)}
                className={`flex items-center justify-between px-4 py-2 text-sm font-semibold cursor-pointer select-none transition-colors ${
                  isActive
                    ? "bg-terracotta/20 text-cream"
                    : isSelected
                    ? "text-gold bg-cream/5"
                    : "text-cream/80 hover:bg-cream/5"
                }`}
                role="option"
                aria-selected={isSelected}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="w-4 h-4 text-gold flex-shrink-0" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
