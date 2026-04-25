"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

// ── State context ─────────────────────────────────────────────────────────────
const DialogCtx = React.createContext<{
  open: boolean
  setOpen: (v: boolean) => void
}>({ open: false, setOpen: () => {} })

// ── Dialog Root ───────────────────────────────────────────────────────────────
interface DialogRootProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

function Dialog({ open, defaultOpen = false, onOpenChange, children }: DialogRootProps) {
  const [internal, setInternal] = React.useState(defaultOpen)
  const isOpen = open ?? internal
  const setOpen = (v: boolean) => {
    setInternal(v)
    onOpenChange?.(v)
  }
  return (
    <DialogCtx.Provider value={{ open: isOpen, setOpen }}>
      {children}
    </DialogCtx.Provider>
  )
}

// ── Trigger ───────────────────────────────────────────────────────────────────
function DialogTrigger({
  children,
  asChild,
  ...props
}: React.HTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const { setOpen } = React.useContext(DialogCtx)
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
      onClick: (e: React.MouseEvent) => {
        const original = (children as React.ReactElement<React.HTMLAttributes<HTMLElement>>).props.onClick
        original?.(e as React.MouseEvent<HTMLElement>)
        setOpen(true)
      },
    })
  }
  return (
    <button type="button" data-slot="dialog-trigger" onClick={() => setOpen(true)} {...props}>
      {children}
    </button>
  )
}

// ── Portal (renders inline — no real portal needed for this project) ───────────
function DialogPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

// ── Close ─────────────────────────────────────────────────────────────────────
function DialogClose({
  children,
  render,
  ...props
}: React.HTMLAttributes<HTMLButtonElement> & { render?: React.ReactElement }) {
  const { setOpen } = React.useContext(DialogCtx)
  if (render) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return React.cloneElement(render as React.ReactElement<any>, {
      onClick: () => setOpen(false),
    })
  }
  return (
    <button type="button" data-slot="dialog-close" onClick={() => setOpen(false)} {...props}>
      {children}
    </button>
  )
}

// ── Overlay ───────────────────────────────────────────────────────────────────
function DialogOverlay({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { setOpen } = React.useContext(DialogCtx)
  return (
    <div
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 backdrop-blur-sm",
        className
      )}
      onClick={() => setOpen(false)}
      {...props}
    />
  )
}

// ── Content ───────────────────────────────────────────────────────────────────
function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { showCloseButton?: boolean }) {
  const { open, setOpen } = React.useContext(DialogCtx)
  if (!open) return null
  return (
    <DialogPortal>
      <DialogOverlay />
      <div
        role="dialog"
        aria-modal="true"
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 outline-none sm:max-w-sm",
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
        {showCloseButton && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute top-2 right-2"
            onClick={() => setOpen(false)}
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </Button>
        )}
      </div>
    </DialogPortal>
  )
}

// ── Header / Footer / Title / Description ─────────────────────────────────────
function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="dialog-header" className={cn("flex flex-col gap-2", className)} {...props} />
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { showCloseButton?: boolean }) {
  const { setOpen } = React.useContext(DialogCtx)
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <Button variant="outline" onClick={() => setOpen(false)}>
          Close
        </Button>
      )}
    </div>
  )
}

function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      data-slot="dialog-title"
      className={cn("font-heading text-base leading-none font-medium", className)}
      {...props}
    />
  )
}

function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
