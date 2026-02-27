require "test_helper"

class UserTest < ActiveSupport::TestCase
  def test_normalizes_email
    user = User.create!(
      email: "  TeSt@Example.Com ",
      password: "password123",
      password_confirmation: "password123",
      role: :customer
    )

    assert_equal "test@example.com", user.email
  end

  def test_enforces_case_insensitive_unique_email
    User.create!(
      email: "same@example.com",
      password: "password123",
      password_confirmation: "password123",
      role: :customer
    )

    duplicate = User.new(
      email: "SAME@example.com",
      password: "password123",
      password_confirmation: "password123",
      role: :agent
    )

    assert_not duplicate.valid?
    assert_includes duplicate.errors[:email], "has already been taken"
  end

  def test_defaults_role_to_customer
    user = User.create!(
      email: "default-role@example.com",
      password: "password123",
      password_confirmation: "password123"
    )

    assert_equal "customer", user.role
  end
end
