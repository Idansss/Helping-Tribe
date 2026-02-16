import Link from 'next/link'
import { BlurBlobs } from '@/components/blur-blobs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ForgotPasswordPage() {
  return (
    <div className="relative min-h-screen">
      <BlurBlobs />
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4 py-12">
        <Card className="w-full border-slate-200 bg-white/95 shadow-lg backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Password Reset Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Password resets are handled by support for now. Contact the admissions team to receive your
              secure reset or set-password link.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-teal-600 text-white hover:bg-teal-700">
                <Link href="/contact">Contact support</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/student/login">Back to Student login</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

