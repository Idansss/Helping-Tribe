'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { CURRICULUM_MODULES } from '@/lib/brand/site-config'

export function CurriculumSection() {
  return (
    <section id="curriculum" className="bg-[var(--surface-muted)]">
      <div className="section-shell grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start" data-reveal="heading">
          <p className="eyebrow">The learning journey</p>
          <h2 className="mt-4 font-display text-[clamp(2.55rem,5vw,4.7rem)] font-medium leading-none tracking-[-0.035em] text-foreground">
            Nine weeks. One connected practice.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
            Each week builds on the last, moving from ethical foundations to supported application and reflection.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full border-t border-border" data-reveal>
          {CURRICULUM_MODULES.map((module) => (
            <AccordionItem key={module.week} value={`module-${module.week}`} className="border-b border-border py-1">
              <AccordionTrigger className="min-w-0 gap-3 py-5 text-left hover:no-underline sm:py-6">
                <span className="flex min-w-0 flex-1 flex-col gap-2 pr-1 sm:flex-row sm:items-baseline sm:gap-5">
                  <span className="w-fit shrink-0 rounded-full border border-primary/25 bg-background/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
                    Week {module.week}
                  </span>
                  <span className="min-w-0 break-words text-base font-bold leading-snug text-foreground sm:text-lg">
                    {module.title}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-6 pl-0 pr-8 text-sm leading-7 text-muted-foreground sm:pl-[6.75rem] sm:text-base">
                {module.description}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
