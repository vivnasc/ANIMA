"use client"

import {
  useToast,
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:flex-col md:max-w-[420px]">
      {toasts.map((t) => (
        <ToastRoot key={t.id} variant={t.variant}>
          <div className="grid gap-1">
            {t.title && <ToastTitle>{t.title}</ToastTitle>}
            {t.description && (
              <ToastDescription>{t.description}</ToastDescription>
            )}
          </div>
          {t.action}
          <ToastClose onClick={() => dismiss(t.id)} />
        </ToastRoot>
      ))}
    </div>
  )
}
