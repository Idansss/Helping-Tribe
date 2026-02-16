'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { UserCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const MENTOR_PROFILE_STORAGE_KEY = 'ht-mentor-profile'

type MentorProfile = {
  name: string
  email: string
  role: string
  timezone: string
  bio: string
  avatar?: string
}

const DEFAULT_PROFILE: MentorProfile = {
  name: '',
  email: '',
  role: 'Counselor / Mentor',
  timezone: 'Africa/Lagos',
  bio: 'Mentor on the HELP Foundations counseling program.',
}

export default function MentorSettingsPage() {
  const [profile, setProfile] = useState<MentorProfile>(DEFAULT_PROFILE)
  const [message, setMessage] = useState<string | null>(null)
  const [isSavingAvatar, setIsSavingAvatar] = useState(false)
  const supabase = createClient()

  // Load saved profile from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(MENTOR_PROFILE_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Partial<MentorProfile>
      setProfile(prev => ({ ...prev, ...parsed }))
    } catch {
      // ignore parse errors
    }
  }, [])

  // Hydrate email from Supabase auth user so it always matches login email
  useEffect(() => {
    async function loadAuthEmail() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user?.email) {
          setProfile(prev => {
            if (prev.email === user.email) return prev
            const next = { ...prev, email: user.email as string }
            if (typeof window !== 'undefined') {
              try {
                window.localStorage.setItem(
                  MENTOR_PROFILE_STORAGE_KEY,
                  JSON.stringify(next),
                )
              } catch {
                // ignore storage errors
              }
            }
            return next
          })
        }
      } catch {
        // ignore auth errors
      }
    }

    loadAuthEmail()
  }, [supabase])

  const handleChange =
    (field: keyof MentorProfile) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value
      setProfile(prev => ({ ...prev, [field]: value }))
    }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(
          MENTOR_PROFILE_STORAGE_KEY,
          JSON.stringify(profile),
        )
      } catch {
        // ignore storage errors
      }
    }
    setMessage('Profile updated.')
    setTimeout(() => setMessage(null), 2500)
  }

  const handleReset = () => {
    setProfile(DEFAULT_PROFILE)
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(
          MENTOR_PROFILE_STORAGE_KEY,
          JSON.stringify(DEFAULT_PROFILE),
        )
      } catch {
        // ignore
      }
    }
    setMessage('Profile reset to defaults.')
    setTimeout(() => setMessage(null), 2500)
  }

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage('Please choose an image file.')
      setTimeout(() => setMessage(null), 2500)
      return
    }

    setIsSavingAvatar(true)
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result
      if (typeof result === 'string') {
        setProfile(prev => ({ ...prev, avatar: result }))
        if (typeof window !== 'undefined') {
          try {
            const stored = { ...profile, avatar: result }
            window.localStorage.setItem(
              MENTOR_PROFILE_STORAGE_KEY,
              JSON.stringify(stored),
            )
          } catch {
            // ignore storage errors
          }
        }
        setMessage('Profile photo updated.')
        setTimeout(() => setMessage(null), 2500)
      }
      setIsSavingAvatar(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-4 max-w-3xl">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Mentor profile</h1>
          <p className="text-xs text-slate-500">
            Manage your personal details that appear across the counseling portal.
          </p>
        </div>

        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            {profile.avatar ? (
              <div className="h-10 w-10 rounded-full overflow-hidden border border-slate-200 bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile.avatar}
                  alt="Mentor avatar"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-full bg-[var(--talent-primary)]/10 flex items-center justify-center">
                <UserCircle2 className="h-6 w-6 text-[var(--talent-primary)]" />
              </div>
            )}
            <div className="text-xs">
              <p className="font-semibold text-slate-900">Mentor</p>
              <p className="text-slate-500">{profile.role}</p>
            </div>
          </div>

          <div className="text-[11px] text-slate-600">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <span className="px-3 py-1 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100">
                {isSavingAvatar ? 'Uploading…' : 'Change photo'}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
            <span className="ml-2 text-[10px] text-slate-400">
              JPG or PNG, up to ~2MB.
            </span>
          </div>

          <form onSubmit={handleSave} className="grid gap-3 text-xs md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={handleChange('name')}
                placeholder="e.g. Abass Ibrahim"
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                readOnly
                className="text-xs bg-slate-50"
              />
              <p className="text-[10px] text-slate-500">
                This matches the email you use to sign in.
              </p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={profile.role}
                onChange={handleChange('role')}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={profile.timezone}
                onChange={handleChange('timezone')}
                className="text-xs"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="bio">Short bio</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={handleChange('bio')}
                rows={3}
                className="text-xs"
              />
              <p className="text-[10px] text-slate-500">
                This appears on learner‑facing pages where your profile is shown.
              </p>
            </div>
            <div className="md:col-span-2 flex items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-[11px] text-slate-600"
                onClick={handleReset}
              >
                Reset profile
              </Button>
              <Button
                type="submit"
                size="sm"
                className="text-[11px] bg-[var(--talent-primary)] hover:bg-[var(--talent-primary)]/90 text-white"
              >
                Save changes
              </Button>
              {message && (
                <span className="text-[11px] text-slate-500 ml-2">{message}</span>
              )}
            </div>
          </form>
        </Card>
      </div>
  )
}

