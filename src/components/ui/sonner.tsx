"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-2xl group-[.toaster]:font-medium",
          description: "group-[.toast]:text-slate-500 group-[.toast]:text-sm",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "group-[.toaster]:!border-emerald-200 group-[.toaster]:!bg-emerald-50 group-[.toaster]:!text-emerald-900",
          error:
            "group-[.toaster]:!border-red-200 group-[.toaster]:!bg-red-50 group-[.toaster]:!text-red-900",
          warning:
            "group-[.toaster]:!border-amber-200 group-[.toaster]:!bg-amber-50 group-[.toaster]:!text-amber-900",
          info:
            "group-[.toaster]:!border-blue-200 group-[.toaster]:!bg-blue-50 group-[.toaster]:!text-blue-900",
        },
      }}
      position="top-right"
      richColors
      expand
      {...props}
    />
  )
}

export { Toaster }
