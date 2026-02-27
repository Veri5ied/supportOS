
module Types
  class MutationType < Types::BaseObject
    field :sign_up, mutation: Mutations::SignUp
    field :sign_in, mutation: Mutations::SignIn
    field :create_ticket, mutation: Mutations::CreateTicket
    field :add_comment, mutation: Mutations::AddComment
    field :update_ticket_status, mutation: Mutations::UpdateTicketStatus
  end
end
