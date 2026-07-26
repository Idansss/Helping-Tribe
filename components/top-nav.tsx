import Image from 'next/image'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

export function TopNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[var(--nav-height)] max-w-6xl items-center justify-between gap-3 px-[var(--page-gutter)]">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 rounded-lg transition-opacity hover:opacity-80">
          <span className="relative size-10 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-border">
            <Image src="/logo.png" alt="" fill sizes="40px" className="object-contain p-0.5" />
          </span>
          <span className="truncate font-display text-lg font-semibold tracking-tight text-foreground">Helping Tribe</span>
        </Link>
        <nav aria-label="Application navigation" className="flex items-center gap-1 sm:gap-2">
          <Link href="/student/login" className="hidden min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:inline-flex">Learner login</Link>
          <Link href="/" className="hidden min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:inline-flex">Programme</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
