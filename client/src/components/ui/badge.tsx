import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-success text-white hover:bg-success/80",
        warning: "border-transparent bg-warning text-white hover:bg-warning/80",
      },
      clickable: {
        true: "cursor-pointer",
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      clickable: false
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
    onClick?: () => void;
}

function Badge({ className, variant, clickable, onClick, ...props }: BadgeProps) {
  return (
    <div 
      className={cn(badgeVariants({ variant, clickable }), className)} 
      onClick={onClick}
      {...props} 
    />
  )
}

export { Badge, badgeVariants }
