'use client'

import { useEffect, useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Settings2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

const PORTAL_SETTINGS_STORAGE_KEY = 'ht-portal-settings'

const DEFAULT_PORTAL_SETTINGS = {
  portalName: 'Helping Tribe – Counseling LMS',
  portalDomain: 'helpingtribe.ng',
  aiFeatures: true,
  dashboardAnnouncements: true,
}

export default function AdminSettingsPage() {
  const [portalName, setPortalName] = useState(DEFAULT_PORTAL_SETTINGS.portalName)
  const [portalDomain, setPortalDomain] = useState(
    DEFAULT_PORTAL_SETTINGS.portalDomain,
  )
  const [aiFeatures, setAiFeatures] = useState(DEFAULT_PORTAL_SETTINGS.aiFeatures)
  const [dashboardAnnouncements, setDashboardAnnouncements] = useState(
    DEFAULT_PORTAL_SETTINGS.dashboardAnnouncements,
  )
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  // Load saved settings on first mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(PORTAL_SETTINGS_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Partial<typeof DEFAULT_PORTAL_SETTINGS>
      if (!parsed) return
      if (parsed.portalName) setPortalName(parsed.portalName)
      if (parsed.portalDomain) setPortalDomain(parsed.portalDomain)
      if (typeof parsed.aiFeatures === 'boolean') setAiFeatures(parsed.aiFeatures)
      if (typeof parsed.dashboardAnnouncements === 'boolean') {
        setDashboardAnnouncements(parsed.dashboardAnnouncements)
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  // Persist settings whenever they change
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const payload = {
        portalName,
        portalDomain,
        aiFeatures,
        dashboardAnnouncements,
      }
      window.localStorage.setItem(
        PORTAL_SETTINGS_STORAGE_KEY,
        JSON.stringify(payload),
      )
    } catch {
      // ignore storage errors in demo
    }
  }, [portalName, portalDomain, aiFeatures, dashboardAnnouncements])

  const handleSavePortal = (e: React.FormEvent) => {
    e.preventDefault()
    setSaveMessage('Portal settings saved.')
    setTimeout(() => setSaveMessage(null), 2500)
  }

  const handleResetDefaults = () => {
    setPortalName(DEFAULT_PORTAL_SETTINGS.portalName)
    setPortalDomain(DEFAULT_PORTAL_SETTINGS.portalDomain)
    setAiFeatures(DEFAULT_PORTAL_SETTINGS.aiFeatures)
    setDashboardAnnouncements(DEFAULT_PORTAL_SETTINGS.dashboardAnnouncements)
    setSaveMessage('Portal settings reset to defaults.')
    setTimeout(() => setSaveMessage(null), 2500)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            Account &amp; settings
          </h1>
          <p className="text-xs text-slate-500">
            Configure your HELPING TRIBE portal, user types, courses, skills,
            security and integrations.
          </p>
        </div>
      </div>

      <Card className="p-4">
        <Tabs defaultValue="portal" className="space-y-4">
          <TabsList className="flex flex-wrap justify-start gap-1 bg-slate-50 rounded-lg p-1">
            <TabsTrigger value="portal" className="text-xs px-3 py-1.5">
              Portal
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs px-3 py-1.5">
              Users
            </TabsTrigger>
            <TabsTrigger value="user-types" className="text-xs px-3 py-1.5">
              User types
            </TabsTrigger>
            <TabsTrigger value="courses" className="text-xs px-3 py-1.5">
              Courses
            </TabsTrigger>
            <TabsTrigger value="categories" className="text-xs px-3 py-1.5">
              Categories
            </TabsTrigger>
            <TabsTrigger value="skills" className="text-xs px-3 py-1.5">
              Skills
            </TabsTrigger>
            <TabsTrigger value="integrations" className="text-xs px-3 py-1.5">
              Integrations
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs px-3 py-1.5">
              Security
            </TabsTrigger>
            <TabsTrigger value="import-export" className="text-xs px-3 py-1.5">
              Import‑Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="portal" className="text-xs text-slate-600 space-y-3">
            <div className="flex items-center gap-2 text-slate-700">
              <Settings2 className="h-4 w-4 text-[var(--talent-primary)]" />
              <span className="font-medium text-sm">
                Portal identity &amp; branding
              </span>
            </div>

            <form onSubmit={handleSavePortal} className="grid gap-3 md:grid-cols-2 text-xs">
              <div className="space-y-1">
                <label
                  htmlFor="portal-name"
                  className="text-[11px] font-medium text-slate-700"
                >
                  Portal name
                </label>
                <Input
                  id="portal-name"
                  value={portalName}
                  onChange={e => setPortalName(e.target.value)}
                  className="text-xs"
                />
                <p className="text-[10px] text-slate-500">
                  Shown on the login page and browser tab title.
                </p>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="portal-domain"
                  className="text-[11px] font-medium text-slate-700"
                >
                  Base domain
                </label>
                <Input
                  id="portal-domain"
                  value={portalDomain}
                  onChange={e => setPortalDomain(e.target.value)}
                  className="text-xs"
                />
                <p className="text-[10px] text-slate-500">
                  Used for links in emails and certificates.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  <div>
                    <p className="text-[11px] font-medium text-slate-800">
                      Dashboard announcements
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Show short messages on the admin and learner dashboards.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={dashboardAnnouncements}
                      onCheckedChange={setDashboardAnnouncements}
                      className="scale-125 data-[state=unchecked]:bg-slate-200 data-[state=checked]:bg-[var(--talent-primary)]"
                    />
                    <span className="text-[10px] text-slate-600 min-w-[24px] text-right">
                      {dashboardAnnouncements ? 'On' : 'Off'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  <div>
                    <p className="text-[11px] font-medium text-slate-800">
                      AI assistance
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Enable AI‑powered skill suggestions and copy helpers.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={aiFeatures}
                      onCheckedChange={setAiFeatures}
                      className="scale-125 data-[state=unchecked]:bg-slate-200 data-[state=checked]:bg-[var(--talent-primary)]"
                    />
                    <span className="text-[10px] text-slate-600 min-w-[24px] text-right">
                      {aiFeatures ? 'On' : 'Off'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-[11px] text-slate-600"
                  onClick={handleResetDefaults}
                >
                  Reset to defaults
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="text-[11px] bg-[var(--talent-primary)] hover:bg-[var(--talent-primary-dark)] text-white"
                >
                  Save portal settings
                </Button>
                {saveMessage && (
                  <span className="text-[10px] text-slate-500">{saveMessage}</span>
                )}
              </div>
            </form>
          </TabsContent>

          <TabsContent value="users" className="text-xs text-slate-600 space-y-1">
            <p>Control user creation rules, defaults, login options and terms of service.</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Default user type for new registrations (e.g. Learner).</li>
              <li>Simple learner dashboard home (“My courses” vs full dashboard).</li>
              <li>Portal-wide default timezone with per-user overrides.</li>
              <li>SSO behaviour when using external identity providers.</li>
              <li>First-login Terms of Service acceptance and tracking.</li>
              <li>Custom user fields (department, employee ID, cohort, etc.).</li>
            </ul>
          </TabsContent>

          <TabsContent value="user-types" className="text-xs text-slate-600">
            Define permissions for SuperAdmin, Admin, Instructor and Learner roles.
          </TabsContent>

          <TabsContent value="courses" className="text-xs text-slate-600">
            Manage catalog visibility, course settings and certificates.
          </TabsContent>

          <TabsContent value="categories" className="text-xs text-slate-600">
            Organize courses into categories such as Foundations, Ethics, Practicum,
            Community Support.
          </TabsContent>

          <TabsContent value="skills" className="text-xs text-slate-600">
            Configure skill and assessment settings, including AI-supported skill
            suggestions.
          </TabsContent>

          {/* Gamification and E-commerce tabs removed per product scope */}

          <TabsContent value="integrations" className="text-xs text-slate-600">
            Connect to messaging platforms, HR systems or partner portals.
          </TabsContent>

          <TabsContent value="security" className="text-xs text-slate-600">
            Configure security policies, MFA, password rules and data protection.
          </TabsContent>

          <TabsContent value="import-export" className="text-xs text-slate-600">
            Import or export users, enrollments and progress data.
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

