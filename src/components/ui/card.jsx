import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-2xl transition-all",
  {
    variants: {
      variant: {
        flat: "bg-surface border border-hairline", // Standard
        elevated: "bg-surface shadow-e1 border border-hairline/50", // Soft shadow
        floating: "bg-surface shadow-e3 border-0", // Floating panels
        ghost: "bg-transparent border-0", // Container only
      },
      interactive: {
        true: "hover:shadow-e2 active:scale-[0.98] cursor-pointer",
        false: "",
      },
      pad: {
        none: "p-0",
        sm: "p-3",
        default: "p-5",
        lg: "p-8",
      }
    },
    defaultVariants: {
      variant: "flat",
      interactive: false,
      pad: "default",
    }
  }
)

const Card = React.forwardRef(({ className, variant, interactive, pad, ...props }, ref) => (
  <div ref={ref} className={cn(cardVariants({ variant, interactive, pad, className }))} {...props} />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 mb-4", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-h3 font-semibold leading-none tracking-tight text-ink", className)} {...props} />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-ink-secondary", className)} {...props} />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center pt-4", className)} {...props} />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
