import { createClient } from "@/lib/supabase/server";
import { roleForEmail, type Role } from "@/lib/auth/roles";
import { SUPABASE_CONFIGURED } from "@/lib/supabase/config";

/** Resolve the current user's role in Server Components / Route Handlers. */
export async function getServerRole(): Promise<{ email: string | null; role: Role; isAdmin: boolean }> {
  // Demo mode with no backend → full admin view.
  if (!SUPABASE_CONFIGURED) return { email: null, role: "admin", isAdmin: true };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.email ?? null;
  const role = roleForEmail(email);
  return { email, role, isAdmin: role === "admin" };
}
