import Link from 'next/link'
import { Check, Info } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const POINTS = [
  {
    text: (
      <>
        Students do not sign up publicly and do not use email to log in.
      </>
    ),
  },
  {
    text: (
      <>
        Your email on this form is for <span className="font-semibold text-foreground">approval updates</span> only.
      </>
    ),
  },
  {
    text: (
      <>
        Approved learners sign in with a <span className="font-semibold text-foreground">matric number</span> and
        password via Student Login.
      </>
    ),
  },
] as const

export function AdmissionGuidance({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        'rounded-[1.35rem] border border-amber-500/25 bg-[linear-gradient(160deg,rgb(255_248_235)_0%,rgb(255_252_245)_100%)] p-5 shadow-[0_14px_36px_rgb(180_130_40/0.1)] dark:border-amber-400/20 dark:bg-[linear-gradient(160deg,rgb(42_32_18)_0%,rgb(28_24_16)_100%)]',
        className,
      )}
      aria-labelledby="admission-guidance-heading"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
          <Info className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-amber-800/80 dark:text-amber-200/80">
            Before you continue
          </p>
          <h2 id="admission-guidance-heading" className="mt-1 text-lg font-bold tracking-tight text-foreground">
            Important login guidance
          </h2>
        </div>
      </div>

      <ul className="mt-4 space-y-3">
        {POINTS.map((point, index) => (
          <li key={index} className="flex items-start gap-2.5 text-sm leading-6 text-muted-foreground">
            <Check className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <span>{point.text}</span>
          </li>
        ))}
      </ul>

      <p className="mt-5 border-t border-amber-500/20 pt-4 text-sm text-muted-foreground">
        Already approved?{' '}
        <Link href="/student/login" className="font-semibold text-primary underline-offset-4 hover:underline">
          Use Student Login
        </Link>
      </p>
    </aside>
  )
}
