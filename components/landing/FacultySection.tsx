import Image from 'next/image'
import { MessageSquareText, ShieldCheck, UsersRound } from 'lucide-react'
import { FACULTY } from '@/lib/faculty'

const supportPoints = [
  { icon: ShieldCheck, title: 'Ethical guidance', text: 'Clear expectations around safety, scope and referral.' },
  { icon: MessageSquareText, title: 'Useful feedback', text: 'Feedback connects learning activity to practical improvement.' },
  { icon: UsersRound, title: 'Human support', text: 'Peer circles and facilitated spaces reduce isolated learning.' },
] as const

export function FacultySection() {
  const hasFaculty = FACULTY.length > 0

  return (
    <section id="faculty" className="bg-background">
      <div className="section-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div data-reveal="heading">
          <p className="eyebrow">Facilitation and support</p>
          <h2 className="display-lg mt-4 text-foreground">
            Learning supported by people, not just content.
          </h2>
          <p className="prose-measure mt-5 text-base text-muted-foreground">
            The programme experience itself is designed around guided practice, feedback and peer connection.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 lg:pt-12" data-reveal>
          {supportPoints.map(({ icon: Icon, title, text }) => (
            <article key={title} className="landing-interactive rounded-2xl border border-border bg-card p-5 shadow-sm" data-reveal>
              <Icon className="size-5 text-primary" aria-hidden="true" />
              <h3 className="mt-8 text-base font-bold text-card-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </div>

      {/*
        The profile grid appears only once lib/faculty.ts is populated. An empty
        state that announced missing people would be worse than no section.
      */}
      {hasFaculty ? (
        <div className="mx-auto w-[min(100%,80rem)] px-[var(--page-gutter)] pb-[var(--section-space)]">
          <ul className="grid gap-x-6 gap-y-10 border-t border-border pt-12 sm:grid-cols-2 lg:grid-cols-3">
            {FACULTY.map((person) => (
              <li key={person.name} className="faculty-card" data-reveal>
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
                  <Image
                    src={person.photo}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 90vw"
                    className="faculty-portrait object-cover"
                  />
                </div>
                <h3 className="mt-5 font-display text-xl font-medium text-foreground">{person.name}</h3>
                <p className="mt-1 text-sm font-semibold text-primary">{person.credentials}</p>
                <p className="mt-1 text-sm text-muted-foreground">{person.role}</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{person.bio}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
