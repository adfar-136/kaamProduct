"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { 
  User, 
  Mail, 
  ShieldAlert, 
  Settings, 
  Moon, 
  Sun, 
  LogOut, 
  ShieldCheck, 
  UserCheck, 
  Users, 
  Sparkles,
  Info
} from "lucide-react";

export default function SettingsClient({ session }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

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

  const user = session?.user;
  const name = user?.name || "Kaam User";
  const officialName = user?.official_name || name;
  const email = user?.email || "";
  const role = user?.role || "member";
  const teamId = user?.team_id || null;

  return (
    <AppShell session={session}>
      {/* Title */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide">
          <Settings className="w-3.5 h-3.5" />
          <span>System Settings</span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight mt-2 text-white leading-none">
          Preferences & Account ⚙️
        </h2>
        <p className="text-muted-foreground mt-2 font-medium">
          Manage your account profile, visual themes, and review cohort configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Details Card - Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Account Profile Box */}
          <div className="glass p-6 rounded-2xl space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-border/50 pb-3">
              <User className="w-5 h-5 text-primary" />
              <span>User Profile Details</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Public Name */}
              <div className="space-y-1.5 p-4 rounded-xl bg-background/40 border border-border/80">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Public Nickname</span>
                <p className="font-extrabold text-base text-white mt-1">{name}</p>
              </div>

              {/* Official Name */}
              <div className="space-y-1.5 p-4 rounded-xl bg-background/40 border border-border/80">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Official Full Name</span>
                <p className="font-extrabold text-base text-white mt-1">{officialName}</p>
              </div>

              {/* Email */}
              <div className="space-y-1.5 p-4 rounded-xl bg-background/40 border border-border/80 md:col-span-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</span>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-primary" />
                  <p className="font-extrabold text-sm text-white">{email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Theme Visual Controls */}
          <div className="glass p-6 rounded-2xl space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-border/50 pb-3">
              {mounted && resolvedTheme === "dark" ? (
                <Moon className="w-5 h-5 text-amber-400 animate-pulse" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500 animate-pulse" />
              )}
              <span>Visual Interface Theme</span>
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Switch the visual environment between sleek dark mode (highly recommended for high contrast) and warm light mode.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                id="settings-theme-dark-btn"
                onClick={() => setTheme("dark")}
                className={`flex items-center justify-center gap-2.5 p-4 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                  mounted && resolvedTheme === "dark"
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-background/40 border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Moon className="w-4.5 h-4.5" />
                <span>Dark Contrast</span>
              </button>

              <button
                id="settings-theme-light-btn"
                onClick={() => setTheme("light")}
                className={`flex items-center justify-center gap-2.5 p-4 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                  mounted && resolvedTheme === "light"
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-background/40 border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sun className="w-4.5 h-4.5" />
                <span>Light Contrast</span>
              </button>
            </div>
          </div>

        </div>

        {/* Cohort metadata panel - Right Column */}
        <div className="space-y-6">
          <div className="glass-premium p-6 rounded-2xl space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-border/50 pb-3">
              <Users className="w-5 h-5 text-primary" />
              <span>Squad Status</span>
            </h3>

            {teamId ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-background/50 border border-border/80 space-y-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Cohort Role</span>
                  
                  {role === "manager" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs font-extrabold text-amber-500 uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4" />
                      Warden / Manager
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/25 text-xs font-extrabold text-primary uppercase tracking-wider">
                      <UserCheck className="w-4 h-4" />
                      Cohort Member
                    </span>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-background/50 border border-border/80 space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Associated Team ID</span>
                  <p className="font-mono text-xs text-white break-all select-all font-semibold pt-1">{teamId}</p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/10 text-center space-y-2">
                <ShieldAlert className="w-8 h-8 text-destructive/80 mx-auto" />
                <p className="text-xs font-bold text-white">No Cohort Link Established</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Head over to the Dashboard to create a team or enter an invite code to join a competitive squad!
                </p>
              </div>
            )}

            {/* Logout Panel */}
            <div className="border-t border-border/60 pt-6">
              <button
                id="settings-logout-btn"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-destructive/10 hover:bg-destructive/15 border border-destructive/20 text-destructive font-extrabold text-sm transition-all cursor-pointer active:scale-95"
              >
                <LogOut className="w-4.5 h-4.5" />
                <span>Log out of Session</span>
              </button>
            </div>
          </div>

          {/* Quick Guide */}
          <div className="glass p-5 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-primary" />
              <span>Did you know?</span>
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Kaam uses a **native connection pool** for MongoDB, ensuring low-latency reads and writes when dragging tasks or loading leaderboards in real time.
            </p>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
