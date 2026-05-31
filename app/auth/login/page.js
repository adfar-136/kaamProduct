"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { KeyRound, Mail, Loader2, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await authClient.signIn.email({
        email,
        password,
      });

      if (res.error) {
        console.error("Better Auth SignIn Error:", res.error);
        setError(res.error.message || `Failed to sign in. Code: ${res.error.code || "unknown"}`);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error("Unexpected signin error:", err);
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

      <div className="w-full max-w-md z-10">
        {/* App Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-3 text-sm font-semibold tracking-wide animate-pulse">
            <Sparkles className="w-4 h-4" />
            <span>Productivity Redefined</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-primary-foreground to-primary bg-clip-text text-transparent">
            Kaam with productivity
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            Focus. Compete. Conquer.
          </p>
        </div>

        {/* Login Form Card */}
        <div className="glass-premium rounded-2xl p-8 backdrop-blur-xl">
          <h2 className="text-2xl font-bold tracking-tight text-white mb-6 text-center">
            Welcome Back
          </h2>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
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
                  className="block w-full pl-11 pr-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground placeholder-muted-foreground outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
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
                  className="block w-full pl-11 pr-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground placeholder-muted-foreground outline-none transition-all"
                />
              </div>
            </div>

            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Get Ready</span>
                </>
              ) : (
                <span>Buckle Up & Enter 🚀</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account yet?{" "}
            <Link
              id="register-link"
              href="/auth/register"
              className="text-primary hover:text-primary/80 font-bold transition-colors underline underline-offset-4"
            >
              Join the cohort
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
