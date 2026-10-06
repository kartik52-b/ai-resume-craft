import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "field-inset flex min-h-[80px] w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground ring-offset-background transition-colors placeholder:text-muted-2 focus-visible:border-bronze focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/15 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
