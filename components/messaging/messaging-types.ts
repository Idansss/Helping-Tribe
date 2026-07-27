export type MessageRow = {
  id: string
  sender_id: string
  recipient_id: string
  body: string
  read_at: string | null
  created_at: string
}

export type Conversation = {
  otherId: string
  otherName: string
  otherRole: string | null
  otherAvatarUrl: string | null
  lastMessage: string
  lastAt: string
  unreadCount: number
}

export type MessageRecipientOption = {
  id: string
  name: string
  role?: string | null
  avatarUrl?: string | null
  /** Display label; defaults to name (role) when omitted */
  label?: string
}

export type MessagingRoleVariant = 'admin' | 'mentor' | 'learner'

export type OptimisticStatus = 'sending' | 'sent' | 'failed'

export type ThreadMessage = MessageRow & {
  optimisticStatus?: OptimisticStatus
  clientKey?: string
}

export type ConversationFilter = 'all' | 'unread'

export type DateGroup = {
  key: string
  label: string
  messages: ThreadMessage[]
}

export type MessagingWorkspaceProps = {
  canCompose?: boolean
  initialToId?: string | null
  recipientOptions?: MessageRecipientOption[]
  roleVariant?: MessagingRoleVariant
  emptyMessage?: string
}
