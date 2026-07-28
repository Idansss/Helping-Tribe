import { MessageSquareText, ShieldCheck, UsersRound } from 'lucide-react'

export function FacultySection() {
  return (
    <section id="faculty" className="bg-background">
      <div className="section-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div data-reveal="heading">
          <p className="eyebrow">Facilitation and support</p>
          <h2 className="mt-4 font-display text-[clamp(2.55rem,5vw,4.6rem)] font-medium leading-none tracking-[-0.035em] text-foreground">
            Learning supported by people, not just content.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
            Faculty identities and professional profiles are being verified for public publication. The programme experience itself is designed around guided practice, feedback and peer connection.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 lg:pt-12" data-reveal>
          {[
            { icon: ShieldCheck, title: 'Ethical guidance', text: 'Clear expectations around safety, scope and referral.' },
            { icon: MessageSquareText, title: 'Useful feedback', text: 'Feedback connects learning activity to practical improvement.' },
            { icon: UsersRound, title: 'Human support', text: 'Peer circles and facilitated spaces reduce isolated learning.' },
          ].map(({ icon: Icon, title, text }) => (
            <article key={title} className="landing-interactive rounded-2xl border border-border bg-card p-5 shadow-sm" data-reveal>
              <Icon className="size-5 text-primary" aria-hidden="true" />
              <h3 className="mt-8 text-base font-bold text-card-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
