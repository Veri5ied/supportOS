module Mutations
  class AddComment < BaseMutation
    argument :ticket_id, ID, required: true
    argument :body, String, required: true

    type Types::CommentType

    def resolve(ticket_id:, body:)
      authenticate_user!

      ticket = Ticket.find(ticket_id)

      if current_user.customer?
        raise GraphQL::ExecutionError, "Not authorized for this ticket" unless ticket.customer_id == current_user.id

        agent_commented = ticket.comments.joins(:user).where(users: { role: User.roles[:agent] }).exists?
        raise GraphQL::ExecutionError, "Customer can comment only after an agent comment" unless agent_commented
      end

      ticket.comments.create!(user: current_user, body: body)
    end
  end
end
