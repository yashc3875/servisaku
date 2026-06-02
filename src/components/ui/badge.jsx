import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-ink text-ink-inverse",
        secondary: "border-transparent bg-raised text-ink-secondary",
        brand: "border-transparent bg-brand-tint text-brand",
        accent: "border-transparent bg-accent-tint text-accent",
        success: "border-transparent bg-success-tint text-success",
        warning: "border-transparent bg-warning-tint text-warning",
        danger: "border-transparent bg-danger-tint text-danger",
        info: "border-transparent bg-info-tint text-info",
        outline: "text-ink border-hairline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }
