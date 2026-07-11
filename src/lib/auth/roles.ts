export type Role = "admin" | "employee";

/**
 * Determines a user's role from their email.
 *  - Any address listed in NEXT_PUBLIC_ADMIN_EMAILS (comma-separated) is admin.
 *  - As a convenience for setup, an address whose local part is/starts with
 *    "admin" (e.g. admin@yourco.com) is also treated as admin.
 *  - Everyone else is an employee.
 */
export function roleForEmail(email: string | null | undefined): Role {
  if (!email) return "employee";
  const e = email.trim().toLowerCase();
  const local = e.split("@")[0] ?? "";
  const allow = (
    process.env.NEXT_PUBLIC_ADMIN_EMAILS ??
    "mohammedrayan@naazailabs.com,admin@naazailabs.com"
  )
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (allow.includes(e)) return "admin";
  if (local === "admin" || local.startsWith("admin")) return "admin";
  return "employee";
}
