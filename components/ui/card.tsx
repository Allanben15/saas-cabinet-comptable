import * as React from "react"

import { cn } from "@/lib/utils"

interface CardProps extends React.ComponentProps<"div"> {
  variant?: 'default' | 'glass' | 'glow' | 'gradient'
  glowColor?: 'primary' | 'cyan' | 'emerald' | 'amber' | 'rose'
}

function Card({ className, variant = 'default', glowColor, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        // Base styles
        "relative flex flex-col gap-6 rounded-2xl py-6 transition-all duration-300",
        // Default variant - glassmorphism in dark mode
        variant === 'default' && [
          "bg-card/80 backdrop-blur-xl",
          "border border-border/50",
          "shadow-xl shadow-black/5",
          "dark:bg-zinc-900/60 dark:border-white/[0.08]",
          "dark:shadow-2xl dark:shadow-black/20",
        ],
        // Glass variant - full glassmorphism
        variant === 'glass' && [
          "glass-card",
          "hover:border-primary/30",
          "hover:shadow-2xl hover:shadow-primary/10",
        ],
        // Glow variant - with glow effect on hover
        variant === 'glow' && [
          "glass-card glass-hover border-glow",
          glowColor === 'primary' && 'hover:glow-sm',
          glowColor === 'cyan' && 'hover:glow-cyan',
          glowColor === 'emerald' && 'hover:glow-emerald',
          glowColor === 'amber' && 'hover:glow-amber',
          glowColor === 'rose' && 'hover:glow-rose',
          !glowColor && 'hover:glow-sm',
        ],
        // Gradient variant - with gradient border
        variant === 'gradient' && [
          "glass-card border-glow-animated",
        ],
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "leading-none font-semibold text-foreground",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
