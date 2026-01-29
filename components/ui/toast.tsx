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
      className={cn(
        "pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5",
        variant === "destructive" 
          ? "bg-red-600 text-white" 
          : "bg-white text-gray-900"
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
              <p className={cn("mt-1 text-sm", variant === "destructive" ? "text-red-100" : "text-gray-500")}>
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onDismiss}
            className={cn(
              "ml-4 inline-flex rounded-md focus:outline-none focus:ring-2",
              variant === "destructive" 
                ? "text-red-100 hover:text-white focus:ring-white" 
                : "text-gray-400 hover:text-gray-500 focus:ring-gray-500"
            )}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
