"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Bell } from "lucide-react";
import Button from "./Button";
import Loading from "./Loading";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

interface NotificationDropdownProps {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDismiss: (id: string) => void;
}

export default function NotificationDropdown({
  notifications,
  unreadCount,
  loading,
  onMarkRead,
  onMarkAllRead,
  onDismiss,
}: NotificationDropdownProps) {
  const [dismissingIds, setDismissingIds] = useState<Set<string>>(new Set());

  const handleDismiss = (id: string) => {
    setDismissingIds((prev) => new Set([...prev, id]));
    onDismiss(id);
  };

  const handleMarkRead = (id: string) => {
    onMarkRead(id);
  };

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    const formatter = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    });
    return formatter.format(date);
  };

  return (
    <div className="absolute right-0 mt-3 w-96 bg-white dark:bg-charcoal-light rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <Button
              onClick={onMarkAllRead}
              variant="ghost"
              size="sm"
              className="text-sm font-medium text-terracotta hover:text-orange-600 dark:text-gold dark:hover:text-gold-light p-0 h-auto"
            >
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {loading && (
          <div className="px-6 py-8 flex justify-center">
            <Loading variant="inline" text="Loading notifications..." className="text-gray-500 dark:text-gray-400" />
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Bell
              size={32}
              className="mx-auto mb-3 text-gray-300 dark:text-gray-600"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No notifications yet
            </p>
          </div>
        )}

        {!loading &&
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-charcoal-lighter transition-colors ${
                !notif.read ? "border-l-2 border-l-gold bg-yellow-50 dark:bg-opacity-10" : ""
              }`}
            >
              <div className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {notif.actionUrl ? (
                      <Link
                        href={notif.actionUrl}
                        className="block hover:text-terracotta transition-colors"
                      >
                        <p
                          className={`font-medium text-sm ${
                            notif.read
                              ? "text-gray-700 dark:text-gray-300"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {notif.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                          {notif.body}
                        </p>
                      </Link>
                    ) : (
                      <>
                        <p
                          className={`font-medium text-sm ${
                            notif.read
                              ? "text-gray-700 dark:text-gray-300"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {notif.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                          {notif.body}
                        </p>
                      </>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      {formatRelativeTime(notif.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-2">
                    {!notif.read && (
                      <Button
                        onClick={() => handleMarkRead(notif.id)}
                        variant="ghost"
                        size="sm"
                        className="text-gold hover:text-yellow-600 dark:hover:text-gold-light p-1 h-auto w-auto"
                        title="Mark as read"
                      >
                        <div className="w-2 h-2 rounded-full bg-gold" />
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDismiss(notif.id)}
                      disabled={dismissingIds.has(notif.id)}
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 disabled:opacity-50 h-auto w-auto"
                      title="Dismiss"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Footer */}
      {!loading && notifications.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-3 text-center">
          <Link
            href="/notifications"
            className="text-sm font-medium text-terracotta hover:text-orange-600 transition-colors"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
