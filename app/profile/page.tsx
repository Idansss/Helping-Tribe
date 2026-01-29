'use client'

import { useEffect, useState } from 'react'
import { LearnerLayout } from '@/components/learner/LearnerLayout'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserCircle2, Loader2 } from 'lucide-react'

const LEARNER_PROFILE_STORAGE_KEY = 'ht-learner-profile'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  })
  const [message, setMessage] = useState<string | null>(null)
  const [messageError, setMessageError] = useState(false)
  /** Avatar: from localStorage (same as admin) so no Supabase upload failures */
  const [localAvatar, setLocalAvatar] = useState<string | null>(null)
  const [isSavingAvatar, setIsSavingAvatar] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('Error getting user:', userError)
        setMessage('Failed to load user information.')
        setMessageError(true)
        setTimeout(() => { setMessage(null); setMessageError(false) }, 4000)
        setLoading(false)
        return
      }

      setUser(user)

      if (!user) {
        setLoading(false)
        return
      }

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        // Check if it's a "not found" error (PGRST116) or schema error
        if (error.code === 'PGRST116' || error.message?.includes('schema cache')) {
          // Profile doesn't exist, try to create it
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email ?? null,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
              phone_number: null,
              role: 'student',
            })
            .select()
            .single()
          
          if (insertError) {
            console.error('Error creating profile:', insertError)
            setMessage('Database error. The profiles table may not exist.')
            setMessageError(true)
            setTimeout(() => { setMessage(null); setMessageError(false) }, 4000)
            // Set empty profile so form can still be used
            setProfile({ id: user.id, role: 'student', full_name: '', phone: '', phone_number: '' })
            setFormData({
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
              phone: '',
            })
          } else if (newProfile) {
            setProfile(newProfile)
            setFormData({
              full_name: newProfile.full_name || '',
              phone: (newProfile.phone_number ?? newProfile.phone ?? '') as string,
            })
          }
        } else {
          console.error('Error loading profile:', error)
          setMessage(error.message || 'Failed to load profile.')
          setMessageError(true)
          setTimeout(() => { setMessage(null); setMessageError(false) }, 4000)
          // Set empty profile so form can still be used
          setProfile({ id: user.id, role: 'student', full_name: '', phone: '', phone_number: '' })
          setFormData({
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
            phone: '',
          })
        }
      } else if (profileData) {
        setProfile(profileData)
        const phoneVal = (profileData as { phone_number?: string; phone?: string }).phone_number ?? profileData.phone ?? ''
        setFormData({
          full_name: profileData.full_name || (user.user_metadata?.full_name as string) || '',
          phone: phoneVal,
        })
      }
    } catch (error: any) {
      console.error('Error loading profile:', error)
      setMessage(error?.message || 'An unexpected error occurred.')
      setMessageError(true)
      setTimeout(() => { setMessage(null); setMessageError(false) }, 4000)
    } finally {
      setLoading(false)
    }
  }

  // Hydrate local avatar from localStorage (same as admin)
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(LEARNER_PROFILE_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as { avatar?: string }
      if (parsed?.avatar && typeof parsed.avatar === 'string') {
        setLocalAvatar(parsed.avatar)
      }
    } catch {
      // ignore
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      // Use phone_number (matches create_profiles_table.sql). Legacy "phone" supported via migration.
      const { error } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            full_name: formData.full_name || null,
            phone_number: formData.phone || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      setMessage('Profile updated.')
      setMessageError(false)
      setTimeout(() => setMessage(null), 2500)

      // Sync name to header (ht-learner-profile)
      if (typeof window !== 'undefined' && formData.full_name?.trim()) {
        try {
          const existing = window.localStorage.getItem('ht-learner-profile')
          const parsed = existing ? JSON.parse(existing) : {}
          window.localStorage.setItem(
            'ht-learner-profile',
            JSON.stringify({ ...parsed, name: formData.full_name.trim() })
          )
        } catch {
          // ignore
        }
      }

      // Reload profile to get latest data
      await loadProfile()
    } catch (error: any) {
      console.error('Error updating profile:', error)
      const errorMessage = error?.message || error?.details || 'Failed to update profile. Please try again.'
      setMessage(errorMessage)
      setMessageError(true)
      setTimeout(() => { setMessage(null); setMessageError(false) }, 4000)
    } finally {
      setSaving(false)
    }
  }

  /** Same as admin: client-side only, base64 in localStorage – no Supabase upload */
  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage('Please choose an image file.')
      setMessageError(true)
      setTimeout(() => { setMessage(null); setMessageError(false) }, 2500)
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage('Image must be less than 2MB.')
      setMessageError(true)
      setTimeout(() => { setMessage(null); setMessageError(false) }, 2500)
      return
    }

    setIsSavingAvatar(true)
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result
      if (typeof result === 'string') {
        setLocalAvatar(result)
        if (typeof window !== 'undefined') {
          try {
            const raw = window.localStorage.getItem(LEARNER_PROFILE_STORAGE_KEY)
            const parsed = raw ? JSON.parse(raw) : {}
            window.localStorage.setItem(
              LEARNER_PROFILE_STORAGE_KEY,
              JSON.stringify({ ...parsed, avatar: result, name: formData.full_name || parsed?.name })
            )
          } catch {
            // ignore
          }
        }
        setMessage('Profile photo updated.')
        setMessageError(false)
        setTimeout(() => setMessage(null), 2500)
      }
      setIsSavingAvatar(false)
    }
    reader.readAsDataURL(file)
  }

  if (loading) {
    return (
      <LearnerLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </LearnerLayout>
    )
  }

  return (
    <LearnerLayout>
      <div className="space-y-4 max-w-3xl">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Learner profile</h1>
          <p className="text-xs text-slate-500">
            Manage your personal details that appear across the counseling portal.
          </p>
        </div>

        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            {localAvatar || profile?.avatar_url ? (
              <div className="h-10 w-10 rounded-full overflow-hidden border border-slate-200 bg-slate-100">
                <img
                  src={localAvatar || profile?.avatar_url}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-full bg-[var(--talent-primary)]/10 flex items-center justify-center">
                <UserCircle2 className="h-6 w-6 text-[var(--talent-primary)]" />
              </div>
            )}
            <div className="text-xs">
              <p className="font-semibold text-slate-900">
                {profile?.full_name || user?.email?.split('@')[0] || 'Learner'}
              </p>
              <p className="text-slate-500">Student</p>
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
                aria-label="Upload profile photo"
              />
            </label>
            <span className="ml-2 text-[10px] text-slate-400">
              JPG or PNG, up to ~2MB.
            </span>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-3 text-xs md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="e.g. Abass Ibrahim"
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                readOnly
                className="text-xs"
              />
              <p className="text-[10px] text-slate-500">
                This matches the email you use to sign in.
              </p>
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter your phone number"
                className="text-xs"
              />
            </div>
            <div className="md:col-span-2 flex items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-[11px] text-slate-600"
                onClick={() => {
                  const phoneVal = (profile as { phone_number?: string; phone?: string })?.phone_number ?? (profile as { phone?: string })?.phone ?? ''
                  setFormData({
                    full_name: profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
                    phone: phoneVal,
                  })
                  setMessage(null)
                }}
              >
                Reset profile
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={saving}
                className="text-[11px] bg-[var(--talent-primary)] hover:bg-[var(--talent-primary-dark)] text-white"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Saving…
                  </>
                ) : (
                  'Save profile'
                )}
              </Button>
              {message && (
                <span className={messageError ? 'text-[10px] text-red-600' : 'text-[10px] text-slate-500'}>
                  {message}
                </span>
              )}
            </div>
          </form>
        </Card>
      </div>
    </LearnerLayout>
  )
}
