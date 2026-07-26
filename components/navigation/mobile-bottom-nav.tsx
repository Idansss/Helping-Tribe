'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { PORTAL_ICONS } from '@/components/navigation/portal-icons'
import {
  flattenNavGroups,
  isPortalNavItemActive,
  LEARNER_NAV_GROUPS,
  LEARNER_PRIMARY_MOBILE_HREFS,
} from '@/lib/navigation/portal'
import { cn } from '@/lib/utils/cn'

const allLearnerItems = flattenNavGroups(LEARNER_NAV_GROUPS)
const primaryItems = LEARNER_PRIMARY_MOBILE_HREFS.map((href) => {
  const item = allLearnerItems.find((candidate) => candidate.href === href)
  if (!item) throw new Error(`Missing learner navigation item: ${href}`)
  return item
})

export function MobileBottomNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    setOpen(false)
    setQuery('')
  }, [pathname])

  const filteredGroups = useMemo(() => {
    const normalised = query.trim().toLowerCase()
    if (!normalised) return LEARNER_NAV_GROUPS
    return LEARNER_NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => `${item.label} ${item.description}`.toLowerCase().includes(normalised)),
    })).filter((group) => group.items.length > 0)
  }, [query])

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgb(11_19_32/0.08)] backdrop-blur-xl md:hidden">
      <nav aria-label="Primary learner navigation" className="grid h-16 grid-cols-5 px-1">
        {primaryItems.map((item) => {
          const Icon = PORTAL_ICONS[item.icon]
          const active = isPortalNavItemActive(pathname, item.href)
          return (
            <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={cn('flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[10px] font-semibold text-muted-foreground', active && 'text-primary')}>
              <Icon className="size-5" aria-hidden="true" /><span className="max-w-full truncate">{item.label === 'Learning Journal' ? 'Journal' : item.label}</span>
            </Link>
          )
        })}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button type="button" className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[10px] font-semibold text-muted-foreground" aria-label="Open all learner destinations">
              <Menu className="size-5" aria-hidden="true" /><span>More</span>
            </button>
          </DialogTrigger>
          <DialogContent className="bottom-0 left-0 top-auto h-[min(82dvh,46rem)] w-full max-w-none translate-x-0 translate-y-0 gap-0 rounded-b-none rounded-t-3xl border-x-0 border-b-0 p-0">
            <DialogHeader className="px-5 pb-4 pt-6 text-left">
              <DialogTitle className="font-display text-2xl">Find a destination</DialogTitle>
              <DialogDescription>Search the complete learner workspace.</DialogDescription>
            </DialogHeader>
            <div className="px-5 pb-4">
              <label className="relative block">
                <span className="sr-only">Search learner destinations</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search course, journal, resources…" className="h-12 rounded-xl pl-10" autoFocus />
              </label>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
              {filteredGroups.length === 0 ? <p className="px-3 py-8 text-center text-sm text-muted-foreground">No destination matches “{query}”.</p> : filteredGroups.map((group) => (
                <section key={group.label} aria-labelledby={`mobile-nav-${group.label}`} className="py-3">
                  <h3 id={`mobile-nav-${group.label}`} className="px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{group.label}</h3>
                  <div className="mt-2 grid gap-1 sm:grid-cols-2">
                    {group.items.map((item) => {
                      const Icon = PORTAL_ICONS[item.icon]
                      const active = isPortalNavItemActive(pathname, item.href)
                      return <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={cn('flex min-h-14 items-center gap-3 rounded-xl px-3 py-2 hover:bg-accent', active && 'bg-accent text-primary')}><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted"><Icon className="size-4" aria-hidden="true" /></span><span className="min-w-0"><strong className="block text-sm">{item.label}</strong><span className="block truncate text-xs text-muted-foreground">{item.description}</span></span></Link>
                    })}
                  </div>
                </section>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </nav>
    </div>
  )
}
