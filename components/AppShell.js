"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  Lightbulb, 
  Users, 
  Settings, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X,
  Sparkles,
  UserCheck,
  ShieldCheck
} from "lucide-react";

export default function AppShell({ children, session }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Avoid hydration mismatched content by only rendering themes after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth/login");
          router.refresh();
        }
      }
    });
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, id: "nav-dashboard" },
    { name: "Brainstorm", href: "/brainstorm", icon: Lightbulb, id: "nav-brainstorm" },
    { name: "Team", href: "/team", icon: Users, id: "nav-team" },
    { name: "Settings", href: "/settings", icon: Settings, id: "nav-settings" },
  ];

  const user = session?.user;
  const officialName = user?.official_name || user?.name || "Kaam User";
  const role = user?.role || "member";
  const email = user?.email || "";

  // Get initials for profile placeholder
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-300">
      {/* 1. DESKTOP SIDEBAR - Hidden on Mobile */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card/45 backdrop-blur-xl z-20 shrink-0">
        {/* Sidebar Header */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-extrabold shadow-md shadow-primary/20">
            K
          </div>
          <div>
            <h1 className="font-extrabold tracking-tight text-xl bg-gradient-to-r from-white to-primary bg-clip-text text-transparent">
              Kaam
            </h1>
            <p className="text-[10px] text-muted-foreground font-medium -mt-1 tracking-wider uppercase">
              Productivity Hub
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-6 px-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                id={item.id}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold transition-all group cursor-pointer ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/10"
                    : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                }`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer with Profile & Theme Selector */}
        <div className="p-4 border-t border-border bg-secondary/10 space-y-4">
          {/* User Badge Info */}
          <div className="flex items-center gap-3 p-2 rounded-xl bg-background/40 border border-border/40">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm select-none">
              {getInitials(officialName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm text-foreground truncate leading-none">
                {officialName}
              </p>
              <div className="flex items-center gap-1 mt-1.5">
                {role === "manager" ? (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[9px] font-bold text-amber-500 uppercase tracking-wider">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    Warden
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-[9px] font-bold text-primary uppercase tracking-wider">
                    <UserCheck className="w-2.5 h-2.5" />
                    Member
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
            {/* Theme Toggle */}
            <button
              id="theme-toggle-desktop"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg border border-border bg-background/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Toggle Dark Mode"
            >
              {mounted && resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Logout */}
            <button
              id="logout-btn-desktop"
              onClick={handleLogout}
              className="flex items-center gap-2 p-2 px-3 rounded-lg border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 text-destructive font-bold text-xs transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MOBILE INTERFACE */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="md:hidden h-14 border-b border-border bg-card/45 backdrop-blur-xl px-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white font-extrabold text-sm">
              K
            </div>
            <span className="font-extrabold text-lg text-foreground">Kaam</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="theme-toggle-mobile"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="p-1.5 rounded-lg border border-border bg-background/40 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {mounted && resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
            
            <button
              id="logout-btn-mobile"
              onClick={handleLogout}
              className="p-1.5 rounded-lg border border-destructive/20 bg-destructive/5 text-destructive transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar - Sticky at bottom */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-border bg-card/80 backdrop-blur-lg px-4 flex items-center justify-around z-20 pb-safe">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                id={`${item.id}-mobile`}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-colors cursor-pointer ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="w-5.5 h-5.5" />
                <span className="text-[10px] font-bold mt-1">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
