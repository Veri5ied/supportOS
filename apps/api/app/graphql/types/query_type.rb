
require "csv"

module Types
  class QueryType < Types::BaseObject
    field :health_check, String, null: false
    field :me, Types::UserType, null: true
    field :agent_portal_access, String, null: false
    field :customer_portal_access, String, null: false
    field :my_tickets, [Types::TicketType], null: false
    field :all_tickets, [Types::TicketType], null: false
    field :ticket, Types::TicketType, null: false do
      argument :id, ID, required: true
    end
    field :closed_tickets_csv, String, null: false

    def health_check
      "ok"
    end

    def me
      context[:current_user]
    end

    def agent_portal_access
      authenticate_user!
      raise GraphQL::ExecutionError, "Agent access required" unless context[:current_user].agent?
      "ok"
    end

    def customer_portal_access
      authenticate_user!
      raise GraphQL::ExecutionError, "Customer access required" unless context[:current_user].customer?
      "ok"
    end

    def my_tickets
      require_customer!
      Ticket.where(customer_id: current_user.id).includes(:customer, comments: :user).order(created_at: :desc)
    end

    def all_tickets
      require_agent!
      Ticket.includes(:customer, comments: :user).order(created_at: :desc)
    end

    def ticket(id:)
      authenticate_user!
      ticket = Ticket.includes(:customer, comments: :user).find(id)
      return ticket if current_user.agent?
      raise GraphQL::ExecutionError, "Not authorized for this ticket" unless ticket.customer_id == current_user.id

      ticket
    end

    def closed_tickets_csv
      require_agent!
      tickets = Ticket.closed.includes(:customer).where("closed_at >= ?", 1.month.ago).order(closed_at: :desc)
      CSV.generate(headers: true) do |csv|
        csv << %w[id subject status customer_email closed_at created_at]
        tickets.each do |ticket|
          csv << [
            ticket.id,
            ticket.subject,
            ticket.status,
            ticket.customer.email,
            ticket.closed_at&.iso8601,
            ticket.created_at.iso8601
          ]
        end
      end
    end

    private

    def current_user
      context[:current_user]
    end
  end
end
