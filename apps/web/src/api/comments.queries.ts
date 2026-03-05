export const CREATE_COMMENT_MUTATION = `
  mutation AddComment($ticketId: ID!, $body: String!) {
    addComment(input: { ticketId: $ticketId, body: $body }) {
      id
      body
      ticketId
      createdAt
      updatedAt
      user {
        id
        email
        role
      }
    }
  }
`
