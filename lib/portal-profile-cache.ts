export type PortalProfileCache = {
  name?: string
  avatar?: string
}

export const PORTAL_PROFILE_UPDATED_EVENT = 'ht-profile-updated'

export function readPortalProfileCache(storageKey: string): PortalProfileCache {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as PortalProfileCache
    return {
      name: typeof parsed.name === 'string' ? parsed.name.trim() : undefined,
      avatar: typeof parsed.avatar === 'string' ? parsed.avatar.trim() : undefined,
    }
  } catch {
    return {}
  }
}

export function writePortalProfileCache(
  storageKey: string,
  patch: { name?: string | null; avatar?: string | null },
  options?: { silent?: boolean }
) {
  if (typeof window === 'undefined') return
  try {
    const current = readPortalProfileCache(storageKey)
    const next: PortalProfileCache = {
      name: patch.name !== undefined ? patch.name?.trim() || undefined : current.name,
      avatar: patch.avatar !== undefined ? patch.avatar?.trim() || undefined : current.avatar,
    }
    const unchanged = current.name === next.name && current.avatar === next.avatar
    window.localStorage.setItem(storageKey, JSON.stringify(next))
    if (!options?.silent && !unchanged) {
      window.dispatchEvent(new CustomEvent(PORTAL_PROFILE_UPDATED_EVENT, { detail: { storageKey } }))
    }
  } catch {
    // Cache sync is best-effort.
  }
}
