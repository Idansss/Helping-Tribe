'use client'

/**
 * @deprecated Prefer `MessagingWorkspace` from `@/components/messaging`.
 * Kept as a thin compatibility wrapper for existing imports.
 */
export { MessagingWorkspace as MessageInbox } from '@/components/messaging/MessagingWorkspace'
export type {
  Conversation,
  MessageRow,
  MessageRecipientOption as RecipientOption,
} from '@/components/messaging/messaging-types'
