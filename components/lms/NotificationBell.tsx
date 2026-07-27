'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Bell, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'

export type NotificationRow = {
  id: string
  user_id: string
  type: string
  title: string
  body: string | null
  link: string | null
  read_at: string | null
  created_at: string
}

/** Resolve messages URL for current portal when notification link is empty (e.g. message type). */
function getMessagesHref(pathname: string | null): string {
  if (pathname?.startsWith('/admin')) return '/admin/messages'
  if (pathname?.startsWith('/mentor')) return '/mentor/messages'
  if (pathname?.startsWith('/learner')) return '/learner/messages'
  return '/learner/messages'
}

interface NotificationBellProps {
  /** Optional class for the bell button */
  className?: string
  /** Icon size */
  iconSize?: 'sm' | 'md'
}

export function NotificationBell({ className, iconSize = 'md' }: NotificationBellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [list, setList] = useState<NotificationRow[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const messagesHref = getMessagesHref(pathname)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null))
  }, [supabase])

  useEffect(() => {
    if (!userId) return
    loadNotifications()
  }, [userId])

  useEffect(() => {
    if (open && userId) loadNotifications()
  }, [open, userId])

  async function loadNotifications() {
    if (!userId) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('id, user_id, type, title, body, link, read_at, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30)

      if (error) throw error
      const rows = (data ?? []) as NotificationRow[]
      setList(rows)
      setUnreadCount(rows.filter((n) => !n.read_at).length)
    } catch (e) {
      console.error(e)
      setList([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }

  async function markRead(id: string) {
    if (!userId) return
    try {
      await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId)
      loadNotifications()
    } catch (e) {
      console.error(e)
    }
  }

  async function markAllRead() {
    if (!userId) return
    try {
      await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .is('read_at', null)
      loadNotifications()
    } catch (e) {
      console.error(e)
    }
  }

  function goToNotification(n: NotificationRow) {
    const href = n.link && n.link.trim() ? n.link : (n.type === 'message' ? messagesHref : null)
    if (href) router.push(href)
    if (!n.read_at) markRead(n.id)
    setOpen(false)
  }

  const iconClass = iconSize === 'sm' ? 'h-4 w-4' : 'h-5 w-5'

  return (
    <div className="relative" data-dropdown>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={className ?? 'rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'}
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell className={iconClass} />
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground ring-2 ring-background">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div role="dialog" aria-label="Notifications" className="absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="text-xs font-semibold text-popover-foreground">Notifications</span>
              {unreadCount > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[10px] text-muted-foreground"
                  onClick={markAllRead}
                >
                  Mark all read
                </Button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : list.length === 0 ? (
                <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                  No notifications yet.
                </div>
              ) : (
                list.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => goToNotification(n)}
                    className={`w-full border-b border-border px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-accent ${
                      !n.read_at ? 'bg-primary/10' : ''
                    }`}
                  >
                    <p className="text-[11px] font-medium text-popover-foreground">{n.title}</p>
                    {n.body && (
                      <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{n.body}</p>
                    )}
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
