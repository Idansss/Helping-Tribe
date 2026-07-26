'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { SITE_CONFIG } from '@/lib/brand/site-config'

const faqs = [
  {
    question: 'Who is the programme for?',
    answer: 'It is designed for people who want structured foundational helping skills, including community workers, educators, caregivers, health workers, ministry leaders and aspiring counsellors.',
  },
  {
    question: 'How long is the learning journey?',
    answer: `The current programme structure spans ${SITE_CONFIG.programme.durationWeeks.value} guided weeks, with modules, practice activities, reflection and peer learning.`,
  },
  {
    question: 'How does the application work?',
    answer: 'You submit the secure application, receive an admissions decision, complete payment if approved, and then receive the setup path for learner access.',
  },
  {
    question: 'Can I save an application and return later?',
    answer: 'Yes. The application flow supports secure saving and resuming. Use the same email address and the protected resume link sent through the application process.',
  },
  {
    question: 'How do learners sign in?',
    answer: 'Learners use their matric number and password. Facilitators and administrators have separate email-based sign-in routes.',
  },
  {
    question: 'What do I need to study online?',
    answer: 'A modern browser on a phone or computer and a dependable internet connection are sufficient for the core experience. Large resources are presented with download and low-data considerations where available.',
  },
] as const

export function FAQSection() {
  return (
    <section id="faq" className="bg-background">
      <div className="section-shell grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
        <div>
          <p className="eyebrow">Frequently asked</p>
          <h2 className="mt-4 font-display text-[clamp(2.55rem,5vw,4.6rem)] font-medium leading-none tracking-[-0.035em] text-foreground">Clear answers before you apply.</h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">For a question about your own application or account, contact the support team without sharing passwords or payment details.</p>
        </div>
        <Accordion type="single" collapsible className="border-t border-border">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.question} value={`faq-${index}`} className="border-b border-border py-1">
              <AccordionTrigger className="gap-4 py-5 text-left text-base font-bold text-foreground hover:no-underline sm:py-6 sm:text-lg">{faq.question}</AccordionTrigger>
              <AccordionContent className="pb-6 pr-8 text-sm leading-7 text-muted-foreground sm:text-base">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
