"use client";

import { ReactNode } from "react";
import { AlertCircle, X } from "lucide-react";
import Button from "./Button";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-charcoal-light border border-terracotta/30 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {isDangerous && (
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            )}
            <h2 className="font-serif text-lg font-bold text-cream">{title}</h2>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-cream/60 hover:text-cream disabled:opacity-50 cursor-pointer transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message */}
        <div className="text-cream/80 text-sm leading-relaxed">{message}</div>

        {/* Footer Buttons */}
        <div className="flex gap-3 justify-end pt-2">
          <Button
            onClick={onCancel}
            disabled={isLoading}
            variant="secondary"
            size="md"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            variant={isDangerous ? "destructive" : "primary"}
            size="md"
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
