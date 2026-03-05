export const AGENT_TICKETS_QUERY = `
  query AgentTickets {
    allTickets {
      id
      subject
      description
      status
      closedAt
      createdAt
      updatedAt
      customer {
        id
        email
        role
      }
      comments {
        id
      }
    }
  }
`

export const CUSTOMER_TICKETS_QUERY = `
  query CustomerTickets {
    myTickets {
      id
      subject
      description
      status
      closedAt
      createdAt
      updatedAt
      customer {
        id
        email
        role
      }
      comments {
        id
      }
    }
  }
`

export const TICKET_QUERY = `
  query Ticket($id: ID!) {
    ticket(id: $id) {
      id
      subject
      description
      status
      closedAt
      createdAt
      updatedAt
      customer {
        id
        email
        role
      }
      comments {
        id
        body
        ticketId
        createdAt
        updatedAt
        user {
          id
          email
          role
        }
      }
    }
  }
`

export const CREATE_TICKET_MUTATION = `
  mutation CreateTicket($subject: String!, $description: String!) {
    createTicket(input: { subject: $subject, description: $description }) {
      id
      subject
      description
      status
      closedAt
      createdAt
      updatedAt
      customer {
        id
        email
        role
      }
    }
  }
`

export const UPDATE_TICKET_STATUS_MUTATION = `
  mutation UpdateTicketStatus($ticketId: ID!, $status: TicketStatusEnum!) {
    updateTicketStatus(input: { ticketId: $ticketId, status: $status }) {
      id
      subject
      status
      closedAt
      updatedAt
    }
  }
`

export const CLOSED_TICKETS_CSV_QUERY = `
  query ClosedTicketsCsv {
    closedTicketsCsv
  }
`
