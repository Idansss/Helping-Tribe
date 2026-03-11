import Link from 'next/link'
import Image from 'next/image'

export function TopNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/apply" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden">
            <Image src="/logo.png" alt="The Helping Tribe" width={48} height={48} className="object-contain" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-foreground">
            The Helping Tribe
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/student/login"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Student Login
          </Link>
          <Link
            href="/staff/login"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Staff Login
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  )
}

