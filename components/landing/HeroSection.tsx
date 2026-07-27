import Link from 'next/link'
import { ArrowRight, BookOpenCheck, Clock3, Users2 } from 'lucide-react'
import { GrowthOrbitVisual } from '@/components/landing/GrowthOrbitVisual'
import { Button } from '@/components/ui/button'
import { SITE_CONFIG } from '@/lib/brand/site-config'

const facts = [
  { icon: Clock3, label: `${SITE_CONFIG.programme.durationWeeks.value} guided weeks` },
  { icon: BookOpenCheck, label: 'Practice-led modules' },
  { icon: Users2, label: 'Peer learning and reflection' },
] as const

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0b1320] pt-[calc(var(--nav-height)+1rem)] text-white md:pt-[calc(var(--nav-height)+1.5rem)]">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgb(15_118_110/0.28),transparent_34%),radial-gradient(circle_at_90%_28%,rgb(91_42_134/0.24),transparent_32%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-[var(--page-gutter)] pb-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-start lg:gap-12 lg:pb-24">
        <div className="order-1 max-w-3xl py-2 lg:order-none lg:py-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9de2d8]">Counselling · positive psychology · supported practice</p>
          <h1 className="mt-4 font-display text-[clamp(3.1rem,7vw,6.5rem)] font-medium leading-[0.95] tracking-[-0.045em] text-balance">
            Learn to help with skill
            <span className="font-sans font-medium tracking-normal">,</span> care and
            confidence.
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            {SITE_CONFIG.organisation.schoolName} is a guided learning community for people building ethical, practical helping skills in Nigerian and African contexts.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild className="min-h-12 rounded-full bg-[#68c4b8] px-6 text-[#0b1320] hover:bg-[#8bd8ce]">
              <Link href="/apply">Start your application <ArrowRight className="ml-2 size-4" aria-hidden="true" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="min-h-12 rounded-full border-white/25 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white">
              <Link href="#curriculum">Explore the programme</Link>
            </Button>
          </div>
          <Link href="/student/login" className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-slate-300 underline-offset-4 hover:text-white hover:underline">
            Already learning with us? Open your portal.
          </Link>
          <ul className="mt-10 hidden gap-3 border-t border-white/12 pt-6 sm:grid sm:grid-cols-3 lg:grid">
            {facts.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm text-slate-300">
                <Icon className="size-4 shrink-0 text-[#d8bd7a]" aria-hidden="true" />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="order-2 lg:order-none">
          <GrowthOrbitVisual />
        </div>
        <ul className="order-3 mt-2 grid gap-3 border-t border-white/12 pt-6 sm:hidden">
          {facts.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2 text-sm text-slate-300">
              <Icon className="size-4 shrink-0 text-[#d8bd7a]" aria-hidden="true" />
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
