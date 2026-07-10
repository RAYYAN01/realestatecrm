"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Board", href: "/pipeline" },
  { label: "Won", href: "/pipeline/won" },
  { label: "Lost", href: "/pipeline/lost" },
];

export function PipelineTabs() {
  const pathname = usePathname();
  return (
    <div className="inline-flex h-9 items-center gap-1 rounded-lg bg-muted p-1">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-md px-3 py-1 text-sm font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
