"use client";

import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import Button from "./Button";

export interface ToastProps {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  body?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export default function Toast({
  id,
  type,
  title,
  body,
  duration = 5000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    if (duration === 0) return;
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getStyles = () => {
    switch (type) {
      case "success":
        return {
          bgColor: "bg-green-50 dark:bg-green-900/20",
          borderColor: "border-l-4 border-l-green-500",
          textColor: "text-green-900 dark:text-green-100",
          iconColor: "text-green-500",
          icon: CheckCircle,
        };
      case "error":
        return {
          bgColor: "bg-red-50 dark:bg-red-900/20",
          borderColor: "border-l-4 border-l-red-500",
          textColor: "text-red-900 dark:text-red-100",
          iconColor: "text-red-500",
          icon: AlertCircle,
        };
      case "warning":
        return {
          bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
          borderColor: "border-l-4 border-l-yellow-500",
          textColor: "text-yellow-900 dark:text-yellow-100",
          iconColor: "text-yellow-500",
          icon: AlertTriangle,
        };
      case "info":
      default:
        return {
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
          borderColor: "border-l-4 border-l-blue-500",
          textColor: "text-blue-900 dark:text-blue-100",
          iconColor: "text-blue-500",
          icon: Info,
        };
    }
  };

  const styles = getStyles();
  const Icon = styles.icon;

  return (
    <div
      className={`${styles.bgColor} ${styles.borderColor} rounded-lg shadow-lg p-4 mb-3 flex items-start gap-3 max-w-sm animate-slide-in`}
    >
      <Icon className={`${styles.iconColor} flex-shrink-0 mt-0.5`} size={20} />
      <div className="flex-1">
        <h3 className={`font-semibold text-sm ${styles.textColor}`}>{title}</h3>
        {body && (
          <p className={`text-sm mt-1 ${styles.textColor} opacity-80`}>{body}</p>
        )}
      </div>
      <Button
        onClick={() => onClose(id)}
        variant="ghost"
        size="sm"
        className={`${styles.textColor} opacity-60 hover:opacity-100 transition-opacity flex-shrink-0 p-0 h-auto w-auto`}
        aria-label="Close"
      >
        <X size={16} />
      </Button>
    </div>
  );
}
