require "test_helper"

class CommentTest < ActiveSupport::TestCase
  def test_requires_body
    customer = User.create!(
      email: "customer-comment-#{SecureRandom.hex(4)}@example.com",
      password: "password123",
      password_confirmation: "password123",
      role: :customer
    )

    ticket = Ticket.create!(
      customer: customer,
      subject: "Password reset",
      description: "Cannot reset password"
    )

    comment = Comment.new(ticket: ticket, user: customer)

    assert_not comment.valid?
    assert_includes comment.errors[:body], "can't be blank"
  end

  def test_is_valid_with_required_fields
    customer = User.create!(
      email: "customer-comment-valid-#{SecureRandom.hex(4)}@example.com",
      password: "password123",
      password_confirmation: "password123",
      role: :customer
    )

    ticket = Ticket.create!(
      customer: customer,
      subject: "Billing",
      description: "Invoice mismatch"
    )

    comment = Comment.new(ticket: ticket, user: customer, body: "Any update?")

    assert comment.valid?
  end
end
