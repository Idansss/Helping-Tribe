import Image from 'next/image'
import Link from 'next/link'
import { Mail, Phone } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/brand/site-config'

export function LandingFooter() {
  return (
    <footer className="bg-[#081019] text-slate-300">
      <div className="mx-auto max-w-7xl px-[var(--page-gutter)] pb-8 pt-14 sm:pt-20">
        <div className="grid gap-10 border-b border-white/10 pb-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.7fr_0.7fr_1fr]">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-3 rounded-lg text-white">
              <span className="relative size-11 overflow-hidden rounded-xl bg-white"><Image src="/logo.png" alt="" fill sizes="44px" className="object-contain p-0.5" /></span>
              <span><strong className="block font-display text-xl">Helping Tribe</strong><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Academy</span></span>
            </Link>
            <p className="mt-5 text-sm leading-7 text-slate-400">A calm, structured learning community for ethical counselling and positive psychology practice.</p>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-white">Explore</h2>
            <ul className="mt-4 space-y-3 text-sm">{SITE_CONFIG.publicNavigation.map((item) => <li key={item.href}><Link href={item.href} className="hover:text-white">{item.label}</Link></li>)}</ul>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-white">Access</h2>
            <ul className="mt-4 space-y-3 text-sm"><li><Link href="/apply" className="hover:text-white">Apply</Link></li><li><Link href="/student/login" className="hover:text-white">Learner login</Link></li><li><Link href="/mentor-login" className="hover:text-white">Facilitator login</Link></li><li><Link href="/staff/login" className="hover:text-white">Administrator login</Link></li></ul>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-white">Contact</h2>
            <ul className="mt-4 space-y-4 text-sm">
              <li className="flex min-w-0 items-start gap-3"><Mail className="mt-0.5 size-4 shrink-0 text-[#9de2d8]" aria-hidden="true" /><a href={`mailto:${SITE_CONFIG.contact.email.value}`} className="min-w-0 break-words hover:text-white">{SITE_CONFIG.contact.email.value}</a></li>
              <li className="flex items-start gap-3"><Phone className="mt-0.5 size-4 shrink-0 text-[#9de2d8]" aria-hidden="true" /><a href="tel:+2347030052021" className="hover:text-white">{SITE_CONFIG.contact.phone.value}</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-4 pt-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE_CONFIG.organisation.name}. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2"><Link href="/privacy" className="hover:text-white">Privacy</Link><Link href="/terms" className="hover:text-white">Terms</Link><Link href="/contact" className="hover:text-white">Support</Link></div>
        </div>
      </div>
    </footer>
  )
}
