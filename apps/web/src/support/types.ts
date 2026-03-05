export type Role = 'agent' | 'customer'

export type TicketStatus = 'open' | 'in_progress' | 'closed'

export interface AppUser {
  id: string
  email: string
  role: Role
  name: string
  avatarInitials: string
}

export interface TicketCustomer {
  id: string
  email: string
  role: string
}

export interface TicketSummary {
  id: string
  subject: string
  description: string
  status: TicketStatus
  closedAt: string | null
  createdAt: string
  updatedAt: string
  commentCount: number
  customer: TicketCustomer
}

export interface TicketComment {
  id: string
  body: string
  ticketId: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    email: string
    role: string
  }
}

export interface TicketDetail {
  id: string
  subject: string
  description: string
  status: TicketStatus
  closedAt: string | null
  createdAt: string
  updatedAt: string
  customer: TicketCustomer
  comments: TicketComment[]
}
