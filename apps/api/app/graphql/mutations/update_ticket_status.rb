module Mutations
  class UpdateTicketStatus < BaseMutation
    argument :ticket_id, ID, required: true
    argument :status, Types::TicketStatusEnum, required: true

    type Types::TicketType

    def resolve(ticket_id:, status:)
      require_agent!

      ticket = Ticket.find(ticket_id)
      ticket.status = status
      ticket.closed_at = (status == "closed" ? Time.current : nil)
      ticket.save!
      ticket
    end
  end
end
