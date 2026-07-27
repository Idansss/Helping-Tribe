import * as React from "react"
import { cn } from "@/lib/utils/cn"
import { X } from "lucide-react"

export interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
  onDismiss: () => void
}

export function Toast({ id, title, description, variant = "default", onDismiss }: ToastProps) {
  return (
    <div
      id={id}
      role={variant === "destructive" ? "alert" : "status"}
      aria-live={variant === "destructive" ? "assertive" : "polite"}
      className={cn(
        "pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl border shadow-xl",
        variant === "destructive"
          ? "border-destructive/35 bg-popover text-popover-foreground"
          : "border-border bg-popover text-popover-foreground"
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-1">
            {title && (
              <p className="text-sm font-medium">
                {title}
              </p>
            )}
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onDismiss}
            className={cn(
              "ml-4 inline-flex rounded-md focus:outline-none focus:ring-2",
              variant === "destructive"
                ? "text-destructive hover:bg-destructive/10 focus:ring-destructive"
                : "text-muted-foreground hover:bg-accent hover:text-foreground focus:ring-ring"
            )}
            aria-label="Dismiss notification"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
