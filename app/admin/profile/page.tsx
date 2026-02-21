'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { UserCircle2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

const PROFILE_EXTRA_KEY = 'ht-admin-profile-extra'

type AdminProfile = {
  name: string
  email: string
  role: string
  timezone: string
  bio: string
  avatarUrl: string | null
}

const DEFAULT_PROFILE: AdminProfile = {
  name: '',
  email: '',
  role: 'Counseling LMS administrator',
  timezone: 'Africa/Lagos',
  bio: 'Lead coordinator for the HELP Foundations counseling program.',
  avatarUrl: null,
}

export default function AdminProfilePage() {
  const supabase = createClient()
  const { toast } = useToast()
  const [profile, setProfile] = useState<AdminProfile>(DEFAULT_PROFILE)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // ── Load profile from Supabase on mount ──────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        setUserId(user.id)

        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') throw error

        // Load extra fields from localStorage (bio, timezone, role label)
        let extra: Partial<AdminProfile> = {}
        try {
          const raw = localStorage.getItem(PROFILE_EXTRA_KEY)
          if (raw) extra = JSON.parse(raw)
        } catch { /* ignore */ }

        setProfile({
          ...DEFAULT_PROFILE,
          ...extra,
          name: data?.full_name ?? extra.name ?? '',
          email: user.email ?? '',
          avatarUrl: data?.avatar_url ?? null,
        })
      } catch (e) {
        console.error(e)
        toast({ title: 'Failed to load profile.', variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange =
    (field: keyof AdminProfile) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setProfile(prev => ({ ...prev, [field]: e.target.value }))
    }

  // ── Save to profiles table + localStorage extras ──────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: profile.name.trim() || null, updated_at: new Date().toISOString() })
        .eq('id', userId)
      if (error) throw error

      // Persist display-only extras locally
      try {
        localStorage.setItem(
          PROFILE_EXTRA_KEY,
          JSON.stringify({ role: profile.role, timezone: profile.timezone, bio: profile.bio }),
        )
      } catch { /* ignore */ }

      toast({ title: 'Profile updated successfully.' })
    } catch (e) {
      console.error(e)
      toast({ title: 'Failed to save profile.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  // ── Upload avatar to Supabase Storage, then update profiles row ───────────
  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !userId) return

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Please choose an image file (JPG or PNG).', variant: 'destructive' })
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Image must be under 2 MB.', variant: 'destructive' })
      return
    }

    setUploadingAvatar(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${userId}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      const publicUrl = urlData.publicUrl

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)
      if (updateError) throw updateError

      setProfile(prev => ({ ...prev, avatarUrl: publicUrl }))
      toast({ title: 'Profile photo updated.' })
    } catch (e) {
      console.error(e)
      toast({ title: 'Failed to upload photo.', variant: 'destructive' })
    } finally {
      setUploadingAvatar(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-10 text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading profile…</span>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Admin profile</h1>
        <p className="text-xs text-slate-500">
          Manage your personal details. Name and photo are saved to the database.
        </p>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          {profile.avatarUrl ? (
            <div className="h-10 w-10 rounded-full overflow-hidden border border-slate-200 bg-slate-100">
              <img
                src={profile.avatarUrl}
                alt="Admin avatar"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
              <UserCircle2 className="h-6 w-6 text-purple-600" />
            </div>
          )}
          <div className="text-xs">
            <p className="font-semibold text-slate-900">{profile.name || 'Admin'}</p>
            <p className="text-slate-500">{profile.role}</p>
          </div>
        </div>

        <div className="text-[11px] text-slate-600">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <span className="px-3 py-1 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100">
              {uploadingAvatar ? 'Uploading…' : 'Change photo'}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={uploadingAvatar}
            />
          </label>
          <span className="ml-2 text-[10px] text-slate-400">JPG or PNG, up to 2 MB.</span>
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
              aria-readonly="true"
              className="text-xs bg-slate-50 cursor-not-allowed"
            />
            <p className="text-[10px] text-slate-500">
              This matches the email you use to sign in.
            </p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="role">Role title</Label>
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
          </div>
          <div className="md:col-span-2 flex items-center justify-end gap-2 pt-1">
            <Button
              type="submit"
              size="sm"
              disabled={saving}
              className="text-[11px] bg-purple-600 hover:bg-purple-700 text-white"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save profile'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
