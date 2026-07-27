'use client'

import * as React from 'react'
import { Drawer as DrawerPrimitive } from 'vaul'
import { cn } from '@/lib/utils/cn'

const Sheet = DrawerPrimitive.Root
const SheetTrigger = DrawerPrimitive.Trigger
const SheetClose = DrawerPrimitive.Close
const SheetPortal = DrawerPrimitive.Portal

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      className={cn('fixed inset-0 z-50 bg-overlay/80 backdrop-blur-sm', className)}
      {...props}
    />
  )
}

type SheetContentProps = React.ComponentProps<typeof DrawerPrimitive.Content> & {
  side?: 'bottom' | 'right'
}

function SheetContent({
  className,
  children,
  side = 'bottom',
  ...props
}: SheetContentProps) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <DrawerPrimitive.Content
        className={cn(
          'fixed z-50 flex flex-col border border-border bg-popover text-popover-foreground shadow-2xl outline-none',
          side === 'bottom' &&
            'inset-x-0 bottom-0 mt-24 max-h-[min(92dvh,40rem)] rounded-t-2xl pb-[env(safe-area-inset-bottom)]',
          side === 'right' &&
            'inset-y-0 right-0 h-dvh w-[min(24rem,100%)] rounded-none border-l pb-[env(safe-area-inset-bottom)]',
          className
        )}
        {...props}
      >
        {side === 'bottom' ? (
          <div
            className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/30"
            aria-hidden="true"
          />
        ) : null}
        {children}
      </DrawerPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1 px-4 pb-2 pt-3 text-left', className)} {...props} />
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      className={cn('text-base font-semibold text-popover-foreground', className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

function SheetBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('min-h-0 flex-1 overflow-y-auto px-4 pb-4', className)} {...props} />
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
}
