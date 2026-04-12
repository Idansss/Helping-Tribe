export const APPLICATION_DRAFT_ID_STORAGE_KEY = 'ht_apply_draft_id'
export const APPLICATION_DRAFT_TOKEN_STORAGE_KEY = 'ht_apply_draft_token'
export const APPLICATION_DRAFT_CACHE_STORAGE_KEY = 'ht_apply_form_cache'

export const APPLICATION_DRAFT_ID_QUERY_PARAM = 'draft'
export const APPLICATION_DRAFT_TOKEN_QUERY_PARAM = 'token'

export function buildDraftResumePath(draftId: string, draftToken: string) {
  const params = new URLSearchParams({
    [APPLICATION_DRAFT_ID_QUERY_PARAM]: draftId,
    [APPLICATION_DRAFT_TOKEN_QUERY_PARAM]: draftToken,
  })

  return `/apply?${params.toString()}`
}
