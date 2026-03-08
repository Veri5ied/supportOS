import type { AppUser, Role, TicketComment, TicketDetail, TicketStatus, TicketSummary } from './types'

export function toRole(input: string): Role {
  return input.toLowerCase() === 'agent' ? 'agent' : 'customer'
}

export function toStatus(input: string): TicketStatus {
  if (input.toLowerCase() === 'in_progress') return 'in_progress'
  if (input.toLowerCase() === 'closed') return 'closed'
  return 'open'
}

export function toDisplayName(email: string) {
  const local = email.split('@')[0] || ''
  const name = local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
  return name || email
}

export function toInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

export function normalizeUser(user: { id: string; email: string; role: string }): AppUser {
  const name = toDisplayName(user.email)
  return {
    id: String(user.id),
    email: user.email,
    role: toRole(user.role),
    name,
    avatarInitials: toInitials(name),
  }
}

export function normalizeTicketSummary(ticket: {
  id: string
  subject: string
  description: string
  status: string
  closedAt: string | null
  attachmentUrl: string | null
  attachmentOriginalFilename: string | null
  attachmentContentType: string | null
  attachmentBytes: number | null
  createdAt: string
  updatedAt: string
  customer: { id: string; email: string; role: string }
  comments?: Array<{ id: string }>
}): TicketSummary {
  return {
    id: String(ticket.id),
    subject: ticket.subject,
    description: ticket.description,
    status: toStatus(ticket.status),
    closedAt: ticket.closedAt,
    attachmentUrl: ticket.attachmentUrl,
    attachmentOriginalFilename: ticket.attachmentOriginalFilename,
    attachmentContentType: ticket.attachmentContentType,
    attachmentBytes: ticket.attachmentBytes,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    customer: {
      id: String(ticket.customer.id),
      email: ticket.customer.email,
      role: ticket.customer.role,
    },
    commentCount: ticket.comments?.length || 0,
  }
}

export function normalizeComment(comment: {
  id: string
  body: string
  ticketId: string
  createdAt: string
  updatedAt: string
  user: { id: string; email: string; role: string }
}): TicketComment {
  return {
    id: String(comment.id),
    body: comment.body,
    ticketId: String(comment.ticketId),
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    user: {
      id: String(comment.user.id),
      email: comment.user.email,
      role: comment.user.role,
    },
  }
}

export function normalizeTicketDetail(ticket: {
  id: string
  subject: string
  description: string
  status: string
  closedAt: string | null
  attachmentUrl: string | null
  attachmentOriginalFilename: string | null
  attachmentContentType: string | null
  attachmentBytes: number | null
  createdAt: string
  updatedAt: string
  customer: { id: string; email: string; role: string }
  comments: Array<{
    id: string
    body: string
    ticketId: string
    createdAt: string
    updatedAt: string
    user: { id: string; email: string; role: string }
  }>
}): TicketDetail {
  return {
    id: String(ticket.id),
    subject: ticket.subject,
    description: ticket.description,
    status: toStatus(ticket.status),
    closedAt: ticket.closedAt,
    attachmentUrl: ticket.attachmentUrl,
    attachmentOriginalFilename: ticket.attachmentOriginalFilename,
    attachmentContentType: ticket.attachmentContentType,
    attachmentBytes: ticket.attachmentBytes,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    customer: {
      id: String(ticket.customer.id),
      email: ticket.customer.email,
      role: ticket.customer.role,
    },
    comments: ticket.comments.map(normalizeComment),
  }
}

export function formatDate(iso: string | null) {
  if (!iso) return '-'
  return new Date(iso).toLocaleString()
}
