require "test_helper"

class GraphqlAuthFlowTest < ActionDispatch::IntegrationTest
  def test_sign_up_returns_token_and_user
    result = execute_graphql(
      query: <<~GQL,
        mutation($email: String!, $password: String!, $passwordConfirmation: String!, $role: UserRoleEnum!) {
          signUp(input: { email: $email, password: $password, passwordConfirmation: $passwordConfirmation, role: $role }) {
            token
            user {
              email
              role
            }
          }
        }
      GQL
      variables: {
        email: "signup-#{SecureRandom.hex(4)}@example.com",
        password: "password123",
        passwordConfirmation: "password123",
        role: "AGENT"
      }
    )

    assert_nil result["errors"]
    assert result.dig("data", "signUp", "token").present?
    assert_equal "AGENT", result.dig("data", "signUp", "user", "role")
  end

  def test_sign_in_returns_token_for_existing_user
    user = User.create!(
      email: "signin-#{SecureRandom.hex(4)}@example.com",
      password: "password123",
      password_confirmation: "password123",
      role: :customer
    )

    result = execute_graphql(
      query: <<~GQL,
        mutation($email: String!, $password: String!) {
          signIn(input: { email: $email, password: $password }) {
            token
            user {
              id
              email
              role
            }
          }
        }
      GQL
      variables: {
        email: user.email,
        password: "password123"
      }
    )

    assert_nil result["errors"]
    assert result.dig("data", "signIn", "token").present?
    assert_equal user.email, result.dig("data", "signIn", "user", "email")
    assert_equal "CUSTOMER", result.dig("data", "signIn", "user", "role")
  end

  def test_sign_in_rejects_invalid_credentials
    User.create!(
      email: "invalid-#{SecureRandom.hex(4)}@example.com",
      password: "password123",
      password_confirmation: "password123",
      role: :customer
    )

    result = execute_graphql(
      query: <<~GQL,
        mutation($email: String!, $password: String!) {
          signIn(input: { email: $email, password: $password }) {
            token
          }
        }
      GQL
      variables: {
        email: User.last.email,
        password: "wrong-password"
      }
    )

    assert_includes result.dig("errors", 0, "message"), "Invalid credentials"
  end

  private

  def execute_graphql(query:, variables: {}, token: nil)
    headers = { "Content-Type" => "application/json" }
    headers["Authorization"] = "Bearer #{token}" if token

    post "/graphql", params: { query: query, variables: variables }.to_json, headers: headers

    JSON.parse(response.body)
  end
end
