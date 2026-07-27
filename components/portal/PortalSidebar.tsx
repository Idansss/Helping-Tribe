'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import * as Tooltip from '@radix-ui/react-tooltip'
import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { isPortalItemActive, PORTAL_CONFIG, type PortalRole } from './portal-config'

type PortalSidebarProps = {
  role: PortalRole
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  mobileOpen: boolean
  onMobileOpenChange: (open: boolean) => void
  transitionsReady: boolean
}

function SidebarContents({
  role,
  collapsed,
  mobile,
  onNavigate,
  onToggle,
}: {
  role: PortalRole
  collapsed: boolean
  mobile: boolean
  onNavigate?: () => void
  onToggle?: () => void
}) {
  const pathname = usePathname()
  const config = PORTAL_CONFIG[role]
  const expanded = mobile || !collapsed

  return (
    <Tooltip.Provider delayDuration={120} skipDelayDuration={150}>
      <div className="flex h-full min-h-0 flex-col">
        <div className={cn('flex h-[4.5rem] shrink-0 items-center gap-2 border-b border-white/10 px-3', collapsed && !mobile && 'justify-center px-2')}>
          <Link href={config.homeHref} onClick={onNavigate} className="flex min-w-0 flex-1 items-center gap-2 rounded-xl focus-visible:outline-white" aria-label={`Helping Tribe · ${config.workspaceLabel}`}>
            <span className="relative size-10 shrink-0 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-white/20">
              <Image src="/logo.png" alt="" fill sizes="40px" className="object-contain" priority />
            </span>
            {expanded && (
              <span className="min-w-0 flex-1 leading-tight">
                <strong className="block truncate text-sm font-semibold text-white">Helping Tribe</strong>
                <span className="block truncate text-[11px] text-white/70">{config.workspaceLabel}</span>
              </span>
            )}
          </Link>
          {mobile ? (
            <Dialog.Close asChild>
              <button type="button" className="grid size-11 shrink-0 place-items-center rounded-xl text-white transition-colors hover:bg-white/10" aria-label="Close navigation">
                <X className="size-5" aria-hidden="true" />
              </button>
            </Dialog.Close>
          ) : null}
        </div>

        <nav aria-label={config.ariaLabel} className="portal-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 overscroll-contain">
          {config.navigation.map((group, groupIndex) => (
            <section key={group.label} className={cn('pb-4', groupIndex > 0 && 'border-t border-white/10 pt-4')}>
              {expanded ? <h2 className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">{group.label}</h2> : <span className="sr-only">{group.label}</span>}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const active = isPortalItemActive(pathname, item.href)
                  const link = (
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      aria-label={!expanded ? item.label : undefined}
                      className={cn(
                        'group relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-semibold transition-[background-color,color,box-shadow,transform] duration-[var(--motion-fast)] motion-reduce:transition-none',
                        !expanded && 'justify-center px-2',
                        active
                          ? 'bg-white text-[#0d5e57] shadow-sm'
                          : 'text-white/80 hover:bg-white/10 hover:text-white active:scale-[0.98]'
                      )}
                    >
                      <Icon className="size-[1.125rem] shrink-0" aria-hidden="true" />
                      {expanded ? <span className="truncate">{item.label}</span> : null}
                    </Link>
                  )

                  return (
                    <li key={item.href}>
                      {!expanded ? (
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>{link}</Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Content side="right" sideOffset={10} className="z-[80] rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs font-medium text-popover-foreground shadow-lg data-[state=delayed-open]:animate-in data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0">
                              {item.label}
                              <Tooltip.Arrow className="fill-popover" />
                            </Tooltip.Content>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                      ) : link}
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </nav>

        <div className={cn('shrink-0 border-t border-white/10 p-2', expanded ? 'space-y-2' : 'flex justify-center')}>
          {!mobile ? (
            <button
              type="button"
              onClick={onToggle}
              className={cn('flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-xs font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white', !expanded && 'w-11 justify-center px-0')}
              aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
              aria-expanded={!collapsed}
            >
              {collapsed ? <PanelLeftOpen className="size-[1.125rem]" aria-hidden="true" /> : <PanelLeftClose className="size-[1.125rem]" aria-hidden="true" />}
              {expanded ? <span>Collapse navigation</span> : null}
            </button>
          ) : null}
          {expanded ? <p className="px-3 pb-1 text-[10px] leading-4 text-white/55">{config.footer}</p> : null}
        </div>
      </div>
    </Tooltip.Provider>
  )
}

export function PortalSidebar({ role, collapsed, onCollapsedChange, mobileOpen, onMobileOpenChange, transitionsReady }: PortalSidebarProps) {
  return (
    <>
      <aside
        className={cn(
          'sticky top-0 z-40 hidden h-dvh shrink-0 overflow-hidden border-r border-white/10 bg-[linear-gradient(180deg,hsl(var(--sidebar))_0%,#0b3f3b_58%,#0b252a_100%)] text-sidebar-foreground shadow-xl lg:block',
          transitionsReady && 'transition-[width] duration-[var(--motion-panel)] ease-[var(--ease-standard)] motion-reduce:transition-none',
          collapsed ? 'w-[4.5rem]' : 'w-64'
        )}
      >
        <SidebarContents role={role} collapsed={collapsed} mobile={false} onToggle={() => onCollapsedChange(!collapsed)} />
      </aside>

      <Dialog.Root open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 lg:hidden" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed inset-y-0 left-0 z-[60] w-[min(18rem,88vw)] border-r border-white/10 bg-[linear-gradient(180deg,hsl(var(--sidebar))_0%,#0b3f3b_58%,#0b252a_100%)] text-sidebar-foreground shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left motion-reduce:transition-none lg:hidden"
          >
            <Dialog.Title className="sr-only">Portal navigation</Dialog.Title>
            <SidebarContents role={role} collapsed={false} mobile onNavigate={() => onMobileOpenChange(false)} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

