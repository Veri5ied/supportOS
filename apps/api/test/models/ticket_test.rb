require "test_helper"

class TicketTest < ActiveSupport::TestCase
  def test_requires_subject
    customer = create_customer

    ticket = Ticket.new(
      customer: customer,
      description: "Need help",
      status: :open
    )

    assert_not ticket.valid?
    assert_includes ticket.errors[:subject], "can't be blank"
  end

  def test_requires_description
    customer = create_customer

    ticket = Ticket.new(
      customer: customer,
      subject: "Login issue",
      status: :open
    )

    assert_not ticket.valid?
    assert_includes ticket.errors[:description], "can't be blank"
  end

  def test_defaults_status_to_open
    customer = create_customer

    ticket = Ticket.create!(
      customer: customer,
      subject: "Payment issue",
      description: "Card declined"
    )

    assert_equal "open", ticket.status
  end

  private

  def create_customer
    User.create!(
      email: "customer-ticket-#{SecureRandom.hex(4)}@example.com",
      password: "password123",
      password_confirmation: "password123",
      role: :customer
    )
  end
end
