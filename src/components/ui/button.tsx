import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * The whole button system: three emphasis levels plus one semantic state.
 *
 *   primary      bronze fill — the single main action of a view
 *   secondary    hairline border on paper — an equally valid, quieter action
 *   ghost        no border — tertiary actions, icon-only controls
 *   destructive  the same component with a semantic error state
 *
 * Nothing else: every button in the product shares this radius, height,
 * padding, type, focus ring and transition, so the interface reads as one
 * designed system rather than a pile of one-off controls.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-[background-color,border-color,box-shadow,transform,color] duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /* The two action weights lift a hair toward the cursor on hover and
           settle flat on press — responsive, never flashy. `motion-safe` so
           reduced-motion visitors only ever see the colour change. */
        primary:
          "bg-bronze-solid text-bronze-foreground shadow-xs hover:bg-bronze-solid-hover hover:shadow-card motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0",
        secondary:
          "border border-border bg-transparent text-foreground hover:border-border-strong hover:bg-secondary/60 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0",
        ghost: "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        default: "h-10 px-[18px] py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-6",
        icon: "h-10 w-10",
        'icon-sm': "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
