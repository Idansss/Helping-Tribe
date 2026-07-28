'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/brand/site-config'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function LandingNav() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
    const handleScroll = () => setIsScrolled(window.scrollY > 16)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className="pointer-events-none fixed inset-x-0 top-3 z-50 px-[var(--page-gutter)]"
    >
      <nav
        aria-label="Public navigation"
        data-hydrated={isHydrated}
        className={`pointer-events-auto mx-auto flex h-[var(--nav-height)] max-w-7xl items-center justify-between gap-3 rounded-[1.4rem] border px-3 transition-[background-color,border-color,box-shadow,transform] duration-300 sm:px-4 ${
          isScrolled
            ? 'translate-y-0 border-border/80 bg-background/94 shadow-[0_16px_50px_rgb(11_19_32/0.13)] backdrop-blur-xl'
            : 'border-white/20 bg-background/88 shadow-[0_8px_30px_rgb(11_19_32/0.08)] backdrop-blur-lg'
        }`}
      >
        <Link href="/" className="flex min-w-0 items-center gap-2.5 rounded-lg">
          <span className="relative size-10 shrink-0 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-border">
            <Image src="/logo.png" alt="" fill sizes="40px" className="object-contain p-0.5" priority />
          </span>
          <span className="min-w-0 leading-none">
            <span className="block truncate font-display text-[1.08rem] font-semibold text-foreground sm:text-xl">Helping Tribe</span>
            <span className="mt-1 block truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Academy</span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          {SITE_CONFIG.publicNavigation.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-[background-color,color,transform] duration-200 hover:-translate-y-px hover:bg-accent hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/student/login" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent sm:inline-flex">
            Learner login
          </Link>
          <Button asChild className="hidden min-h-11 rounded-full px-5 sm:inline-flex">
            <Link href="/apply">Apply</Link>
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <button type="button" className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-background text-foreground lg:hidden" aria-label="Open navigation menu">
                <Menu className="size-5" aria-hidden="true" />
              </button>
            </DialogTrigger>
            <DialogContent className="left-auto right-0 top-0 h-dvh w-[min(92vw,25rem)] max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-none border-y-0 border-r-0 bg-background p-0 sm:rounded-none">
              <DialogHeader className="border-b border-border px-6 pb-5 pt-7 text-left">
                <DialogTitle className="font-display text-2xl">Explore Helping Tribe</DialogTitle>
                <DialogDescription>Programme information and secure access to your learning portal.</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-2 px-4 py-5">
                {SITE_CONFIG.publicNavigation.map((item) => (
                  <DialogClose asChild key={item.href}>
                    <Link href={item.href} className="flex min-h-12 items-center rounded-xl px-4 text-base font-semibold text-foreground hover:bg-accent">
                      {item.label}
                    </Link>
                  </DialogClose>
                ))}
              </div>
              <div className="mt-auto space-y-3 border-t border-border p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                <DialogClose asChild>
                  <Button asChild className="h-12 w-full rounded-xl"><Link href="/apply">Start an application</Link></Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button asChild variant="outline" className="h-12 w-full rounded-xl"><Link href="/student/login">Learner login</Link></Button>
                </DialogClose>
                <div className="grid grid-cols-2 gap-2 pt-2 text-center text-xs">
                  <DialogClose asChild><Link href="/mentor-login" className="rounded-lg px-2 py-3 text-muted-foreground hover:bg-accent">Facilitator</Link></DialogClose>
                  <DialogClose asChild><Link href="/staff/login" className="rounded-lg px-2 py-3 text-muted-foreground hover:bg-accent">Administrator</Link></DialogClose>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </nav>
    </header>
  )
}
