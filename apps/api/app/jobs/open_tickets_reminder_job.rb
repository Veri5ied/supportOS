class OpenTicketsReminderJob < ApplicationJob
  queue_as :default

  def perform
    tickets = Ticket.open.includes(:customer).order(created_at: :asc)
    User.agent.find_each do |agent|
      TicketReminderMailer.with(agent: agent, tickets: tickets).daily_open_tickets.deliver_now
    end
  end
end
