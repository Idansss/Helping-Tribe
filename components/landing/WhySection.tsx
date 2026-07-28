import { ArrowUpRight, Globe2, HeartHandshake, ShieldCheck } from 'lucide-react'

export function WhySection() {
  return (
    <section id="about" className="bg-background">
      <div className="section-shell grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
        <div data-reveal="heading">
          <p className="eyebrow">A school built around human practice</p>
          <h2 className="mt-4 max-w-xl font-display text-[clamp(2.65rem,6vw,5.4rem)] font-medium leading-[0.96] tracking-[-0.035em] text-foreground">
            Knowledge matters. How you hold it matters more.
          </h2>
        </div>
        <div className="space-y-8 lg:pt-16" data-reveal>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            Helping work asks for more than theory. It asks for ethics, reflection, cultural awareness and the steady confidence to know when to listen, act, supervise or refer.
          </p>
          <div className="grid gap-6 border-t border-border pt-8 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, title: 'Ethical grounding', text: 'Safeguarding and professional responsibility are part of the learning journey.' },
              { icon: Globe2, title: 'Context matters', text: 'Examples and practice are shaped for Nigerian and African communities.' },
              { icon: HeartHandshake, title: 'Supported growth', text: 'Reflection, peer learning and feedback connect knowledge to practice.' },
            ].map(({ icon: Icon, title, text }) => (
              <article key={title} className="group landing-interactive rounded-2xl p-3 -m-3" data-reveal>
                <div className="flex items-center justify-between">
                  <Icon className="size-5 text-primary" aria-hidden="true" />
                  <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-base font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
