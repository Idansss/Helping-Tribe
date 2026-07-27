'use client'

import { useToast } from "@/hooks/use-toast"
import { Toast } from "./toast"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="pointer-events-none fixed right-0 top-0 z-[100] flex max-h-dvh w-full flex-col-reverse gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:flex-col md:max-w-[26rem] md:p-4">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onDismiss={() => dismiss(toast.id)}
        />
      ))}
    </div>
  )
}
