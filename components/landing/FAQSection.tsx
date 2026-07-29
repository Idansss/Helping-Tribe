import { Disclosure } from '@/components/landing/Disclosure'
import { JsonLd } from '@/components/json-ld'
import { FAQS } from '@/lib/brand/faq'
import { faqJsonLd } from '@/lib/brand/structured-data'

export function FAQSection() {
  return (
    <section id="faq" className="bg-background">
      <JsonLd data={faqJsonLd()} />
      <div className="section-shell grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
        <div data-reveal="heading">
          <p className="eyebrow">Frequently asked</p>
          <h2 className="display-lg mt-4 text-foreground">Clear answers before you apply.</h2>
          <p className="prose-measure mt-5 text-base text-muted-foreground">For a question about your own application or account, contact the support team without sharing passwords or payment details.</p>
        </div>
        <div className="border-t border-border" data-reveal>
          {FAQS.map((faq) => (
            <Disclosure
              key={faq.question}
              className="border-b border-border py-1"
              summaryClassName="py-5 text-left text-base font-bold text-foreground sm:py-6 sm:text-lg"
              contentClassName="pb-6 pr-8 text-sm leading-7 text-muted-foreground sm:text-base"
              summary={<h3 className="min-w-0 font-bold">{faq.question}</h3>}
            >
              {faq.answer}
            </Disclosure>
          ))}
        </div>
      </div>
    </section>
  )
}
