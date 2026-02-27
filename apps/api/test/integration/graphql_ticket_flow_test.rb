require "test_helper"

class GraphqlTicketFlowTest < ActionDispatch::IntegrationTest
  def setup
    @customer = create_user(role: :customer)
    @other_customer = create_user(role: :customer)
    @agent = create_user(role: :agent)
    @customer_token = AuthToken.encode({ user_id: @customer.id })
    @other_customer_token = AuthToken.encode({ user_id: @other_customer.id })
    @agent_token = AuthToken.encode({ user_id: @agent.id })
  end

  def test_customer_creates_and_views_own_ticket
    create_result = execute_graphql(
      query: <<~GQL,
        mutation($subject: String!, $description: String!) {
          createTicket(input: { subject: $subject, description: $description }) {
            id
            subject
            status
          }
        }
      GQL
      variables: {
        subject: "Cannot access account",
        description: "I am locked out"
      },
      token: @customer_token
    )

    assert_nil create_result["errors"]
    ticket_id = create_result.dig("data", "createTicket", "id")
    assert_equal "OPEN", create_result.dig("data", "createTicket", "status")

    my_tickets_result = execute_graphql(
      query: <<~GQL,
        query {
          myTickets {
            id
            subject
          }
        }
      GQL
      token: @customer_token
    )

    assert_nil my_tickets_result["errors"]
    assert_includes my_tickets_result.dig("data", "myTickets").map { |t| t["id"] }, ticket_id

    unauthorized_view_result = execute_graphql(
      query: <<~GQL,
        query($id: ID!) {
          ticket(id: $id) {
            id
          }
        }
      GQL
      variables: { id: ticket_id },
      token: @other_customer_token
    )

    assert_includes unauthorized_view_result.dig("errors", 0, "message"), "Not authorized for this ticket"
  end

  def test_comment_rule_status_update_and_csv_export
    ticket = Ticket.create!(
      customer: @customer,
      subject: "Checkout failure",
      description: "Payment keeps failing"
    )

    early_customer_comment = execute_graphql(
      query: <<~GQL,
        mutation($ticketId: ID!, $body: String!) {
          addComment(input: { ticketId: $ticketId, body: $body }) {
            id
          }
        }
      GQL
      variables: {
        ticketId: ticket.id,
        body: "Any update?"
      },
      token: @customer_token
    )

    assert_includes early_customer_comment.dig("errors", 0, "message"), "Customer can comment only after an agent comment"

    agent_comment = execute_graphql(
      query: <<~GQL,
        mutation($ticketId: ID!, $body: String!) {
          addComment(input: { ticketId: $ticketId, body: $body }) {
            id
            body
          }
        }
      GQL
      variables: {
        ticketId: ticket.id,
        body: "Please retry now"
      },
      token: @agent_token
    )

    assert_nil agent_comment["errors"]

    customer_comment = execute_graphql(
      query: <<~GQL,
        mutation($ticketId: ID!, $body: String!) {
          addComment(input: { ticketId: $ticketId, body: $body }) {
            id
            body
          }
        }
      GQL
      variables: {
        ticketId: ticket.id,
        body: "It worked"
      },
      token: @customer_token
    )

    assert_nil customer_comment["errors"]

    close_result = execute_graphql(
      query: <<~GQL,
        mutation($ticketId: ID!, $status: TicketStatusEnum!) {
          updateTicketStatus(input: { ticketId: $ticketId, status: $status }) {
            id
            status
            closedAt
          }
        }
      GQL
      variables: {
        ticketId: ticket.id,
        status: "CLOSED"
      },
      token: @agent_token
    )

    assert_nil close_result["errors"]
    assert_equal "CLOSED", close_result.dig("data", "updateTicketStatus", "status")
    assert close_result.dig("data", "updateTicketStatus", "closedAt").present?

    csv_result = execute_graphql(
      query: <<~GQL,
        query {
          closedTicketsCsv
        }
      GQL
      token: @agent_token
    )

    assert_nil csv_result["errors"]
    csv_data = csv_result.dig("data", "closedTicketsCsv")
    assert_includes csv_data, "Checkout failure"
    assert_includes csv_data, @customer.email
  end

  private

  def create_user(role:)
    User.create!(
      email: "#{role}-#{SecureRandom.hex(4)}@example.com",
      password: "password123",
      password_confirmation: "password123",
      role: role
    )
  end

  def execute_graphql(query:, variables: {}, token: nil)
    headers = { "Content-Type" => "application/json" }
    headers["Authorization"] = "Bearer #{token}" if token

    post "/graphql", params: { query: query, variables: variables }.to_json, headers: headers

    JSON.parse(response.body)
  end
end
