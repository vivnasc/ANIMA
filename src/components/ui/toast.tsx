"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type ToastVariant = "default" | "destructive"

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
  action?: React.ReactNode
}

type ToastAction =
  | { type: "ADD"; toast: Toast }
  | { type: "DISMISS"; id: string }
  | { type: "REMOVE"; id: string }

interface ToastContextValue {
  toasts: Toast[]
  toast: (props: Omit<Toast, "id">) => string
  dismiss: (id: string) => void
}

/* -------------------------------------------------------------------------- */
/*  Context                                                                   */
/* -------------------------------------------------------------------------- */

const ToastContext = React.createContext<ToastContextValue | undefined>(
  undefined
)

let toastCount = 0
function genId() {
  toastCount = (toastCount + 1) % Number.MAX_SAFE_INTEGER
  return toastCount.toString()
}

function toastReducer(state: Toast[], action: ToastAction): Toast[] {
  switch (action.type) {
    case "ADD":
      return [...state, action.toast]
    case "DISMISS":
      return state.map((t) =>
        t.id === action.id ? { ...t, _dismissed: true } as Toast : t
      )
    case "REMOVE":
      return state.filter((t) => t.id !== action.id)
    default:
      return state
  }
}

/* -------------------------------------------------------------------------- */
/*  Provider                                                                  */
/* -------------------------------------------------------------------------- */

const TOAST_DURATION = 5000

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, dispatch] = React.useReducer(toastReducer, [])

  const dismiss = React.useCallback((id: string) => {
    dispatch({ type: "DISMISS", id })
    // Remove from DOM after exit animation
    setTimeout(() => {
      dispatch({ type: "REMOVE", id })
    }, 300)
  }, [])

  const toast = React.useCallback(
    (props: Omit<Toast, "id">) => {
      const id = genId()
      dispatch({ type: "ADD", toast: { id, ...props } })

      const duration = props.duration ?? TOAST_DURATION
      setTimeout(() => {
        dismiss(id)
      }, duration)

      return id
    },
    [dismiss]
  )

  const value = React.useMemo(
    () => ({ toasts, toast, dismiss }),
    [toasts, toast, dismiss]
  )

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  )
}

/* -------------------------------------------------------------------------- */
/*  Hook                                                                      */
/* -------------------------------------------------------------------------- */

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) {
    throw new Error("useToast must be used within a <ToastProvider>")
  }
  return ctx
}

/* -------------------------------------------------------------------------- */
/*  Presentational components                                                 */
/* -------------------------------------------------------------------------- */

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[state=open]:animate-in data-[state=open]:slide-in-from-top-full data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full",
  {
    variants: {
      variant: {
        default: "border-border bg-background text-foreground",
        destructive:
          "border-destructive/50 bg-destructive text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface ToastRootProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  open?: boolean
}

const ToastRoot = React.forwardRef<HTMLDivElement, ToastRootProps>(
  ({ className, variant, open = true, ...props }, ref) => (
    <div
      ref={ref}
      data-state={open ? "open" : "closed"}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
)
ToastRoot.displayName = "ToastRoot"

const ToastTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm font-semibold [&+div]:text-xs", className)}
    {...props}
  />
))
ToastTitle.displayName = "ToastTitle"

const ToastDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = "ToastDescription"

const ToastClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none group-hover:opacity-100",
      className
    )}
    aria-label="Close"
    {...props}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  </button>
))
ToastClose.displayName = "ToastClose"

const ToastAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = "ToastAction"

export {
  toastVariants,
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
