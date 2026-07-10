"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = React.useState<"login" | "signup">("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [notice, setNotice] = React.useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!isSupabaseConfigured) {
      setError("Supabase isn't configured. Add the environment variables and redeploy.");
      return;
    }
    setLoading(true);
    const supabase = createClient();

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) return setError(error.message);
      // If email confirmation is on, there's no session yet.
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace("/dashboard");
        router.refresh();
      } else {
        setNotice("Account created. Check your email to confirm, then sign in.");
        setMode("login");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) return setError(error.message);
      router.replace("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="app-ambient flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Zap className="size-6 fill-current" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Naaz AI CRM</h1>
            <p className="text-sm text-muted-foreground">
              {mode === "login" ? "Sign in to your workspace" : "Create your workspace account"}
            </p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 ring-1 ring-white/40 dark:ring-white/10">
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {notice && <p className="text-sm text-success">{notice}</p>}

            <Button type="submit" className="mt-1 w-full" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              {mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {mode === "login" ? "New to Naaz AI CRM?" : "Already have an account?"}{" "}
            <button
              type="button"
              className={cn("font-medium text-foreground hover:underline")}
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setNotice(""); }}
            >
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
