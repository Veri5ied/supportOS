class TicketReminderMailer < ApplicationMailer
  def daily_open_tickets
    @agent = params[:agent]
    @tickets = params[:tickets]
    mail(to: @agent.email, subject: "Daily Open Tickets Reminder")
  end
end
