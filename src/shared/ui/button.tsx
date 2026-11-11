import type { ComponentProps } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

/*
 * `btn*` classes are the Noir Deco look of the dark theme (see app/noir.css); the Tailwind
 * classes next to them are the plain look of the light theme.
 */
const buttonVariants = cva(
  [
    "btn inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium",
    "transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        default: "btn-brass bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "btn-ink border border-border bg-background hover:bg-muted",
        ghost: "btn-quiet hover:bg-muted",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "btn-sm h-9 px-3",
        icon: "btn-icon size-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps extends ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  /** Render the child element (e.g. a Next.js <Link>) with button styles instead of a <button>. */
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";
  return <Component className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
