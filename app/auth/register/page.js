"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { KeyRound, Mail, User, ShieldCheck, Loader2, Sparkles } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [officialName, setOfficialName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !officialName || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await authClient.signUp.email({
        email,
        password,
        name,
        official_name: officialName, // Custom field registered in Better Auth
      });

      if (res.error) {
        console.error("Better Auth SignUp Error:", res.error);
        setError(res.error.message || `Registration failed. Code: ${res.error.code || "unknown"}`);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error("Unexpected signup error:", err);
      setError("An unexpected error occurred. Please check console logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-radial from-background via-background to-secondary/30 p-4 select-none">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10 py-6">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-3 text-sm font-semibold tracking-wide">
            <Sparkles className="w-4 h-4" />
            <span>Create Your Productivity Cohort</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-primary-foreground to-primary bg-clip-text text-transparent">
            Kaam
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            Focus. Compete. Conquer.
          </p>
        </div>

        {/* Register Form Card */}
        <div className="glass-premium rounded-2xl p-8 backdrop-blur-xl">
          <h2 className="text-2xl font-bold tracking-tight text-white mb-6 text-center">
            Join the Squad
          </h2>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name-input" className="text-sm font-semibold text-muted-foreground">
                Public Nickname
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <User className="w-5 h-5" />
                </div>
                <input
                  id="name-input"
                  type="text"
                  required
                  placeholder="e.g. John"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-11 pr-4 py-2.5 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground placeholder-muted-foreground outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="official-name-input" className="text-sm font-semibold text-muted-foreground">
                Official Name (For Leaderboards & Reports)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <input
                  id="official-name-input"
                  type="text"
                  required
                  placeholder="e.g. Johnathan Doe"
                  value={officialName}
                  onChange={(e) => setOfficialName(e.target.value)}
                  className="block w-full pl-11 pr-4 py-2.5 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground placeholder-muted-foreground outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email-input" className="text-sm font-semibold text-muted-foreground">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email-input"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-2.5 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground placeholder-muted-foreground outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password-input" className="text-sm font-semibold text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <KeyRound className="w-5 h-5" />
                </div>
                <input
                  id="password-input"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-2.5 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground placeholder-muted-foreground outline-none transition-all"
                />
              </div>
            </div>

            <button
              id="register-btn"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <span>Launch Your Dashboard 🚀</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              id="login-link"
              href="/auth/login"
              className="text-primary hover:text-primary/80 font-bold transition-colors underline underline-offset-4"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
