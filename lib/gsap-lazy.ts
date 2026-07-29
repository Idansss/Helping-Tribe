'use client'

import type { gsap as GsapNamespace } from 'gsap'
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger'
import type { SplitText as SplitTextType } from 'gsap/SplitText'

type GsapBundle = {
  gsap: typeof GsapNamespace
  ScrollTrigger: typeof ScrollTriggerType
  SplitText: typeof SplitTextType
}

let pending: Promise<GsapBundle> | null = null

/**
 * Loads GSAP and its plugins on demand, registering them exactly once.
 *
 * GSAP is deliberately kept out of the initial bundle. The primary audience is
 * on mid-range Android over Nigerian 4G, and the pinned curriculum timeline —
 * the only place GSAP earns its weight — is desktop-only. Callers await this
 * from inside an effect, after checking viewport and motion preference, so
 * phones never download it at all.
 *
 * Because the import is dynamic we cannot use `useGSAP()` from @gsap/react
 * (it needs a statically imported gsap). Callers create a `gsap.context()`
 * scoped to their root element and revert it on cleanup, which is what that
 * hook does internally.
 */
export function loadGsap(): Promise<GsapBundle> {
  if (!pending) {
    pending = Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
      import('gsap/SplitText'),
    ]).then(([gsapModule, scrollTriggerModule, splitTextModule]) => {
      const { gsap } = gsapModule
      const { ScrollTrigger } = scrollTriggerModule
      const { SplitText } = splitTextModule

      gsap.registerPlugin(ScrollTrigger, SplitText)

      return { gsap, ScrollTrigger, SplitText }
    })
  }

  return pending
}
