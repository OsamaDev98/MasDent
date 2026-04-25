"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDownIcon } from "lucide-react"

// ── Native <select> wrapper — matches the exported API used in the codebase ──

interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children?: React.ReactNode
  disabled?: boolean
  name?: string
}

const SelectContext = React.createContext<{
  value: string
  onChange: (v: string) => void
}>({ value: "", onChange: () => {} })

function Select({ value, defaultValue = "", onValueChange, children }: SelectProps) {
  const [internal, setInternal] = React.useState(defaultValue)
  const current = value ?? internal
  const onChange = (v: string) => {
    setInternal(v)
    onValueChange?.(v)
  }
  return (
    <SelectContext.Provider value={{ value: current, onChange }}>
      {children}
    </SelectContext.Provider>
  )
}

function SelectGroup({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="select-group" className={cn("scroll-my-1 p-1", className)} {...props}>
      {children}
    </div>
  )
}

function SelectValue({ placeholder, className }: { placeholder?: string; className?: string }) {
  const { value } = React.useContext(SelectContext)
  return (
    <span data-slot="select-value" className={cn("flex flex-1 text-left", className)}>
      {value || placeholder}
    </span>
  )
}

function SelectTrigger({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { size?: "sm" | "default" }) {
  return (
    <button
      type="button"
      data-slot="select-trigger"
      className={cn(
        "flex w-fit items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 h-8",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
    </button>
  )
}

function SelectContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="select-content"
      className={cn(
        "relative z-50 max-h-60 min-w-36 overflow-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function SelectLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="select-label"
      className={cn("px-1.5 py-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  value,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const { onChange } = React.useContext(SelectContext)
  return (
    <div
      data-slot="select-item"
      role="option"
      className={cn(
        "relative flex w-full cursor-pointer items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground",
        className
      )}
      onClick={() => onChange(value)}
      {...props}
    >
      {children}
    </div>
  )
}

function SelectSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="select-scroll-up-button"
      className={cn("flex w-full cursor-default items-center justify-center bg-popover py-1", className)}
      {...props}
    />
  )
}

function SelectScrollDownButton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="select-scroll-down-button"
      className={cn("flex w-full cursor-default items-center justify-center bg-popover py-1", className)}
      {...props}
    />
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
