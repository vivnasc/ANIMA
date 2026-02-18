import * as React from "react"

import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = "Avatar"

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  onLoadingStatusChange?: (status: "loading" | "loaded" | "error") => void
}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, onLoadingStatusChange, onLoad, onError, ...props }, ref) => {
    const [hasError, setHasError] = React.useState(false)

    const handleLoad = React.useCallback(
      (event: React.SyntheticEvent<HTMLImageElement>) => {
        onLoadingStatusChange?.("loaded")
        onLoad?.(event)
      },
      [onLoadingStatusChange, onLoad]
    )

    const handleError = React.useCallback(
      (event: React.SyntheticEvent<HTMLImageElement>) => {
        setHasError(true)
        onLoadingStatusChange?.("error")
        onError?.(event)
      },
      [onLoadingStatusChange, onError]
    )

    if (hasError) {
      return null
    }

    return (
      <img
        ref={ref}
        className={cn("aspect-square h-full w-full object-cover", className)}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    )
  }
)
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }
