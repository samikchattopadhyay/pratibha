"use client";

import Button from "./Button";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 min-h-screen">
      <div className="bg-cream dark:bg-charcoal rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] border border-terracotta/10 dark:border-terracotta/20 overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-terracotta/5 to-gold/5 dark:from-terracotta/10 dark:to-gold/10 p-6 border-b border-terracotta/10 dark:border-terracotta/20">
          <h2 className="text-xl font-serif font-bold text-charcoal dark:text-cream">
            {title}
          </h2>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          <p className="text-base text-charcoal/80 dark:text-cream/80 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-terracotta/10 dark:border-terracotta/20 bg-terracotta/5 dark:bg-gold/5 flex-shrink-0">
          <Button
            onClick={onCancel}
            disabled={isLoading}
            variant="outline"
            size="md"
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            variant={isDestructive ? "destructive" : "primary"}
            size="md"
            isLoading={isLoading}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
