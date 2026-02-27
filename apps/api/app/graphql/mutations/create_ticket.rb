module Mutations
  class CreateTicket < BaseMutation
    argument :subject, String, required: true
    argument :description, String, required: true

    type Types::TicketType

    def resolve(subject:, description:)
      require_customer!
      Ticket.create!(
        customer: current_user,
        subject: subject,
        description: description,
        status: :open
      )
    end
  end
end
