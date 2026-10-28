"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";

interface NavLinksProps {
  readonly items: readonly { readonly href: string; readonly label: string }[];
  readonly label: string;
  /** Path of the home page, e.g. "/ru": it is "current" only on an exact match. */
  readonly homeHref: string;
}

export function NavLinks({ items, label, homeHref }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <nav aria-label={label}>
      <ul className="flex items-center gap-1">
        {items.map((item) => {
          const isCurrent =
            item.href === homeHref ? pathname === homeHref : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-9 items-center rounded-md px-2 text-sm hover:bg-muted",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  isCurrent ? "font-semibold text-foreground" : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
