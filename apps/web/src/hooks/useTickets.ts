import { gqlClient } from '../api/client'
import {
  AGENT_TICKETS_QUERY,
  CLOSED_TICKETS_CSV_QUERY,
  CREATE_TICKET_MUTATION,
  CUSTOMER_TICKETS_QUERY,
  TICKET_QUERY,
  UPDATE_TICKET_STATUS_MUTATION,
} from '../api/tickets.queries'
import { useMutation, useQuery } from './useQueryShim'
import { normalizeTicketDetail, normalizeTicketSummary } from '../support/utils'
import type { Role, TicketStatus } from '../support/types'

type TicketRow = {
  id: string
  subject: string
  description: string
  status: string
  closedAt: string | null
  createdAt: string
  updatedAt: string
  customer: { id: string; email: string; role: string }
  comments: Array<{ id: string }>
}

export function useTickets(role: Role, status?: TicketStatus, enabled = true) {
  return useQuery({
    queryKey: ['tickets', role, status || 'all'],
    queryFn: async () => {
      const query = role === 'agent' ? AGENT_TICKETS_QUERY : CUSTOMER_TICKETS_QUERY
      const data = await gqlClient<{ allTickets?: TicketRow[]; myTickets?: TicketRow[] }>(
        query
      )
      const rows = role === 'agent' ? data.allTickets || [] : data.myTickets || []
      const normalized = rows.map(normalizeTicketSummary)
      return status ? normalized.filter((t) => t.status === status) : normalized
    },
    enabled,
    initialData: [],
  })
}

export function useTicket(ticketId: string | null, enabled = true) {
  return useQuery({
    queryKey: ['ticket', ticketId || 'none'],
    queryFn: async () => {
      if (!ticketId) {
        throw new Error('Ticket id is required')
      }
      const data = await gqlClient<{ ticket: Parameters<typeof normalizeTicketDetail>[0] }>(
        TICKET_QUERY,
        { id: ticketId }
      )
      return normalizeTicketDetail(data.ticket)
    },
    enabled: enabled && Boolean(ticketId),
  })
}

export function useCreateTicket(onSuccess?: () => void) {
  return useMutation(
    async (payload: { subject: string; description: string }) => {
      const data = await gqlClient<{
        createTicket: {
          id: string
          subject: string
          description: string
          status: string
          closedAt: string | null
          createdAt: string
          updatedAt: string
          customer: { id: string; email: string; role: string }
        }
      }>(CREATE_TICKET_MUTATION, payload)
      return normalizeTicketSummary({ ...data.createTicket, comments: [] })
    },
    { onSuccess: () => onSuccess?.() }
  )
}

export function useUpdateTicketStatus(onSuccess?: () => void) {
  return useMutation(
    async (payload: { ticketId: string; status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED' }) => {
      const data = await gqlClient<{
        updateTicketStatus: {
          id: string
          subject: string
          status: string
          closedAt: string | null
          updatedAt: string
        }
      }>(UPDATE_TICKET_STATUS_MUTATION, payload)
      return data.updateTicketStatus
    },
    { onSuccess: () => onSuccess?.() }
  )
}

export function useClosedTicketsCsv(enabled = true) {
  return useQuery({
    queryKey: ['closedTicketsCsv'],
    queryFn: async () => {
      const data = await gqlClient<{ closedTicketsCsv: string }>(CLOSED_TICKETS_CSV_QUERY)
      return data.closedTicketsCsv
    },
    enabled,
    initialData: '',
  })
}
