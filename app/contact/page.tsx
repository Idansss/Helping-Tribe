import Link from 'next/link'
import { PROGRAM_FULL_NAME } from '@/lib/brand/program'

export const metadata = {
  title: `Contact Support | ${PROGRAM_FULL_NAME}`,
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Contact Support</h1>
        <p className="mt-3 text-sm text-slate-600">
          For admissions help, payment verification, or password setup support.
        </p>

        <div className="mt-6 space-y-3 text-sm text-slate-700">
          <p>
            Email: <a href="mailto:helpingtribe@blakmoh.com" className="text-teal-700 hover:underline">helpingtribe@blakmoh.com</a>
          </p>
          <p>
            Phone/WhatsApp: <a href="tel:+2347030052021" className="text-teal-700 hover:underline">+234 703 0052 021</a>
          </p>
          <p>Support hours: Monday - Friday, 9:00 AM to 5:00 PM (WAT).</p>
        </div>

        <div className="mt-8 flex items-center gap-4 text-sm">
          <Link href="/apply" className="text-teal-700 hover:underline">
            Back to application
          </Link>
          <Link href="/privacy" className="text-teal-700 hover:underline">
            Privacy policy
          </Link>
        </div>
      </section>
    </main>
  )
}
