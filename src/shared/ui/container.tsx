import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/utils";

/** Centred page column with the same side padding everywhere. */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-5xl px-4", className)} {...props} />;
}
