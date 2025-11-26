import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-2 px-3 py-1 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-teal-700 bg-teal-700 text-white dark:border-teal-600 dark:bg-teal-600 dark:text-white",
        critical: "border-red-700 bg-red-700 text-white dark:border-red-600 dark:bg-red-600 dark:text-white",
        major: "border-orange-700 bg-orange-700 text-white dark:border-orange-600 dark:bg-orange-600 dark:text-white",
        minor: "border-yellow-700 bg-yellow-700 text-white dark:border-yellow-600 dark:bg-yellow-600 dark:text-white",
        info: "border-blue-700 bg-blue-700 text-white dark:border-blue-600 dark:bg-blue-600 dark:text-white",
        outline: "border-gray-700 bg-gray-700 text-white dark:border-gray-600 dark:bg-gray-600 dark:text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }