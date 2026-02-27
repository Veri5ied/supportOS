require "test_helper"

class OpenTicketsReminderJobTest < ActiveJob::TestCase
  def setup
    ActionMailer::Base.deliveries.clear
  end

  def test_sends_one_email_per_agent_with_open_tickets
    agent_one = User.create!(
      email: "agent-job-1-#{SecureRandom.hex(4)}@example.com",
      password: "password123",
      password_confirmation: "password123",
      role: :agent
    )

    agent_two = User.create!(
      email: "agent-job-2-#{SecureRandom.hex(4)}@example.com",
      password: "password123",
      password_confirmation: "password123",
      role: :agent
    )

    customer = User.create!(
      email: "customer-job-#{SecureRandom.hex(4)}@example.com",
      password: "password123",
      password_confirmation: "password123",
      role: :customer
    )

    Ticket.create!(
      customer: customer,
      subject: "Open ticket",
      description: "Should appear in reminder",
      status: :open
    )

    Ticket.create!(
      customer: customer,
      subject: "Closed ticket",
      description: "Should not appear in reminder",
      status: :closed,
      closed_at: Time.current
    )

    assert_difference -> { ActionMailer::Base.deliveries.size }, 2 do
      OpenTicketsReminderJob.perform_now
    end

    recipients = ActionMailer::Base.deliveries.flat_map(&:to)
    assert_includes recipients, agent_one.email
    assert_includes recipients, agent_two.email

    ActionMailer::Base.deliveries.each do |delivery|
      assert_includes delivery.body.encoded, "Open ticket"
      assert_not_includes delivery.body.encoded, "Closed ticket"
    end
  end
end
