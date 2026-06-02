import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-ink text-ink-inverse hover:bg-ink-secondary", // Standard primary
        primary: "bg-brand text-brand-ink hover:brightness-110", // The deep green
        accent: "bg-accent text-white hover:brightness-110", // High conversion orange
        tonal: "bg-brand-tint text-brand hover:bg-brand/10", // Soft background
        outline: "border border-hairline bg-surface text-ink hover:bg-raised",
        ghost: "hover:bg-raised text-ink-secondary hover:text-ink",
        'ghost-ink': "hover:bg-raised text-ink hover:text-ink-primary",
        destructive: "bg-danger text-white hover:brightness-110",
        link: "text-brand underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-13 rounded-2xl px-8 text-base", // 52px height for premium feel
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, loading = false, children, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </Comp>
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
