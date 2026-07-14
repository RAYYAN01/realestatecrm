export type Role = "admin" | "employee";

/**
 * Determines a user's role from their email.
 *  - ONLY addresses explicitly listed in NEXT_PUBLIC_ADMIN_EMAILS
 *    (comma-separated) are admins.
 *  - Everyone else is an employee.
 *
 * Note: there is deliberately no "starts with admin" shortcut — that would let
 * anyone self-register as admin@… and read revenue. Admins are an allowlist.
 */
export function roleForEmail(email: string | null | undefined): Role {
  if (!email) return "employee";
  const e = email.trim().toLowerCase();
  const allow = (
    process.env.NEXT_PUBLIC_ADMIN_EMAILS ??
    "mohammedrayan@naazailabs.com,admin@naazailabs.com"
  )
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return allow.includes(e) ? "admin" : "employee";
}
