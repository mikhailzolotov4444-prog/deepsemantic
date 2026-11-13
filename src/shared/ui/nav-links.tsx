"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { RotatingLabel } from "./rotating-label";

interface NavLinksProps {
  readonly items: readonly { readonly href: string; readonly label: string }[];
  readonly label: string;
  /** Path of the home page, e.g. "/ru": it is "current" only on an exact match. */
  readonly homeHref: string;
  readonly className?: string;
}

/** Classes shared by every menu link (header, language switch, footer). */
export const menuLinkClass = cn(
  "metal-link inline-flex min-h-9 items-center rounded-md px-1 font-mono uppercase",
  "text-[13px] tracking-[0.1em] lg:text-[15px] lg:tracking-[0.15em] xl:text-lg xl:tracking-[0.17em]",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
);

export function NavLinks({ items, label, homeHref, className }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <nav aria-label={label} className={className}>
      <ul className="flex items-center justify-between gap-x-2 sm:justify-center sm:gap-x-10 lg:justify-start lg:gap-x-6 xl:gap-x-10">
        {items.map((item) => {
          const isCurrent =
            item.href === homeHref ? pathname === homeHref : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  menuLinkClass,
                  "hover:text-foreground",
                  isCurrent ? "font-semibold text-foreground" : "text-muted-foreground",
                )}
              >
                <RotatingLabel>{item.label}</RotatingLabel>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
