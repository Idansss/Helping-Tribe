'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ChevronDown, LogOut, Menu, PanelLeft, Search, Settings, UserRound, X } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { NotificationBell } from '@/components/lms/NotificationBell'
import { createClient } from '@/lib/supabase/client'
import {
  PORTAL_PROFILE_UPDATED_EVENT,
  readPortalProfileCache,
  writePortalProfileCache,
} from '@/lib/portal-profile-cache'
import { getPortalPageMeta, PORTAL_CONFIG, type PortalRole } from './portal-config'

type PortalHeaderProps = {
  role: PortalRole
  collapsed: boolean
  onToggleCollapsed: () => void
  onOpenMobileNavigation: () => void
}

type ProfileState = { name: string; avatar: string | null }

export function PortalHeader({ role, collapsed, onToggleCollapsed, onOpenMobileNavigation }: PortalHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const config = PORTAL_CONFIG[role]
  const meta = getPortalPageMeta(role, pathname)
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [profile, setProfile] = useState<ProfileState>({ name: config.fallbackName, avatar: null })
  const desktopSearchRef = useRef<HTMLDivElement>(null)

  const targets = useMemo(() => config.navigation.flatMap((group) => group.items), [config.navigation])
  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return targets.slice(0, 7)
    return targets.filter((target) => `${target.label} ${target.description}`.toLowerCase().includes(normalized)).slice(0, 7)
  }, [query, targets])

  useEffect(() => {
    let active = true
    const supabase = createClient()

    async function loadProfile() {
      const stored = readPortalProfileCache(config.storageKey)

      if (active && (stored.name || stored.avatar)) {
        setProfile({
          name: stored.name || config.fallbackName,
          avatar: stored.avatar || null,
        })
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .maybeSingle()
      if (!active) return

      const next = {
        name:
          data?.full_name?.trim() ||
          stored.name ||
          user.user_metadata?.full_name ||
          config.fallbackName,
        avatar: data?.avatar_url?.trim() || stored.avatar || null,
      }
      setProfile(next)
      // Keep header cache aligned with the database (silent to avoid reload loops).
      if (next.name || next.avatar) {
        writePortalProfileCache(
          config.storageKey,
          { name: next.name, avatar: next.avatar },
          { silent: true }
        )
      }
    }

    function onProfileUpdated(event: Event) {
      const detail = (event as CustomEvent<{ storageKey?: string }>).detail
      if (detail?.storageKey && detail.storageKey !== config.storageKey) return
      void loadProfile()
    }

    void loadProfile()
    window.addEventListener(PORTAL_PROFILE_UPDATED_EVENT, onProfileUpdated)
    return () => {
      active = false
      window.removeEventListener(PORTAL_PROFILE_UPDATED_EVENT, onProfileUpdated)
    }
  }, [config.fallbackName, config.storageKey])

  useEffect(() => {
    setSearchOpen(false)
    setQuery('')
  }, [pathname])

  useEffect(() => {
    if (!searchOpen) return

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null
      if (!target) return
      if (desktopSearchRef.current?.contains(target)) return
      setSearchOpen(false)
    }

    function handleFocusIn(event: FocusEvent) {
      const target = event.target as Node | null
      if (!target) return
      if (desktopSearchRef.current?.contains(target)) return
      setSearchOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    document.addEventListener('focusin', handleFocusIn)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('focusin', handleFocusIn)
    }
  }, [searchOpen])

  function goTo(href: string) {
    setSearchOpen(false)
    setQuery('')
    router.push(href)
  }

  const searchResults = (
    <div className="overflow-hidden rounded-xl border border-border bg-popover shadow-xl">
      {matches.length > 0 ? matches.map((target) => {
        const Icon = target.icon
        return (
          <button key={target.href} type="button" onClick={() => goTo(target.href)} className="flex min-h-12 w-full items-center gap-3 border-b border-border px-3 py-2 text-left transition-colors last:border-b-0 hover:bg-accent focus:bg-accent">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-primary"><Icon className="size-4" aria-hidden="true" /></span>
            <span className="min-w-0"><strong className="block truncate text-sm text-popover-foreground">{target.label}</strong><span className="block truncate text-xs text-muted-foreground">{target.description}</span></span>
          </button>
        )
      }) : <p className="px-4 py-8 text-center text-sm text-muted-foreground">No matching portal pages.</p>}
    </div>
  )

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-header/95 text-header-foreground shadow-[0_1px_0_hsl(var(--border)/0.45)] backdrop-blur-xl">
      <div className="flex h-[4.5rem] items-center gap-2 px-3 sm:gap-3 sm:px-5 lg:px-6">
        <button type="button" onClick={onOpenMobileNavigation} className="grid size-11 shrink-0 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground lg:hidden" aria-label="Open navigation" aria-haspopup="dialog">
          <Menu className="size-5" aria-hidden="true" />
        </button>
        <button type="button" onClick={onToggleCollapsed} className="hidden size-11 shrink-0 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground lg:grid" aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'} aria-expanded={!collapsed}>
          <PanelLeft className="size-5" aria-hidden="true" />
        </button>

        <div className="min-w-0 flex-1 sm:flex-none sm:max-w-[21rem]">
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.13em] text-primary">Helping Tribe · {config.workspaceLabel}</p>
          <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">{meta.title}</h1>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">{meta.description}</p>
        </div>

        <div className="mx-auto hidden w-full max-w-md xl:block">
          <div ref={desktopSearchRef} className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && matches[0]) goTo(matches[0].href)
                if (event.key === 'Escape') {
                  setSearchOpen(false)
                  event.currentTarget.blur()
                }
              }}
              placeholder={config.searchPlaceholder}
              className="h-11 w-full rounded-full border border-input bg-muted/55 pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/25"
              aria-label="Search portal"
              aria-expanded={searchOpen}
              aria-controls="portal-search-results"
            />
            {searchOpen ? (
              <div id="portal-search-results" className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50">
                {searchResults}
              </div>
            ) : null}
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Dialog.Root open={searchOpen && typeof window !== 'undefined' && window.innerWidth < 1280} onOpenChange={setSearchOpen}>
            <Dialog.Trigger asChild>
              <button type="button" className="grid size-11 place-items-center rounded-full border border-border bg-background/70 text-foreground transition-colors hover:bg-accent xl:hidden" aria-label="Search portal">
                <Search className="size-4" aria-hidden="true" />
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
              <Dialog.Content className="fixed left-1/2 top-[max(1rem,env(safe-area-inset-top))] z-[60] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2">
                <Dialog.Title className="text-sm font-semibold">Search {config.workspaceLabel}</Dialog.Title>
                <Dialog.Description className="mt-1 text-xs text-muted-foreground">Move quickly to another area of your portal.</Dialog.Description>
                <div className="relative mt-4">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <input autoFocus type="search" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && matches[0]) goTo(matches[0].href) }} placeholder={config.searchPlaceholder} className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-10 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/25" />
                  <Dialog.Close className="absolute right-1 top-1 grid size-10 place-items-center rounded-lg text-muted-foreground hover:bg-accent" aria-label="Close search"><X className="size-4" aria-hidden="true" /></Dialog.Close>
                </div>
                <div className="mt-3">{searchResults}</div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

          <ThemeToggle />
          <NotificationBell className="relative grid size-11 place-items-center rounded-full border border-border bg-background/70 text-foreground transition-colors hover:bg-accent" iconSize="sm" />

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button type="button" className="flex h-11 max-w-[11rem] items-center gap-2 rounded-full border border-border bg-background/70 p-1 pr-2.5 text-foreground transition-colors hover:bg-accent" aria-label="Open profile menu">
                <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {profile.avatar ? <img src={profile.avatar} alt="" className="h-full w-full object-cover" /> : profile.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden min-w-0 truncate text-xs font-semibold sm:block">{profile.name}</span>
                <ChevronDown className="hidden size-3 shrink-0 text-muted-foreground sm:block" aria-hidden="true" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content align="end" sideOffset={8} className="z-[70] min-w-56 overflow-hidden rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
                <div className="px-3 py-2"><p className="truncate text-sm font-semibold">{profile.name}</p><p className="text-xs text-muted-foreground">{config.workspaceLabel}</p></div>
                <DropdownMenu.Separator className="my-1 h-px bg-border" />
                <DropdownMenu.Item onSelect={() => router.push(config.profileHref)} className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm outline-none hover:bg-accent focus:bg-accent"><UserRound className="size-4" aria-hidden="true" />Profile</DropdownMenu.Item>
                <DropdownMenu.Item onSelect={() => router.push(config.settingsHref)} className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm outline-none hover:bg-accent focus:bg-accent"><Settings className="size-4" aria-hidden="true" />Settings</DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-border" />
                <DropdownMenu.Item onSelect={() => router.push('/logout')} className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm text-destructive outline-none hover:bg-destructive/10 focus:bg-destructive/10"><LogOut className="size-4" aria-hidden="true" />Sign out</DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </header>
  )
}

