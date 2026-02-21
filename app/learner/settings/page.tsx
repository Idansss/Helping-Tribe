'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { UserCircle2, Loader2, Bell, Eye, EyeOff, LogOut, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

type LearnerProfile = {
  fullName: string
  email: string
  avatarUrl: string | null
  role: string
}

const NOTIF_KEY = 'ht-learner-notif-prefs'

type NotifPrefs = {
  emailDigest: boolean
  quizReminders: boolean
  journalReminders: boolean
}

const DEFAULT_NOTIF: NotifPrefs = {
  emailDigest: true,
  quizReminders: true,
  journalReminders: false,
}

export default function LearnerSettingsPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const router = useRouter()

  const [profile, setProfile] = useState<LearnerProfile>({ fullName: '', email: '', avatarUrl: null, role: 'student' })
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Password change
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [changingPw, setChangingPw] = useState(false)

  // Notifications
  const [notif, setNotif] = useState<NotifPrefs>(DEFAULT_NOTIF)

  // Delete account confirmation
  const [deleteOpen, setDeleteOpen] = useState(false)

  // ── Load profile ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }
        setUserId(user.id)

        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, role')
          .eq('id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') throw error

        setProfile({
          fullName: data?.full_name ?? '',
          email: user.email ?? '',
          avatarUrl: data?.avatar_url ?? null,
          role: data?.role ?? 'student',
        })

        // Load notification preferences from localStorage
        try {
          const raw = localStorage.getItem(NOTIF_KEY)
          if (raw) setNotif({ ...DEFAULT_NOTIF, ...JSON.parse(raw) })
        } catch { /* ignore */ }
      } catch (e) {
        console.error(e)
        toast({ title: 'Failed to load settings.', variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Save profile ──────────────────────────────────────────────────────────
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: profile.fullName.trim() || null, updated_at: new Date().toISOString() })
        .eq('id', userId)
      if (error) throw error
      toast({ title: 'Profile saved.' })
    } catch (e) {
      console.error(e)
      toast({ title: 'Failed to save profile.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  // ── Upload avatar ─────────────────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Please choose an image file.', variant: 'destructive' })
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

      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type })
      if (uploadErr) throw uploadErr

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      const publicUrl = urlData.publicUrl

      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)
      if (updateErr) throw updateErr

      setProfile(prev => ({ ...prev, avatarUrl: publicUrl }))
      toast({ title: 'Profile photo updated.' })
    } catch (e) {
      console.error(e)
      toast({ title: 'Failed to upload photo.', variant: 'destructive' })
    } finally {
      setUploadingAvatar(false)
    }
  }

  // ── Change password ───────────────────────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 8) {
      toast({ title: 'Password must be at least 8 characters.', variant: 'destructive' })
      return
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords do not match.', variant: 'destructive' })
      return
    }
    setChangingPw(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setNewPassword('')
      setConfirmPassword('')
      toast({ title: 'Password updated successfully.' })
    } catch (e: any) {
      console.error(e)
      toast({ title: e?.message ?? 'Failed to update password.', variant: 'destructive' })
    } finally {
      setChangingPw(false)
    }
  }

  // ── Notification prefs ────────────────────────────────────────────────────
  const saveNotif = (updated: NotifPrefs) => {
    setNotif(updated)
    try { localStorage.setItem(NOTIF_KEY, JSON.stringify(updated)) } catch { /* ignore */ }
    toast({ title: 'Notification preferences saved.' })
  }

  // ── Sign out ──────────────────────────────────────────────────────────────
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-10 text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading settings…</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your account, password, and notification preferences.</p>
      </div>

      {/* ── Profile ── */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">Profile</h2>
        <div className="flex items-center gap-4">
          {profile.avatarUrl ? (
            <div className="h-14 w-14 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
              <img src={profile.avatarUrl} alt="Your avatar" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="h-14 w-14 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
              <UserCircle2 className="h-8 w-8 text-purple-600" />
            </div>
          )}
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-900">{profile.fullName || 'Learner'}</p>
            <p className="text-xs text-slate-500">{profile.email}</p>
            <Badge variant="outline" className="text-[10px] capitalize">{profile.role}</Badge>
          </div>
        </div>

        <div className="text-[11px] text-slate-600">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <span className="px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs">
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

        <form onSubmit={handleSaveProfile} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="fullName" className="text-xs">Display name</Label>
            <Input
              id="fullName"
              value={profile.fullName}
              onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
              placeholder="Your full name"
              className="text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              readOnly
              aria-readonly="true"
              className="text-sm bg-slate-50 cursor-not-allowed"
            />
            <p className="text-[10px] text-slate-500">Your email cannot be changed here.</p>
          </div>
          <Button type="submit" size="sm" disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save profile'}
          </Button>
        </form>
      </Card>

      {/* ── Change password ── */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">Change password</h2>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="newPassword" className="text-xs">New password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPw ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="text-sm pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirmPassword" className="text-xs">Confirm password</Label>
            <Input
              id="confirmPassword"
              type={showPw ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              className="text-sm"
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" size="sm" disabled={changingPw} variant="outline">
            {changingPw ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Update password'}
          </Button>
        </form>
      </Card>

      {/* ── Notification preferences ── */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">Notifications</h2>
        </div>
        <div className="space-y-3">
          {(
            [
              { key: 'emailDigest', label: 'Weekly email digest', description: 'A summary of your learning progress each week' },
              { key: 'quizReminders', label: 'Quiz reminders', description: 'Remind me about upcoming or incomplete quizzes' },
              { key: 'journalReminders', label: 'Journal reminders', description: 'Prompt me to write my learning journal entry' },
            ] as Array<{ key: keyof NotifPrefs; label: string; description: string }>
          ).map(({ key, label, description }) => (
            <label key={key} className="flex items-center justify-between gap-4 cursor-pointer">
              <div>
                <p className="text-sm text-slate-800">{label}</p>
                <p className="text-[11px] text-slate-500">{description}</p>
              </div>
              <input
                type="checkbox"
                checked={notif[key]}
                onChange={(e) => saveNotif({ ...notif, [key]: e.target.checked })}
                className="h-4 w-4 accent-purple-600 rounded shrink-0"
              />
            </label>
          ))}
        </div>
      </Card>

      {/* ── Account actions ── */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">Account</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="flex items-center gap-2 text-slate-700"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete account
          </Button>
        </div>
        <p className="text-[10px] text-slate-400">
          Deleting your account will permanently remove all your progress, journals, and submissions. Contact your program coordinator if you need help.
        </p>
      </Card>

      {/* ── Delete account confirmation dialog ── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              All your learning progress, quiz results, journal entries, and file submissions will be permanently deleted. This cannot be undone. Please contact your program coordinator to request deletion.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                setDeleteOpen(false)
                toast({ title: 'Please contact your program coordinator to delete your account.' })
              }}
            >
              I understand — delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
