"use client";

import * as React from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { roleForEmail, type Role } from "@/lib/auth/roles";

type AuthState = {
  email: string | null;
  role: Role;
  isAdmin: boolean;
  loading: boolean;
};

const AuthContext = React.createContext<AuthState>({
  email: null,
  role: "employee",
  isAdmin: false,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Demo mode (no Supabase configured) → treat viewer as admin so the full
  // product is visible without a login.
  const [state, setState] = React.useState<AuthState>(() =>
    isSupabaseConfigured
      ? { email: null, role: "employee", isAdmin: false, loading: true }
      : { email: null, role: "admin", isAdmin: true, loading: false }
  );

  React.useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email ?? null;
      const role = roleForEmail(email);
      setState({ email, role, isAdmin: role === "admin", loading: false });
    });
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return React.useContext(AuthContext);
}
