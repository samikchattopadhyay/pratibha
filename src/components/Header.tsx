"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, LogIn, User, Bell, LogOut, LayoutDashboard } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import ConfirmationModal from "./ConfirmationModal";
import NotificationDropdown from "./NotificationDropdown";
import Button from "./Button";
import NavLink from "./NavLink";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export default function Header({ isAdmin }: { isAdmin?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/login" });
    setIsLoggingOut(false);
  };

  const fetchNotifications = useCallback(async () => {
    if (status !== "authenticated") return;
    setNotifLoading(true);
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setNotifLoading(false);
    }
  }, [status]);

  const fetchProfileImage = useCallback(async (currentPathname: string) => {
    if (status !== "authenticated" || !session?.user) return;
    try {
      const isAdmin = currentPathname.startsWith("/admin");
      const isJudge = currentPathname.startsWith("/judge");
      const endpoint = isAdmin ? "/api/admin/profile" : isJudge ? "/api/judge/profile" : "/api/parent/profile";

      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        if (data.profileImageUrl) {
          setProfileImageUrl(data.profileImageUrl);
        }
      }
    } catch (error) {
      // Silently ignore profile image fetch errors
    }
  }, [status, session?.user]);

  const markNotificationRead = useCallback(async (id: string) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }, []);

  const dismissNotification = useCallback(async (id: string) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        setUnreadCount((prev) => {
          const notif = notifications.find((n) => n.id === id);
          return notif && !notif.read ? Math.max(0, prev - 1) : prev;
        });
      }
    } catch (error) {
      console.error("Failed to dismiss notification:", error);
    }
  }, [notifications]);

  useEffect(() => {
    if (status === "authenticated") {
      const init = async () => {
        await Promise.resolve();
        fetchNotifications();
        fetchProfileImage(pathname);
      };
      init();
    }
  }, [status, pathname, fetchNotifications, fetchProfileImage]);

  useEffect(() => {
    if (!notificationOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const source = new EventSource("/api/notifications/sse");

    source.addEventListener("new_notification", (event) => {
      try {
        const notification = JSON.parse(event.data);
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      } catch (error) {
        console.error("Failed to parse notification event:", error);
      }
    });

    source.addEventListener("error", () => {
      console.error("SSE connection error");
      source.close();
    });

    return () => source.close();
  }, [status]);

  const isCurrentlyAdmin = isAdmin !== undefined ? isAdmin : pathname.startsWith("/admin");
  const isCurrentlyJudge = pathname.startsWith("/judge");

  const navigation = isCurrentlyAdmin
    ? [{ name: "Council Admin Dashboard", href: "/admin/dashboard" }]
    : isCurrentlyJudge
    ? []
    : [
        { name: "Home", href: "/" },
        { name: "Competitions", href: "/competitions" },
        { name: "About Us", href: "/about" },
        { name: "FAQ", href: "/faq" },
        { name: "Contact", href: "/contact" },
      ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const getDashboardUrl = () => {
    if (isCurrentlyAdmin) return "/admin/profile";
    if (isCurrentlyJudge) return "/judge/profile";
    return "/parent/profile";
  };

  const getDashboardLabel = () => {
    if (isCurrentlyAdmin) return "Admin Profile";
    if (isCurrentlyJudge) return "My Profile";
    return "My Profile";
  };

  const getRoleDashboardUrl = () => {
    const user = session?.user as { role?: string } | undefined;
    const role = user?.role;
    if (role === "SUPER_ADMIN" || role === "MODERATOR" || isCurrentlyAdmin) return "/admin/dashboard";
    if (role === "JUDGE" || isCurrentlyJudge) return "/judge/dashboard";
    return "/parent/dashboard";
  };

  return (
    <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md border-b-4 border-terracotta/10 dark:bg-charcoal-light dark:border-terracotta/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href={isCurrentlyAdmin ? "/admin/dashboard" : isCurrentlyJudge ? "/judge/dashboard" : "/"} className="flex items-center gap-3 group">
              <Image src="/images/pp-sm-logo.png" alt="Pratibha Parishad Icon" width={48} height={48} className="rounded-full object-cover shadow-lg group-hover:scale-110 transition-transform duration-300" />
              <div className="flex flex-col">
                <span className="font-serif text-lg sm:text-xl font-bold tracking-wide text-terracotta dark:text-gold transition-colors duration-300">
                  PRATIBHA PARISHAD
                </span>
                <span className="font-sans text-sm font-semibold tracking-wider text-charcoal/60 dark:text-cream/60 uppercase">
                  Nurturing Talent, Celebrating Art.
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-8">
            {isCurrentlyAdmin ? (
              <div className="flex items-center space-x-4">
                <div ref={bellRef} className="relative">
                  <Button
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    variant="ghost"
                    size="sm"
                    className="relative p-2 text-charcoal/80 hover:text-terracotta dark:text-cream/80 dark:hover:text-gold h-auto w-auto"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Button>

                  {notificationOpen && (
                    <NotificationDropdown
                      notifications={notifications}
                      unreadCount={unreadCount}
                      loading={notifLoading}
                      onMarkRead={markNotificationRead}
                      onMarkAllRead={markAllNotificationsRead}
                      onDismiss={dismissNotification}
                    />
                  )}
                </div>

                <Link
                  href="/admin/dashboard"
                  className="p-2 rounded-full text-charcoal/80 hover:text-terracotta dark:text-cream/80 dark:hover:text-gold hover:bg-terracotta/5 dark:hover:bg-gold/5 transition-colors duration-300 cursor-pointer"
                  title="Admin Dashboard"
                >
                  <LayoutDashboard className="w-5 h-5" />
                </Link>
                <Link
                  href="/admin/profile"
                  className="p-2 rounded-full text-charcoal/80 hover:text-terracotta dark:text-cream/80 dark:hover:text-gold hover:bg-terracotta/5 dark:hover:bg-gold/5 transition-colors duration-300 cursor-pointer"
                  title="Admin Profile"
                >
                  <User className="w-5 h-5" />
                </Link>
                <Button
                  onClick={() => setShowLogoutConfirm(true)}
                  variant="ghost"
                  size="sm"
                  className="p-2 text-charcoal/80 hover:text-red-500 dark:text-cream/80 dark:hover:text-red-400 h-auto w-auto"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <>
                <nav className="flex space-x-6">
                  {navigation.map((item) => (
                    <div key={item.name} className="relative">
                      <NavLink
                        href={item.href}
                        variant="nav"
                        isActive={isActive(item.href)}
                        className="tracking-wide py-2"
                      >
                        {item.name}
                      </NavLink>
                      {isActive(item.href) && (
                        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-terracotta dark:bg-gold rounded-full" />
                      )}
                    </div>
                  ))}
                </nav>

                {status === "authenticated" ? (
                  <div className="flex items-center space-x-3">
                    <Link
                      href={getRoleDashboardUrl()}
                      className="p-2.5 rounded-full border border-terracotta/20 dark:border-terracotta/40 hover:border-terracotta dark:hover:border-gold text-terracotta dark:text-gold hover:bg-terracotta/5 dark:hover:bg-gold/5 transition-all duration-300 cursor-pointer flex items-center justify-center"
                      title="Go to Dashboard"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                    </Link>
                    <div ref={bellRef} className="relative">
                      <Button
                        onClick={() => setNotificationOpen(!notificationOpen)}
                        variant="outline"
                        size="sm"
                        className="relative p-2.5 border border-terracotta/20 dark:border-terracotta/40 hover:border-terracotta dark:hover:border-gold text-terracotta dark:text-gold h-auto w-auto"
                        title="Notifications"
                      >
                        <Bell className="w-4 h-4" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                      </Button>

                      {notificationOpen && (
                        <NotificationDropdown
                          notifications={notifications}
                          unreadCount={unreadCount}
                          loading={notifLoading}
                          onMarkRead={markNotificationRead}
                          onMarkAllRead={markAllNotificationsRead}
                          onDismiss={dismissNotification}
                        />
                      )}
                    </div>

                    <Link
                      href={getDashboardUrl()}
                      className="relative w-9 h-9 rounded-full border border-terracotta/20 dark:border-terracotta/40 hover:border-terracotta dark:hover:border-gold hover:bg-terracotta/5 dark:hover:bg-gold/5 transition-all duration-300 cursor-pointer flex items-center justify-center overflow-hidden"
                      title={getDashboardLabel()}
                    >
                      {profileImageUrl ? (
                        <Image src={profileImageUrl} alt="Profile" width={36} height={36} className="w-full h-full object-cover" unoptimized />
                      ) : (
                        <User className="w-4 h-4 text-terracotta dark:text-gold" />
                      )}
                    </Link>
                    <Button
                      onClick={() => setShowLogoutConfirm(true)}
                      variant="outline"
                      size="sm"
                      className="p-2.5 border border-terracotta/20 dark:border-terracotta/40 hover:border-terracotta dark:hover:border-gold text-terracotta dark:text-gold h-auto w-auto"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <NavLink href="/login" variant="ghost" size="md" className="flex items-center gap-2 text-charcoal/80 hover:text-terracotta dark:text-cream/80 dark:hover:text-gold">
                    <LogIn className="w-4 h-4" />
                    Log In
                  </NavLink>
                )}
              </>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex items-center md:hidden">
            <Button
              onClick={() => setIsOpen(!isOpen)}
              variant="ghost"
              size="sm"
              className="p-3 text-terracotta dark:text-gold h-auto w-auto"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div
        ref={menuRef}
        className={`md:hidden fixed top-20 left-0 w-full bg-cream border-b border-terracotta/10 shadow-xl dark:bg-charcoal dark:border-terracotta/10 z-50 py-4 px-6 transition-all duration-300 ${
          isOpen ? "opacity-100 scale-y-100 visible" : "opacity-0 scale-y-95 invisible origin-top pointer-events-none"
        }`}
      >
        <nav className="flex flex-col space-y-4">
            {isCurrentlyAdmin ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-terracotta/5">
                  <span className="font-sans text-sm font-bold text-charcoal/60 dark:text-cream/60 uppercase tracking-wider">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>
                <Link
                  href="/admin/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="font-sans text-base font-semibold py-2 border-b border-terracotta/5 text-charcoal/80 dark:text-cream/80 cursor-pointer block mt-3"
                >
                  Admin Dashboard
                </Link>
                <Link
                  href="/admin/profile"
                  onClick={() => setIsOpen(false)}
                  className="font-sans text-base font-semibold py-2 border-b border-terracotta/5 text-charcoal/80 dark:text-cream/80 cursor-pointer block"
                >
                  My Profile
                </Link>
                <Button
                  onClick={() => {
                    setIsOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  variant="destructive"
                  size="lg"
                  className="w-full mt-2"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`font-sans text-base font-semibold py-2 border-b border-terracotta/5 ${
                      isActive(item.href)
                        ? "text-terracotta dark:text-gold font-bold"
                        : "text-charcoal/80 dark:text-cream/80"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                {status === "authenticated" ? (
                  <div className="flex flex-col space-y-2">
                    <NavLink
                      href={getRoleDashboardUrl()}
                      onClick={() => setIsOpen(false)}
                      variant="button"
                      size="lg"
                      className="w-full"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Go to Dashboard
                    </NavLink>
                    <NavLink
                      href={getDashboardUrl()}
                      onClick={() => setIsOpen(false)}
                      variant="ghost"
                      size="lg"
                      className="w-full"
                    >
                      <User className="w-5 h-5" />
                      {getDashboardLabel()}
                    </NavLink>
                    <Button
                      onClick={() => {
                        setIsOpen(false);
                        setShowLogoutConfirm(true);
                      }}
                      variant="destructive"
                      size="lg"
                      className="w-full"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <NavLink
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    variant="ghost"
                    size="lg"
                    className="w-full flex items-center justify-center"
                  >
                    <LogIn className="w-5 h-5" />
                    Log In
                  </NavLink>
                )}
              </>
            )}
        </nav>
      </div>

      <ConfirmationModal
        isOpen={showLogoutConfirm}
        title="Logout Confirmation"
        message="Are you sure you want to logout? You'll need to log in again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        isLoading={isLoggingOut}
      />
    </header>
  );
}
