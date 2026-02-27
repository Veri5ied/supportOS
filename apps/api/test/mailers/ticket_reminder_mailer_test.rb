require "test_helper"

class TicketReminderMailerTest < ActionMailer::TestCase
  def test_daily_open_tickets_email
    agent = User.create!(
      email: "agent-mailer-#{SecureRandom.hex(4)}@example.com",
      password: "password123",
      password_confirmation: "password123",
      role: :agent
    )

    customer = User.create!(
      email: "customer-mailer-#{SecureRandom.hex(4)}@example.com",
      password: "password123",
      password_confirmation: "password123",
      role: :customer
    )

    ticket = Ticket.create!(
      customer: customer,
      subject: "Daily reminder ticket",
      description: "Reminder check"
    )

    mail = TicketReminderMailer.with(agent: agent, tickets: [ticket]).daily_open_tickets

    assert_equal [agent.email], mail.to
    assert_equal "Daily Open Tickets Reminder", mail.subject
    assert_includes mail.body.encoded, "Daily reminder ticket"
    assert_includes mail.body.encoded, customer.email
  end
end
