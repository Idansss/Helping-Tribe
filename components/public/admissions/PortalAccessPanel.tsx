'use client'

import Link from 'next/link'
import { ArrowRight, Mail, ShieldCheck, UserRoundCheck } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const PORTALS = [
  {
    href: '/student/login',
    title: 'Learner',
    method: 'Matric number and password',
    purpose: 'Access your learner workspace after approval.',
    icon: UserRoundCheck,
    emphasis: true,
  },
  {
    href: '/mentor-login',
    title: 'Facilitator',
    method: 'Email and password',
    purpose: 'Support course delivery and learner progress.',
    icon: Mail,
    emphasis: false,
  },
  {
    href: '/staff/login',
    title: 'Administrator',
    method: 'Authorised staff access',
    purpose: 'Manage admissions, content and platform settings.',
    icon: ShieldCheck,
    emphasis: false,
  },
] as const

export function PortalAccessPanel({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        'rounded-[1.6rem] border border-border/80 bg-card/95 p-5 shadow-[var(--shadow-elevated)] backdrop-blur-xl sm:p-6',
        className,
      )}
      aria-labelledby="portal-access-heading"
    >
      <div className="border-b border-border/70 pb-4">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-primary">Portal access</p>
        <h2 id="portal-access-heading" className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground">
          Choose your portal
        </h2>
        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
          Use the sign-in route that matches your role.
        </p>
      </div>

      <ul className="mt-4 space-y-2.5">
        {PORTALS.map(({ href, title, method, purpose, icon: Icon, emphasis }) => (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                'group flex min-h-[4.5rem] items-center gap-3.5 rounded-2xl border px-3.5 py-3.5 transition-[background-color,border-color,transform,box-shadow] duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                emphasis
                  ? 'border-primary/25 bg-primary/[0.04] hover:-translate-y-0.5 hover:border-primary/45 hover:bg-primary/[0.07] hover:shadow-[0_12px_28px_rgb(13_94_87/0.12)]'
                  : 'border-border bg-background/60 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-accent/60 hover:shadow-[0_10px_24px_rgb(11_19_32/0.08)]',
              )}
            >
              <span
                className={cn(
                  'grid size-11 shrink-0 place-items-center rounded-xl border',
                  emphasis
                    ? 'border-primary/20 bg-primary/10 text-primary'
                    : 'border-border bg-muted text-muted-foreground group-hover:text-primary',
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-foreground">{title}</span>
                <span className="mt-0.5 block text-xs font-semibold text-primary/90">{method}</span>
                <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{purpose}</span>
              </span>
              <ArrowRight
                className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
