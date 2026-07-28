import { BookOpenText, MessagesSquare, NotebookPen, Route } from 'lucide-react'

const experiences = [
  { icon: Route, number: '01', title: 'Structured modules', description: 'A connected weekly pathway makes the next learning action clear.' },
  { icon: NotebookPen, number: '02', title: 'Reflective journals', description: 'Private reflection connects new ideas to lived and professional experience.' },
  { icon: MessagesSquare, number: '03', title: 'Peer learning', description: 'Circles and discussions create space for questions, feedback and shared growth.' },
  { icon: BookOpenText, number: '04', title: 'Practice resources', description: 'Case studies, tools and saved resources stay available inside the learning workspace.' },
] as const

export function TribeExperienceSection() {
  return (
    <section id="experience" className="bg-[#0b1320] text-white">
      <div className="section-shell">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div data-reveal="heading">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9de2d8]">The learner experience</p>
            <h2 className="mt-4 max-w-3xl font-display text-[clamp(2.7rem,6vw,5.2rem)] font-medium leading-[0.96] tracking-[-0.04em]">
              Built for the work between knowing and doing.
            </h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-slate-300 lg:justify-self-end" data-reveal>
            The platform brings modules, practice, reflection, feedback and community into one calm learning rhythm.
          </p>
        </div>
        <div className="mt-14 grid border-y border-white/12 sm:grid-cols-2 lg:grid-cols-4">
          {experiences.map(({ icon: Icon, number, title, description }, index) => (
            <article key={title} data-reveal className={`group min-w-0 py-8 transition-colors duration-300 hover:bg-white/[0.035] sm:p-7 ${index > 0 ? 'border-t border-white/12 sm:border-l sm:border-t-0' : ''} ${index === 2 ? 'sm:border-l-0 lg:border-l' : ''}`}>
              <div className="flex items-center justify-between text-[#9de2d8]"><Icon className="size-5" aria-hidden="true" /><span className="text-xs font-bold tracking-[0.16em]">{number}</span></div>
              <h3 className="mt-10 text-lg font-bold transition-transform duration-300 ease-out group-hover:translate-x-1">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
