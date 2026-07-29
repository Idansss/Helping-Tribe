import type React from 'react'
import { BookOpenText, MessagesSquare, NotebookPen, Route } from 'lucide-react'

/*
  These four are parallel features, not a sequence — the old 01–04 numbering
  implied an order that does not exist, so it is gone. `span` drives the bento
  asymmetry instead.
*/
const experiences = [
  {
    icon: Route,
    title: 'Structured modules',
    description: 'A connected weekly pathway makes the next learning action clear.',
    span: 'lg:col-span-2',
    featured: true,
  },
  {
    icon: NotebookPen,
    title: 'Reflective journals',
    description: 'Private reflection connects new ideas to lived and professional experience.',
    span: '',
    featured: false,
  },
  {
    icon: MessagesSquare,
    title: 'Peer learning',
    description: 'Circles and discussions create space for questions, feedback and shared growth.',
    span: '',
    featured: false,
  },
  {
    icon: BookOpenText,
    title: 'Practice resources',
    description: 'Case studies, tools and saved resources stay available inside the learning workspace.',
    span: 'lg:col-span-2',
    featured: false,
  },
] as const

/** Nine steps lighting in sequence — the weekly pathway the tile describes. */
function PathwayLoop() {
  return (
    <div className="pathway-loop mt-8" aria-hidden="true">
      {Array.from({ length: 9 }, (_, index) => (
        <span key={index} style={{ '--step': index } as React.CSSProperties} />
      ))}
    </div>
  )
}

export function TribeExperienceSection() {
  return (
    <section id="experience" className="bg-[#0b1320] text-white">
      <div className="section-shell">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div data-reveal="heading">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9de2d8]">The learner experience</p>
            <h2 className="display-lg mt-4 max-w-3xl">
              Built for the work between knowing and doing.
            </h2>
          </div>
          <p className="max-w-xl text-base leading-[1.65] text-slate-300 lg:justify-self-end" data-reveal>
            The platform brings modules, practice, reflection, feedback and community into one calm learning rhythm.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {experiences.map(({ icon: Icon, title, description, span, featured }) => (
            <article
              key={title}
              data-reveal
              className={`landing-interactive group flex min-w-0 flex-col rounded-2xl border border-white/12 bg-white/[0.03] p-6 sm:p-7 ${span}`}
            >
              <Icon className="size-5 text-[#9de2d8]" aria-hidden="true" />
              <h3 className="mt-8 text-lg font-bold">{title}</h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">{description}</p>
              {featured ? <PathwayLoop /> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
