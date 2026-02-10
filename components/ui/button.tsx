import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium",
    "transition-all duration-300 ease-out",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
    "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "active:scale-[0.98]",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground",
          "hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25",
          "dark:shadow-lg dark:shadow-primary/20 dark:hover:shadow-primary/40",
        ].join(" "),
        gradient: [
          "bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 text-white",
          "hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600",
          "shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40",
          "hover:scale-[1.02]",
        ].join(" "),
        glow: [
          "bg-primary text-primary-foreground",
          "shadow-lg shadow-primary/30",
          "hover:shadow-xl hover:shadow-primary/50",
          "hover:scale-[1.02]",
          "animate-pulse-glow",
        ].join(" "),
        destructive: [
          "bg-destructive text-white",
          "hover:bg-destructive/90 hover:shadow-lg hover:shadow-destructive/25",
          "dark:bg-destructive/80",
        ].join(" "),
        outline: [
          "border border-border bg-transparent",
          "hover:bg-secondary/50 hover:border-primary/30",
          "dark:border-border/50 dark:hover:bg-secondary/30",
        ].join(" "),
        secondary: [
          "bg-secondary text-secondary-foreground",
          "hover:bg-secondary/80",
          "dark:bg-secondary/50 dark:hover:bg-secondary/70",
        ].join(" "),
        ghost: [
          "hover:bg-secondary/50 hover:text-foreground",
          "dark:hover:bg-secondary/30",
        ].join(" "),
        link: [
          "text-primary underline-offset-4 hover:underline",
          "hover:text-primary/80",
        ].join(" "),
        glass: [
          "glass-card text-foreground",
          "hover:bg-secondary/50 hover:border-primary/30",
        ].join(" "),
      },
      size: {
        default: "h-10 px-5 py-2 has-[>svg]:px-4",
        xs: "h-7 gap-1 rounded-lg px-2.5 text-xs has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 rounded-lg gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-12 rounded-xl px-8 text-base has-[>svg]:px-6",
        xl: "h-14 rounded-2xl px-10 text-lg has-[>svg]:px-8",
        icon: "size-10 rounded-xl",
        "icon-xs": "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9 rounded-lg",
        "icon-lg": "size-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
